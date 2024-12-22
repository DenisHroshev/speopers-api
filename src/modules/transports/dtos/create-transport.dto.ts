import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransportDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  peopleCapacity: number;

  // @IsNumber()
  // @IsNotEmpty()
  // typeId: number; // ID типу транспорту

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
