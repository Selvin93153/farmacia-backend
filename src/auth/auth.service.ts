import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RolCodigo } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly jwtService: JwtService,
  ) {}

  // Valida las credenciales y genera la sesión del usuario.
  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect(
        'usuario.rol',
        'rol',
      )
      .addSelect('usuario.password')
      .where(
        'usuario.correo = :correo',
        {
          correo: loginDto.correo,
        },
      )
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException(
        'El usuario está inactivo',
      );
    }

    const passwordValido =
      await argon2.verify(
        usuario.password,
        loginDto.password,
      );

    if (!passwordValido) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    if (
      !usuario.rol ||
      !usuario.rol.codigo
    ) {
      throw new UnauthorizedException(
        'El usuario no tiene un rol válido asignado',
      );
    }

    if (!usuario.rol.activo) {
      throw new UnauthorizedException(
        'El rol del usuario está inactivo',
      );
    }

    const rolCodigo =
      usuario.rol.codigo as RolCodigo;

    const token =
      await this.jwtService.signAsync({
        sub: usuario.id_usuario,
        id_rol: usuario.id_rol,
        rol_codigo: rolCodigo,
      });

    return {
      token,

      usuario: {
        id_usuario:
          usuario.id_usuario,

        nombre:
          usuario.nombre,

        apellido:
          usuario.apellido,

        correo:
          usuario.correo,

        id_rol:
          usuario.id_rol,

        rol_codigo:
          rolCodigo,

        id_sucursal:
          usuario.id_sucursal,
      },
    };
  }

  // Obtiene los datos actuales del usuario autenticado.
  async me(id_usuario: number) {
    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          id_usuario,
          estado: 'ACTIVO',
        },

        relations: {
          rol: true,

          sucursal: {
            municipio: {
              departamento: true,
            },
          },
        },
      });

    if (!usuario) {
      throw new UnauthorizedException(
        'El usuario ya no está disponible',
      );
    }

    return usuario;
  }
}