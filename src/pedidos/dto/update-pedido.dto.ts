import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePedidoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cliente?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_forma_pago?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  direccion_entrega?: string;

  @IsOptional()
  @IsLatitude()
  latitud_entrega?: string;

  @IsOptional()
  @IsLongitude()
  longitud_entrega?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'CALL_CENTER',
    'PORTAL_WEB',
    'TELEFONO',
  ])
  canal?: string;
}