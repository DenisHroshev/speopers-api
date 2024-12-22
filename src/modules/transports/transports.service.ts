import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transport } from './entitites/transport.entity';
import { UpdateTransportDto } from './dtos/update-transport.dto';
import { CreateTransportDto } from './dtos/create-transport.dto';

@Injectable()
export class TransportsService {
  constructor(
    @InjectRepository(Transport)
    private transportRepository: Repository<Transport>,
  ) {}

  async getAllTransports(): Promise<Transport[]> {
    return await this.transportRepository.find();
  }

  async getSingleTransport(id: number): Promise<Transport> {
    const transport = await this.transportRepository.findOne({ where: { id } });
    if (!transport) {
      throw new NotFoundException(`Transport with ID ${id} not found`);
    }
    return transport;
  }

  addTransport(createTransportDto: CreateTransportDto): Promise<Transport> {
    const newTransport = this.transportRepository.create(createTransportDto);
    return this.transportRepository.save(newTransport);
  }

  async modifyTransport(
    id: number,
    updateTransportDto: UpdateTransportDto,
  ): Promise<Transport> {
    const transport = await this.getSingleTransport(id);
    const updatedTransport = this.transportRepository.merge(
      transport,
      updateTransportDto,
    );

    return this.transportRepository.save(updatedTransport);
  }

  async deleteTransport(id: number): Promise<void> {
    const transport = await this.getSingleTransport(id);
    await this.transportRepository.remove(transport);
  }
}
