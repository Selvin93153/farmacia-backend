import {
  IsIn,
  IsOptional,
} from 'class-validator';
import {
  OmitType,
  PartialType,
} from '@nestjs/mapped-types';

import { CreateUsuarioDto } from './create-usuario.dto';

class UpdateUsuarioBaseDto extends OmitType(
  CreateUsuarioDto,
  ['password'] as const,
) {}

export class UpdateUsuarioDto extends PartialType(
  UpdateUsuarioBaseDto,
) {
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}