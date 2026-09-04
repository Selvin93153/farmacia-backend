import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  descripcion?: string;
}