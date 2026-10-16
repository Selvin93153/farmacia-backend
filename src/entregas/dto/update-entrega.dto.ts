import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEntregaDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}