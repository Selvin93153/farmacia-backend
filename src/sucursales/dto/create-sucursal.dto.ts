import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSucursalDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_municipio!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombre!: string;

  @IsIn(['FARMACIA', 'STAND'])
  tipo_sucursal!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  direccion!: string;

  @IsLatitude()
  latitud!: string;

  @IsLongitude()
  longitud!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono!: string;
}