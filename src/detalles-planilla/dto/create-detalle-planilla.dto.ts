import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetallePlanillaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_planilla!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_empleado!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  bonificaciones?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuentos?: number;
}