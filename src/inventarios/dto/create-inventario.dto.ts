import {
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventarioDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sucursal!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_medicamento!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_actual?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_minimo!: number;
}