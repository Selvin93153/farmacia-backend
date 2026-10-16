import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
} from 'class-validator';

export class AsignarRepartidorDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_repartidor!: number;
}