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

export class CreatePedidoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cliente!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_forma_pago?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  direccion_entrega!: string;

  @IsLatitude()
  latitud_entrega!: string;

  @IsLongitude()
  longitud_entrega!: string;

  @IsString()
  @IsIn([
    'CALL_CENTER',
    'PORTAL_WEB',
    'TELEFONO',
  ])
  canal!: string;
}