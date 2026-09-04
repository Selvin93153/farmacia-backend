import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateDepartamentoDto } from './create-departamento.dto';

export class UpdateDepartamentoDto extends PartialType(
  CreateDepartamentoDto,
) {
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}