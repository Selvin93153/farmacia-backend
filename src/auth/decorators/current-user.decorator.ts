import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
// Decorador personalizado para obtener los datos del usuario autenticado desde el token JWT.
export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): JwtPayload => {
    const request = context.switchToHttp().getRequest();

    return request.user;
  },
);