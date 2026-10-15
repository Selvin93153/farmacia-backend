import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export class FiltroAuditoriaEfectivoDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha inicial debe tener el formato YYYY-MM-DD.',
  })
  fecha_desde?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha final debe tener el formato YYYY-MM-DD.',
  })
  fecha_hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sucursal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_caja?: number;

  @IsOptional()
  @IsIn(['INGRESO', 'EGRESO'])
  tipo_movimiento?: 'INGRESO' | 'EGRESO';

  @IsOptional()
  @IsIn(['VENTA', 'MANUAL'])
  origen?: 'VENTA' | 'MANUAL';
}