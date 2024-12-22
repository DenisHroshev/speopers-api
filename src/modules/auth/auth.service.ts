import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserCredentialsRequestDto } from './dtos/user-credentials-request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtConstants } from './constants/jwt.constants';
import { Role } from './constants/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private compareBcrypt(data: string, encrypted: string) {
    return bcrypt.compare(data, encrypted);
  }

  private hashBcrypt(data: string) {
    return bcrypt.hash(data, 10);
  }

  private createAccessToken({ userId, role }: { userId: number; role: Role }) {
    return this.jwtService.signAsync(
      { id: userId, role },
      { expiresIn: '2d', secret: JwtConstants.JWT_SECRET },
    );
  }

  private async returnToken(userData: { userId: number; role: Role }) {
    return {
      accessToken: await this.createAccessToken(userData),
      isDispatcher: userData.role === Role.DISPATCHER,
    };
  }

  async login(body: UserCredentialsRequestDto) {
    const user = await this.userRepository.findOneBy({ email: body.email });

    if (!user) {
      throw new BadRequestException('User is not found.');
    }

    const isPasswordCorrect = await this.compareBcrypt(
      body.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Incorrect password.');
    }

    return this.returnToken({ userId: user.id, role: user.role });
  }

  async registration(body: UserCredentialsRequestDto) {
    const user = await this.userRepository.findOneBy({ email: body.email });

    if (user) {
      throw new BadRequestException('User already exists.');
    }

    const passwordHash = await this.hashBcrypt(body.password);

    const newUser = await this.userRepository.save({
      email: body.email,
      passwordHash,
      serviceType: body.serviceType,
    });

    return this.returnToken({ userId: newUser.id, role: newUser.role });
  }

  async getUserByIdOrThrow(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new BadRequestException('User is not found.');
    }

    return user;
  }
}
