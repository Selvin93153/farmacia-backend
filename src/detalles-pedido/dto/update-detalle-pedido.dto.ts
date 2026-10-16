import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateDetallePedidoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad?: number;
}