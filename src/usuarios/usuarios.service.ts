import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<Usuario> {
    await this.validarRol(createUsuarioDto.id_rol);

    if (createUsuarioDto.id_sucursal != null) {
      await this.validarSucursal(
        createUsuarioDto.id_sucursal,
      );
    }

    const passwordHash = await argon2.hash(
      createUsuarioDto.password,
    );

    try {
      const usuario = this.usuarioRepository.create({
        ...createUsuarioDto,
        password: passwordHash,
      });

      const usuarioGuardado =
        await this.usuarioRepository.save(usuario);

      return this.findOne(
        usuarioGuardado.id_usuario,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: {
        rol: true,
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
      order: {
        id_usuario: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          id_usuario: id,
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
      throw new NotFoundException(
        `El usuario con ID ${id} no existe`,
      );
    }

    return usuario;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    if (updateUsuarioDto.id_rol !== undefined) {
      await this.validarRol(
        updateUsuarioDto.id_rol,
      );
    }

    if (
      updateUsuarioDto.id_sucursal !== undefined &&
      updateUsuarioDto.id_sucursal !== null
    ) {
      await this.validarSucursal(
        updateUsuarioDto.id_sucursal,
      );
    }

    const usuario =
      await this.usuarioRepository.preload({
        id_usuario: id,
        ...updateUsuarioDto,
      });

    if (!usuario) {
      throw new NotFoundException(
        `El usuario con ID ${id} no existe`,
      );
    }

    try {
      await this.usuarioRepository.save(usuario);

      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);

    try {
      await this.usuarioRepository.remove(usuario);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async validarRol(
    id_rol: number,
  ): Promise<void> {
    const existe = await this.rolRepository.exists({
      where: {
        id: id_rol,
      },
    });

    if (!existe) {
      throw new NotFoundException(
        `El rol con ID ${id_rol} no existe`,
      );
    }
  }

  private async validarSucursal(
    id_sucursal: number,
  ): Promise<void> {
    const existe =
      await this.sucursalRepository.exists({
        where: {
          id_sucursal,
        },
      });

    if (!existe) {
      throw new NotFoundException(
        `La sucursal con ID ${id_sucursal} no existe`,
      );
    }
  }

  private handleDatabaseError(
    error: unknown,
  ): never {
    if (error instanceof QueryFailedError) {
      const code =
        (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe un usuario con ese correo',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'No se puede realizar la operación porque existen registros relacionados',
        );
      }
    }

    throw error;
  }
}