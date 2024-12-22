import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransportTypes } from '../constants/transport-types.enum';

export class UpdateTransportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  peopleCapacity?: number;

  @IsOptional()
  @IsEnum(TransportTypes)
  type?: TransportTypes;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
