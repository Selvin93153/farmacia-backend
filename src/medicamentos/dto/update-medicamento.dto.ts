import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { CreateMedicamentoDto } from './create-medicamento.dto';

export class UpdateMedicamentoDto extends PartialType(
  CreateMedicamentoDto,
) {
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}