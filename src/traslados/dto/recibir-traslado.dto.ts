import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class RecibirDetalleTrasladoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_detalle_traslado!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidad_recibida!: number;
}

export class RecibirTrasladoDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => RecibirDetalleTrasladoDto)
  detalles!: RecibirDetalleTrasladoDto[];
}