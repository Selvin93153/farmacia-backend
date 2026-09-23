import {
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetalleVentaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_venta!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_medicamento!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;
}