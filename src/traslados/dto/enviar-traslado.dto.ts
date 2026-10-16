import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class EnviarDetalleTrasladoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_detalle_traslado!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cantidad_enviada!: number;
}

export class EnviarTrasladoDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => EnviarDetalleTrasladoDto)
  detalles!: EnviarDetalleTrasladoDto[];
}