import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateMunicipioDto } from './create-municipio.dto';

export class UpdateMunicipioDto extends PartialType(
  CreateMunicipioDto,
) {
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}