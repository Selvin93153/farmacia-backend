import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVentaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_caja!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_forma_pago!: number;
}