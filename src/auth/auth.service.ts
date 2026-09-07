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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.correo = :correo', {
        correo: loginDto.correo,
      })
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

    const passwordValido = await argon2.verify(
      usuario.password,
      loginDto.password,
    );

    if (!passwordValido) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const token = await this.jwtService.signAsync({
      sub: usuario.id_usuario,
      id_rol: usuario.id_rol,
    });

    return {
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        id_sucursal: usuario.id_sucursal,
      },
    };
  }
}