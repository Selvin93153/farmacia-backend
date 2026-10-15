import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateActivoFijoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_sucursal!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoria!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message:
      'La fecha de adquisición debe tener el formato YYYY-MM-DD.',
  })
  fecha_adquisicion!: string;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  valor_adquisicion!: number;
}