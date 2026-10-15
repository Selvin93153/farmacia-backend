import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateActivoFijoDto } from './dto/create-activo-fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo-fijo.dto';
import { ActivoFijo } from './entities/activo-fijo.entity';

@Injectable()
export class ActivosFijosService {
  constructor(
    @InjectRepository(ActivoFijo)
    private readonly activoFijoRepository: Repository<ActivoFijo>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // Registra un nuevo activo fijo perteneciente a una sucursal.
  async create(
    createActivoFijoDto: CreateActivoFijoDto,
  ): Promise<ActivoFijo> {
    const sucursal = await this.sucursalRepository.findOne({
      where: {
        id_sucursal: createActivoFijoDto.id_sucursal,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(
        'La sucursal indicada no existe.',
      );
    }

    if (sucursal.estado !== 'ACTIVA') {
      throw new BadRequestException(
        'No se pueden registrar activos en una sucursal inactiva.',
      );
    }

    const codigo = createActivoFijoDto.codigo
      .trim()
      .toUpperCase();

    const activoExistente =
      await this.activoFijoRepository.findOne({
        where: {
          codigo,
        },
      });

    if (activoExistente) {
      throw new ConflictException(
        'Ya existe un activo fijo con ese código.',
      );
    }

    const activo = this.activoFijoRepository.create({
      id_sucursal: createActivoFijoDto.id_sucursal,
      codigo,
      descripcion:
        createActivoFijoDto.descripcion.trim(),
      categoria:
        createActivoFijoDto.categoria.trim(),
      fecha_adquisicion:
        createActivoFijoDto.fecha_adquisicion,
      valor_adquisicion:
        createActivoFijoDto.valor_adquisicion,
      valor_actual:
        createActivoFijoDto.valor_adquisicion,
      estado: 'ACTIVO',
    });

    const activoGuardado =
      await this.activoFijoRepository.save(activo);

    return this.findOne(
      activoGuardado.id_activo,
    );
  }

  // Obtiene todos los activos fijos registrados.
  async findAll(): Promise<ActivoFijo[]> {
    return this.activoFijoRepository.find({
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
      order: {
        id_activo: 'ASC',
      },
    });
  }

  // Obtiene los activos pertenecientes a la sucursal del usuario autenticado.
  async findMiSucursal(
    id_usuario: number,
  ): Promise<ActivoFijo[]> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id_usuario,
        estado: 'ACTIVO',
      },
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'El usuario no existe o se encuentra inactivo.',
      );
    }

    if (usuario.id_sucursal == null) {
      throw new ForbiddenException(
        'El usuario no tiene una sucursal asignada.',
      );
    }

    return this.activoFijoRepository.find({
      where: {
        id_sucursal: usuario.id_sucursal,
      },
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
      order: {
        id_activo: 'ASC',
      },
    });
  }

  // Obtiene un activo fijo por su identificador.
  async findOne(id: number): Promise<ActivoFijo> {
    const activo =
      await this.activoFijoRepository.findOne({
        where: {
          id_activo: id,
        },
        relations: {
          sucursal: {
            municipio: {
              departamento: true,
            },
          },
        },
      });

    if (!activo) {
      throw new NotFoundException(
        'El activo fijo no existe.',
      );
    }

    return activo;
  }

  // Actualiza los datos permitidos de un activo fijo.
  async update(
    id: number,
    updateActivoFijoDto: UpdateActivoFijoDto,
  ): Promise<ActivoFijo> {
    const activo =
      await this.activoFijoRepository.findOne({
        where: {
          id_activo: id,
        },
      });

    if (!activo) {
      throw new NotFoundException(
        'El activo fijo no existe.',
      );
    }

    if (
      updateActivoFijoDto.codigo !== undefined
    ) {
      const codigo =
        updateActivoFijoDto.codigo
          .trim()
          .toUpperCase();

      const activoConCodigo =
        await this.activoFijoRepository.findOne({
          where: {
            codigo,
          },
        });

      if (
        activoConCodigo &&
        activoConCodigo.id_activo !== id
      ) {
        throw new ConflictException(
          'Ya existe otro activo fijo con ese código.',
        );
      }

      activo.codigo = codigo;
    }

    if (
      updateActivoFijoDto.descripcion !== undefined
    ) {
      activo.descripcion =
        updateActivoFijoDto.descripcion.trim();
    }

    if (
      updateActivoFijoDto.categoria !== undefined
    ) {
      activo.categoria =
        updateActivoFijoDto.categoria.trim();
    }

    if (
      updateActivoFijoDto.fecha_adquisicion !==
      undefined
    ) {
      activo.fecha_adquisicion =
        updateActivoFijoDto.fecha_adquisicion;
    }

    if (
      updateActivoFijoDto.valor_actual !== undefined
    ) {
      activo.valor_actual =
        updateActivoFijoDto.valor_actual;
    }

    if (
      updateActivoFijoDto.estado !== undefined
    ) {
      activo.estado =
        updateActivoFijoDto.estado;
    }

    await this.activoFijoRepository.save(activo);

    return this.findOne(id);
  }
}
