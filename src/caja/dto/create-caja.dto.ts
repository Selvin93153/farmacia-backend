import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCajaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sucursal!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombre!: string;
}