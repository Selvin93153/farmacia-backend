import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateDetalleTrasladoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_traslado!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_medicamento!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad_solicitada!: number;
}