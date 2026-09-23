import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCajaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombre?: string;

  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: string;
}