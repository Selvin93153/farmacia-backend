import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsOptional,
} from 'class-validator';

import { CreateFormaPagoDto } from './create-forma-pago.dto';

export class UpdateFormaPagoDto extends PartialType(
  CreateFormaPagoDto,
) {
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}