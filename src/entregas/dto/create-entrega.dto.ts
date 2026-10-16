import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateEntregaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_pedido!: number;
}