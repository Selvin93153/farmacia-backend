import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateSucursalDto } from './create-sucursal.dto';

export class UpdateSucursalDto extends PartialType(
  CreateSucursalDto,
) {
  @IsOptional()
  @IsIn(['ACTIVA', 'INACTIVA'])
  estado?: string;
}