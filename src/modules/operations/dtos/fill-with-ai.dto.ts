import { IsString } from 'class-validator';

export class FillWithAiDto {
  @IsString()
  prompt: string;
}
