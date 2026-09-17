import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
} from 'typeorm';

import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';

import { Inventario } from '../inventarios/entities/inventario.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepository:
      Repository<MovimientoInventario>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createMovimientoDto:
      CreateMovimientoInventarioDto,
    id_usuario: number,
  ): Promise<MovimientoInventario> {
    const movimientoGuardado =
      await this.dataSource.transaction(
        async (manager) => {
          const usuario =
            await manager.findOne(Usuario, {
              where: {
                id_usuario,
                estado: 'ACTIVO',
              },
            });

          if (!usuario) {
            throw new UnauthorizedException(
              'El usuario no está disponible',
            );
          }

          const inventario =
            await manager.findOne(Inventario, {
              where: {
                id_inventario:
                  createMovimientoDto.id_inventario,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            });

          if (!inventario) {
            throw new NotFoundException(
              `El inventario con ID ${createMovimientoDto.id_inventario} no existe`,
            );
          }

          const stockAnterior =
            inventario.stock_actual;

          let stockNuevo = stockAnterior;

          if (
            createMovimientoDto.tipo_movimiento ===
            'ENTRADA'
          ) {
            stockNuevo +=
              createMovimientoDto.cantidad;
          }

          if (
            createMovimientoDto.tipo_movimiento ===
            'SALIDA'
          ) {
            stockNuevo -=
              createMovimientoDto.cantidad;

            if (stockNuevo < 0) {
              throw new BadRequestException(
                'No hay suficiente stock para realizar la salida',
              );
            }
          }

          inventario.stock_actual = stockNuevo;

          await manager.save(
            Inventario,
            inventario,
          );

          const movimiento = manager.create(
            MovimientoInventario,
            {
              id_inventario:
                createMovimientoDto.id_inventario,

              id_usuario,

              tipo_movimiento:
                createMovimientoDto.tipo_movimiento,

              motivo:
                createMovimientoDto.motivo,

              cantidad:
                createMovimientoDto.cantidad,

              stock_anterior: stockAnterior,

              stock_nuevo: stockNuevo,

              referencia:
                createMovimientoDto.referencia ??
                null,

              observacion:
                createMovimientoDto.observacion ??
                null,
            },
          );

          return manager.save(
            MovimientoInventario,
            movimiento,
          );
        },
      );

    return this.findOne(
      movimientoGuardado.id_movimiento,
    );
  }

  async findAll(): Promise<
    MovimientoInventario[]
  > {
    return this.movimientoRepository.find({
      relations: {
        inventario: {
          sucursal: {
            municipio: {
              departamento: true,
            },
          },
          medicamento: true,
        },
        usuario: {
          rol: true,
        },
      },
      order: {
        fecha: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
  ): Promise<MovimientoInventario> {
    const movimiento =
      await this.movimientoRepository.findOne({
        where: {
          id_movimiento: id,
        },
        relations: {
          inventario: {
            sucursal: {
              municipio: {
                departamento: true,
              },
            },
            medicamento: true,
          },
          usuario: {
            rol: true,
          },
        },
      });

    if (!movimiento) {
      throw new NotFoundException(
        `El movimiento con ID ${id} no existe`,
      );
    }

    return movimiento;
  }
}