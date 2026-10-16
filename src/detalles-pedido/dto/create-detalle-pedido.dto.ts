import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateDetallePedidoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_pedido!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_medicamento!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;
}