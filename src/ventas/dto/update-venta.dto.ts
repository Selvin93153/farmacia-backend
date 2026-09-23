import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVentaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_forma_pago?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuento?: number;
}