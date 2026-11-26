import { SetMetadata } from '@nestjs/common';
// Decorador para marcar rutas que no requieren autenticación mediante JWT.
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () =>
  SetMetadata(IS_PUBLIC_KEY, true);