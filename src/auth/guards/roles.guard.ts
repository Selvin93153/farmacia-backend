import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import {
  ROLES_KEY,
} from '../decorators/roles.decorator';
import {
  JwtPayload,
  RolCodigo,
} from '../interfaces/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  // Verifica que el usuario autenticado tenga uno de los roles permitidos.
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const rolesPermitidos =
      this.reflector.getAllAndOverride<RolCodigo[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // Sin @Roles(), cualquier usuario autenticado puede acceder.
    if (
      !rolesPermitidos ||
      rolesPermitidos.length === 0
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const usuario = request.user;

    if (!usuario) {
      throw new UnauthorizedException(
        'No has iniciado sesión',
      );
    }

    if (
      !rolesPermitidos.includes(
        usuario.rol_codigo,
      )
    ) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción',
      );
    }

    return true;
  }
}