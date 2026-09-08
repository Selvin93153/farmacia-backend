export interface JwtPayload {
  sub: number;
  id_rol: number;
  iat?: number;
  exp?: number;
}