import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PasswordValidatorDecorator } from '../decorators/password-validator.decorator';
import { TransportTypes } from '../../transports/constants/transport-types.enum';

export class UserCredentialsRequestDto {
  @IsString()
  @IsEmail()
  email: string;

  @PasswordValidatorDecorator()
  password: string;

  @IsOptional()
  @IsEnum(TransportTypes)
  serviceType?: TransportTypes;
}
