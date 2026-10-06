import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Empleado } from '../empleados/entities/empleado.entity';

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

    private readonly dataSource: DataSource,
  ) {}

  // Crea una cuenta y valida el empleado asociado cuando corresponde.
  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<Usuario> {
    await this.validarRol(createUsuarioDto.id_rol);

    if (createUsuarioDto.id_sucursal != null) {
      await this.validarSucursal(createUsuarioDto.id_sucursal);
    }

    if (createUsuarioDto.id_empleado != null) {
      await this.validarEmpleado(createUsuarioDto.id_empleado);
    }

    const passwordHash = await argon2.hash(
      createUsuarioDto.password,
    );

    try {
      const usuario = this.usuarioRepository.create({
        ...createUsuarioDto,
        id_empleado: createUsuarioDto.id_empleado ?? null,
        password: passwordHash,
      });

      const usuarioGuardado =
        await this.usuarioRepository.save(usuario);

      return this.findOne(usuarioGuardado.id_usuario);
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
    const usuario = await this.usuarioRepository.findOne({
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

  // Actualiza una cuenta sin permitir asociar el mismo empleado a dos usuarios.
  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    if (updateUsuarioDto.id_rol !== undefined) {
      await this.validarRol(updateUsuarioDto.id_rol);
    }

    if (
      updateUsuarioDto.id_sucursal !== undefined &&
      updateUsuarioDto.id_sucursal !== null
    ) {
      await this.validarSucursal(updateUsuarioDto.id_sucursal);
    }

    if (updateUsuarioDto.id_empleado != null) {
      await this.validarEmpleado(updateUsuarioDto.id_empleado, id);
    }

    const usuario = await this.usuarioRepository.preload({
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

  private async validarRol(id_rol: number): Promise<void> {
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

  private async validarSucursal(id_sucursal: number): Promise<void> {
    const existe = await this.sucursalRepository.exists({
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

  // Valida que exista un empleado activo y que no tenga otra cuenta vinculada.
  private async validarEmpleado(
    id_empleado: number,
    id_usuarioActual?: number,
  ): Promise<void> {
    const empleado = await this.dataSource.getRepository(Empleado).findOne({
      where: {
        id_empleado,
      },
    });

    if (!empleado) {
      throw new NotFoundException(
        `El empleado con ID ${id_empleado} no existe`,
      );
    }

    if (empleado.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede asociar un empleado inactivo',
      );
    }

    const usuarioVinculado = await this.usuarioRepository.findOne({
      where: {
        id_empleado,
      },
    });

    if (
      usuarioVinculado &&
      usuarioVinculado.id_usuario !== id_usuarioActual
    ) {
      throw new ConflictException(
        'El empleado ya tiene una cuenta de usuario asociada',
      );
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = (error as QueryFailedError & {
        driverError?: { code?: string; constraint?: string };
      }).driverError;

      if (driverError?.code === '23505') {
        if (driverError.constraint === 'uq_usuarios_id_empleado') {
          throw new ConflictException(
            'El empleado ya tiene una cuenta de usuario asociada',
          );
        }

        throw new ConflictException(
          'Ya existe un usuario con ese correo',
        );
      }

      if (driverError?.code === '23503') {
        throw new ConflictException(
          'No se puede realizar la operación porque existen registros relacionados',
        );
      }
    }

    throw error;
  }
}
