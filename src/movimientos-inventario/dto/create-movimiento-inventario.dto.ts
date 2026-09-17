import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMovimientoInventarioDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_inventario!: number;

  @IsString()
  @IsIn(['ENTRADA', 'SALIDA'])
  tipo_movimiento!: string;

  @IsString()
  @IsIn([
    'COMPRA',
    'VENTA',
    'TRASLADO',
    'AJUSTE',
    'DEVOLUCION',
  ])
  motivo!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  referencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  observacion?: string;
}