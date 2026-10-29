import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password_actual!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password_nueva!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmar_password!: string;
}