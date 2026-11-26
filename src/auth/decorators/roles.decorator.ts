import { SetMetadata } from '@nestjs/common';

import { RolCodigo } from '../interfaces/jwt-payload.interface';
// Decorador para definir los roles autorizados para acceder a una ruta.
export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolCodigo[]) =>
  SetMetadata(ROLES_KEY, roles);