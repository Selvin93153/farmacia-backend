import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovimientoCajaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_caja!: number;

  @IsString()
  @IsIn(['INGRESO', 'EGRESO'])
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  tipo_movimiento!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  concepto!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto!: number;
}