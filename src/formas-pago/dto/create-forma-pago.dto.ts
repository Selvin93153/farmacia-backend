import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFormaPagoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  nombre!: string;
}