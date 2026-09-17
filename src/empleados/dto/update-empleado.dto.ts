import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsOptional,
} from 'class-validator';

import { CreateEmpleadoDto } from './create-empleado.dto';

export class UpdateEmpleadoDto extends PartialType(
  CreateEmpleadoDto,
) {
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}