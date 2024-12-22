import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operation } from './entities/operation.entity';
import { CreateOperationDto } from './dtos/create-operation.dto';
import { UpdateOperationDto } from './dtos/update-operation.dto';
import { Transport } from '../transports/entitites/transport.entity';
import OpenAI from 'openai';
import { z } from 'zod';
import { OperationTypesEnum } from './constants/operation-types.enum';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ConfigService } from '@nestjs/config';
import { ITokenUser } from '../auth/types/token-user.type';
import { Role } from '../auth/constants/roles.enum';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private operationRepository: Repository<Operation>,
    @InjectRepository(Transport)
    private transportRepository: Repository<Transport>,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private parseOperationBody(
    operation: CreateOperationDto | UpdateOperationDto,
  ): Operation {
    const preparedOperation = {
      ...operation,
    } as unknown as Operation;

    if (preparedOperation.transports) {
      preparedOperation.transports = preparedOperation.transports.map(
        (transportId) =>
          this.transportRepository.create({
            id: transportId as unknown as number,
          }),
      );
    }

    return preparedOperation;
  }

  async getAllOperations(tokenUser: ITokenUser): Promise<Operation[]> {
    if (tokenUser.role === Role.DISPATCHER) {
      return this.operationRepository.find();
    }

    const user = await this.authService.getUserByIdOrThrow(tokenUser.id);

    if (!user.serviceType) {
      return this.operationRepository.find();
    }

    return this.operationRepository.find({
      where: {
        transports: {
          type: user.serviceType,
        },
      },
      relations: ['transports'],
    });
  }

  async getSingleOperation(id: number): Promise<Operation> {
    const transport = await this.operationRepository.findOne({
      where: { id },
      relations: { transports: true },
    });
    if (!transport) {
      throw new NotFoundException(`Operation with ID ${id} not found`);
    }
    return transport;
  }

  addOperation(createOperationDto: CreateOperationDto): Promise<Operation> {
    const preparedOperation = this.parseOperationBody(createOperationDto);
    const newOperation = this.operationRepository.create(preparedOperation);
    return this.operationRepository.save(newOperation);
  }

  async modifyOperation(
    id: number,
    updateOperationDto: UpdateOperationDto,
  ): Promise<Operation> {
    const operation = await this.getSingleOperation(id);

    const preparedOperation = this.parseOperationBody(updateOperationDto);

    const updatedOperation = this.operationRepository.merge(
      operation,
      preparedOperation,
    );

    if (preparedOperation.transports) {
      updatedOperation.transports = preparedOperation.transports;
    }

    await this.operationRepository.save(updatedOperation);

    return this.getSingleOperation(id);
  }

  async deleteOperation(id: number): Promise<void> {
    const transport = await this.getSingleOperation(id);
    await this.operationRepository.remove(transport);
  }

  async fillWithAi(prompt: string) {
    const openAiClient = new OpenAI({
      apiKey: this.configService.get('OPENAI_KEY'),
    });

    const transports = await this.transportRepository.find();
    const preparedTransports = transports.map(({ id, name }) => ({ id, name }));

    const responseFormat = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().nullable(),
      latitude: z.string().nullable(),
      longitude: z.string().nullable(),
      // @ts-ignore
      type: z.enum(Object.values(OperationTypesEnum)),
      transports: z.array(z.object({ id: z.number(), name: z.string() })),
    });

    const response = await openAiClient.beta.chat.completions.parse({
      model: 'gpt-4o',
      response_format: zodResponseFormat(responseFormat, 'operation'),
      messages: [
        {
          role: 'system',
          content: `
Аналізуйте наданий опис операції та витягніть необхідну інформацію для заповнення деталей операції. Вам буде надано:

1. **Опис операції:** Це текстовий опис, що містить ключову інформацію про операцію.
2. **Доступні транспортні засоби:** Список транспортних засобів у форматі \`{id: номер, name: назва транспортного засобу}\`.
3. **Можливі типи операції.** У форматі \`тип1, тип2, тип3\` і так далі.

Ваше завдання - проаналізувати наданий опис, щоб визначити:
- Найбільш підходящий тип операції з наданих типів.
- Один чи кілька транспортних засобів, які можуть допомогти виконати операцію.
- Виділити інші важливі деталі, такі як назва, дата, широта та довгота.

# Кроки

- **Визначення та Витяг Деталей:**
  - **Назва:** Створіть відповідну назву операції на основі наданого змісту.
  - **Опис:** Складіть короткий виклад наданого опису.
  - **Дата:** Витягніть дату операції, якщо вона чітко вказана; інакше використовуйте \`null\`.
  - **Широта і довгота:** Визначте координати місця з опису. Якщо вони не надані, використовуйте \`null\`.
  - **Тип:** Визначте найбільш підходящий тип з наведеного списку.
  - **Транспортні засоби:** Виберіть найбільш відповідні транспортні засоби з наданого списку для допомоги у виконанні операції. Повинно бути обрано принаймні один або більше, скільки потрібно.

# Формат Виходу

Ваші вихідні дані повинні бути у форматі JSON і містити такі поля:

\`\`\`json
{
  "name": "string",
  "description": "string",
  "date": "string in format YYYY-MM-DD or null" or null,
  "latitude": "string" or null,
  "longitude": "string" or null,
  "type": "string",
  "transports": [
    {
      "id": number,
      "name": "string"
    }
  ]
}
\`\`\`

# Приклади

### Приклад Вхідних Даних:
- **Опис Операції:** "На 123 Головній вул. 5 травня сталася пожежа. Потрібна допомога для транспортування пожежних підрозділів для зменшення шкоди."
- **Доступні Транспортні Засоби:** \`[{"id": 1, "name": "Пожежна машина"}, {"id": 2, "name": "Гелікоптер"}, {"id": 3, "name": "Швидка допомога"}]\`
- **Можливі Типи:** \`пожежа, медичний, рятувальний\`

### Приклад Вихідних Даних:
\`\`\`json
{
  "name": "Пожежна подія на Головній вулиці",
  "description": "Пожежа на 123 Головній вул. 5 травня, потрібна транспортування пожежних підрозділів.",
  "date": "2024-05-05",
  "latitude": null,
  "longitude": null,
  "type": "пожежа",
  "transports": [
    {
      "id": 1,
      "name": "Пожежна машина"
    }
  ]
}
\`\`\`

# Примітки

- Якщо опис містить неоднозначну чи часткову інформацію, використовуйте null для дати, широти або довготи.
- Завжди визначайте принаймні один відповідний транспортний засіб, який найкраще відповідає зазначеним потребам.
- Формат виходу JSON повинен суворо відповідати наведеному формату для забезпечення узгодженості.
- Якщо опис містить адресу де сталась операція, помісти в latitude та longitude приблизні координати цієї адреси. Координати повинні бути в форматі 48.1616. Якщо немає точних координат - використовуйте null
- Якщо опис містить назву локації де сталась операція, помісти в latitude та longitude приблизні координати цієї локації. Координати повинні бути в форматі 48.1616. Якщо немає точних координат - використовуйте null
`,
        },
        {
          role: 'user',
          content: `Можливі Типи: ${Object.values(OperationTypesEnum).toString()}. Доступні Транспортні Засоби: ${JSON.stringify(preparedTransports)}. Опис Операції: ${prompt}`,
        },
      ],
    });

    const choice = response.choices[0];

    return choice.message.parsed;
  }
}
