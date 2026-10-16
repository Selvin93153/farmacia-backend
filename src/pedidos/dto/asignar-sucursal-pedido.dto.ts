import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
} from 'class-validator';

export class AsignarSucursalPedidoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sucursal!: number;
}