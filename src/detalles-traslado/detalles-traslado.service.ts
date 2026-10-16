import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { Traslado } from '../traslados/entities/traslado.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { CreateDetalleTrasladoDto } from './dto/create-detalle-traslado.dto';
import { UpdateDetalleTrasladoDto } from './dto/update-detalle-traslado.dto';
import { DetalleTraslado } from './entities/detalle-traslado.entity';

@Injectable()
export class DetallesTrasladoService {
  constructor(
    @InjectRepository(DetalleTraslado)
    private readonly detalleRepository: Repository<DetalleTraslado>,

    private readonly dataSource: DataSource,
  ) {}

  // Agrega un medicamento a un traslado solicitado.
  async create(
    dto: CreateDetalleTrasladoDto,
    id_usuario: number,
  ): Promise<DetalleTraslado> {
    const idDetalle = await this.dataSource.transaction(
      async (manager) => {
        const traslado = await manager.findOne(Traslado, {
          where: {
            id_traslado: dto.id_traslado,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!traslado) {
          throw new NotFoundException(
            'El traslado no existe.',
          );
        }

        if (traslado.estado !== 'SOLICITADO') {
          throw new BadRequestException(
            'Solo se pueden agregar medicamentos a un traslado SOLICITADO.',
          );
        }

        const usuario = await manager.findOne(Usuario, {
          where: {
            id_usuario,
            estado: 'ACTIVO',
          },
        });

        if (!usuario) {
          throw new UnauthorizedException(
            'El usuario no está disponible.',
          );
        }

        if (
          usuario.id_sucursal !==
          traslado.id_sucursal_origen
        ) {
          throw new ForbiddenException(
            'Solo la sucursal origen puede modificar este traslado.',
          );
        }

        const medicamento = await manager.findOne(
          Medicamento,
          {
            where: {
              id_medicamento: dto.id_medicamento,
              estado: 'ACTIVO',
            },
          },
        );

        if (!medicamento) {
          throw new NotFoundException(
            'El medicamento no existe o está inactivo.',
          );
        }

        const detalleExistente =
          await manager.findOne(
            DetalleTraslado,
            {
              where: {
                id_traslado: dto.id_traslado,
                id_medicamento:
                  dto.id_medicamento,
              },
            },
          );

        if (detalleExistente) {
          throw new ConflictException(
            'El medicamento ya está agregado al traslado.',
          );
        }

        const detalle = manager.create(
          DetalleTraslado,
          {
            id_traslado: dto.id_traslado,
            id_medicamento:
              dto.id_medicamento,
            cantidad_solicitada:
              dto.cantidad_solicitada,
            cantidad_enviada: null,
            cantidad_recibida: null,
          },
        );

        const detalleGuardado =
          await manager.save(
            DetalleTraslado,
            detalle,
          );

        return detalleGuardado.id_detalle_traslado;
      },
    );

    return this.findOne(idDetalle);
  }

  // Obtiene todos los detalles de traslado.
  async findAll(): Promise<DetalleTraslado[]> {
    return this.detalleRepository.find({
      relations: {
        traslado: true,
        medicamento: true,
      },
      order: {
        id_detalle_traslado: 'ASC',
      },
    });
  }

  // Obtiene todos los medicamentos de un traslado.
  async findByTraslado(
    id_traslado: number,
  ): Promise<DetalleTraslado[]> {
    return this.detalleRepository.find({
      where: {
        id_traslado,
      },
      relations: {
        medicamento: true,
      },
      order: {
        id_detalle_traslado: 'ASC',
      },
    });
  }

  // Obtiene un detalle de traslado por su identificador.
  async findOne(
    id: number,
  ): Promise<DetalleTraslado> {
    const detalle =
      await this.detalleRepository.findOne({
        where: {
          id_detalle_traslado: id,
        },
        relations: {
          traslado: true,
          medicamento: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        'El detalle de traslado no existe.',
      );
    }

    return detalle;
  }

  // Modifica la cantidad solicitada de un medicamento.
  async update(
    id: number,
    dto: UpdateDetalleTrasladoDto,
    id_usuario: number,
  ): Promise<DetalleTraslado> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalleInicial =
          await manager.findOne(
            DetalleTraslado,
            {
              where: {
                id_detalle_traslado: id,
              },
            },
          );

        if (!detalleInicial) {
          throw new NotFoundException(
            'El detalle de traslado no existe.',
          );
        }

        const traslado = await manager.findOne(
          Traslado,
          {
            where: {
              id_traslado:
                detalleInicial.id_traslado,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          },
        );

        if (!traslado) {
          throw new NotFoundException(
            'El traslado no existe.',
          );
        }

        if (traslado.estado !== 'SOLICITADO') {
          throw new BadRequestException(
            'Los detalles solo pueden modificarse mientras el traslado esté SOLICITADO.',
          );
        }

        const usuario = await manager.findOne(
          Usuario,
          {
            where: {
              id_usuario,
              estado: 'ACTIVO',
            },
          },
        );

        if (!usuario) {
          throw new UnauthorizedException(
            'El usuario no está disponible.',
          );
        }

        if (
          usuario.id_sucursal !==
          traslado.id_sucursal_origen
        ) {
          throw new ForbiddenException(
            'Solo la sucursal origen puede modificar este traslado.',
          );
        }

        const detalle = await manager.findOne(
          DetalleTraslado,
          {
            where: {
              id_detalle_traslado: id,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          },
        );

        if (!detalle) {
          throw new NotFoundException(
            'El detalle de traslado no existe.',
          );
        }

        if (
          dto.cantidad_solicitada !== undefined
        ) {
          detalle.cantidad_solicitada =
            dto.cantidad_solicitada;
        }

        await manager.save(
          DetalleTraslado,
          detalle,
        );
      },
    );

    return this.findOne(id);
  }

  // Elimina un medicamento de un traslado solicitado.
  async remove(
    id: number,
    id_usuario: number,
  ): Promise<void> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle = await manager.findOne(
          DetalleTraslado,
          {
            where: {
              id_detalle_traslado: id,
            },
          },
        );

        if (!detalle) {
          throw new NotFoundException(
            'El detalle de traslado no existe.',
          );
        }

        const traslado = await manager.findOne(
          Traslado,
          {
            where: {
              id_traslado:
                detalle.id_traslado,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          },
        );

        if (!traslado) {
          throw new NotFoundException(
            'El traslado no existe.',
          );
        }

        if (traslado.estado !== 'SOLICITADO') {
          throw new BadRequestException(
            'Solo se pueden eliminar medicamentos de un traslado SOLICITADO.',
          );
        }

        const usuario = await manager.findOne(
          Usuario,
          {
            where: {
              id_usuario,
              estado: 'ACTIVO',
            },
          },
        );

        if (!usuario) {
          throw new UnauthorizedException(
            'El usuario no está disponible.',
          );
        }

        if (
          usuario.id_sucursal !==
          traslado.id_sucursal_origen
        ) {
          throw new ForbiddenException(
            'Solo la sucursal origen puede modificar este traslado.',
          );
        }

        await manager.remove(
          DetalleTraslado,
          detalle,
        );
      },
    );
  }
}