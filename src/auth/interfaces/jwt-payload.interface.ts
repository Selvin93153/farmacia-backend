export type RolCodigo =
  | 'ADMIN_SISTEMA'
  | 'ADMIN_SUCURSAL'
  | 'INVENTARIO'
  | 'RRHH'
  | 'TRABAJADOR_SUCURSAL';

export interface JwtPayload {
  sub: number;
  id_rol: number;
  rol_codigo: RolCodigo;
  iat?: number;
  exp?: number;
}