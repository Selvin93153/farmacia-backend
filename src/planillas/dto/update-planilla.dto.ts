import {
  IsIn,
  IsOptional,
} from 'class-validator';

export class UpdatePlanillaDto {
  @IsOptional()
  @IsIn([
    'BORRADOR',
    'GENERADA',
    'PAGADA',
  ])
  estado?: string;
}