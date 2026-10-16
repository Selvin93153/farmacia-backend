import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
} from 'typeorm';

import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Injectable()
export class DetallesPedidoService {
  constructor(
    @InjectRepository(DetallePedido)
    private readonly detallePedidoRepository: Repository<DetallePedido>,

    private readonly dataSource: DataSource,
  ) {}

  // Recalcula automáticamente el total general del pedido.
  private async recalcularTotalPedido(
    manager: EntityManager,
    pedido: Pedido,
  ): Promise<void> {
    const resultado = await manager
      .createQueryBuilder(DetallePedido, 'detalle')
      .select(
        'COALESCE(SUM(detalle.subtotal), 0)',
        'total',
      )
      .where(
        'detalle.id_pedido = :idPedido',
        {
          idPedido: pedido.id_pedido,
        },
      )
      .getRawOne<{ total: string }>();

    pedido.total = Number(
      resultado?.total ?? 0,
    );

    await manager.save(
      Pedido,
      pedido,
    );
  }

  // Agrega un medicamento a un pedido en borrador.
  async create(
    createDetallePedidoDto: CreateDetallePedidoDto,
  ): Promise<DetallePedido> {
    const idDetalle =
      await this.dataSource.transaction(
        async (manager) => {
          const pedido =
            await manager.findOne(Pedido, {
              where: {
                id_pedido:
                  createDetallePedidoDto.id_pedido,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            });

          if (!pedido) {
            throw new NotFoundException(
              'El pedido indicado no existe.',
            );
          }

          if (pedido.estado !== 'BORRADOR') {
            throw new BadRequestException(
              'Solo se pueden agregar medicamentos a pedidos en estado BORRADOR.',
            );
          }

          const medicamento =
            await manager.findOne(
              Medicamento,
              {
                where: {
                  id_medicamento:
                    createDetallePedidoDto.id_medicamento,
                },
              },
            );

          if (!medicamento) {
            throw new NotFoundException(
              'El medicamento indicado no existe.',
            );
          }

          if (
            medicamento.estado !== 'ACTIVO'
          ) {
            throw new BadRequestException(
              'El medicamento indicado está inactivo.',
            );
          }

          const detalleExistente =
            await manager.findOne(
              DetallePedido,
              {
                where: {
                  id_pedido:
                    createDetallePedidoDto.id_pedido,
                  id_medicamento:
                    createDetallePedidoDto.id_medicamento,
                },
              },
            );

          if (detalleExistente) {
            throw new ConflictException(
              'El medicamento ya fue agregado a este pedido.',
            );
          }

          const precioUnitario =
            Number(
              medicamento.precio_venta,
            );

          const subtotal =
            precioUnitario *
            createDetallePedidoDto.cantidad;

          const detalle =
            manager.create(
              DetallePedido,
              {
                id_pedido:
                  pedido.id_pedido,

                id_medicamento:
                  medicamento.id_medicamento,

                cantidad:
                  createDetallePedidoDto.cantidad,

                precio_unitario:
                  precioUnitario,

                subtotal,
              },
            );

          const detalleGuardado =
            await manager.save(
              DetallePedido,
              detalle,
            );

          await this.recalcularTotalPedido(
            manager,
            pedido,
          );

          return detalleGuardado.id_detalle_pedido;
        },
      );

    return this.findOne(idDetalle);
  }

  // Obtiene todos los detalles de pedidos registrados.
  async findAll(): Promise<DetallePedido[]> {
    return this.detallePedidoRepository.find({
      relations: {
        pedido: {
          cliente: true,
        },
        medicamento: true,
      },
      order: {
        id_detalle_pedido: 'ASC',
      },
    });
  }

  // Obtiene un detalle de pedido por su identificador.
  async findOne(
    id: number,
  ): Promise<DetallePedido> {
    const detalle =
      await this.detallePedidoRepository.findOne({
        where: {
          id_detalle_pedido: id,
        },
        relations: {
          pedido: {
            cliente: true,
          },
          medicamento: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        'El detalle del pedido no existe.',
      );
    }

    return detalle;
  }

  // Obtiene todos los medicamentos pertenecientes a un pedido.
  async findByPedido(
    idPedido: number,
  ): Promise<DetallePedido[]> {
    return this.detallePedidoRepository.find({
      where: {
        id_pedido: idPedido,
      },
      relations: {
        medicamento: true,
      },
      order: {
        id_detalle_pedido: 'ASC',
      },
    });
  }

  // Actualiza la cantidad de un medicamento en un pedido en borrador.
  async update(
    id: number,
    updateDetallePedidoDto: UpdateDetallePedidoDto,
  ): Promise<DetallePedido> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle =
          await manager.findOne(
            DetallePedido,
            {
              where: {
                id_detalle_pedido: id,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!detalle) {
          throw new NotFoundException(
            'El detalle del pedido no existe.',
          );
        }

        const pedido =
          await manager.findOne(Pedido, {
            where: {
              id_pedido:
                detalle.id_pedido,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          });

        if (!pedido) {
          throw new NotFoundException(
            'El pedido asociado no existe.',
          );
        }

        if (
          pedido.estado !== 'BORRADOR'
        ) {
          throw new BadRequestException(
            'Solo se pueden modificar detalles de pedidos en estado BORRADOR.',
          );
        }

        if (
          updateDetallePedidoDto.cantidad !==
          undefined
        ) {
          detalle.cantidad =
            updateDetallePedidoDto.cantidad;

          detalle.subtotal =
            Number(
              detalle.precio_unitario,
            ) *
            detalle.cantidad;
        }

        await manager.save(
          DetallePedido,
          detalle,
        );

        await this.recalcularTotalPedido(
          manager,
          pedido,
        );
      },
    );

    return this.findOne(id);
  }

  // Elimina un medicamento de un pedido en borrador.
  async remove(
    id: number,
  ): Promise<void> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle =
          await manager.findOne(
            DetallePedido,
            {
              where: {
                id_detalle_pedido: id,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!detalle) {
          throw new NotFoundException(
            'El detalle del pedido no existe.',
          );
        }

        const pedido =
          await manager.findOne(Pedido, {
            where: {
              id_pedido:
                detalle.id_pedido,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          });

        if (!pedido) {
          throw new NotFoundException(
            'El pedido asociado no existe.',
          );
        }

        if (
          pedido.estado !== 'BORRADOR'
        ) {
          throw new BadRequestException(
            'Solo se pueden eliminar detalles de pedidos en estado BORRADOR.',
          );
        }

        await manager.remove(
          DetallePedido,
          detalle,
        );

        await this.recalcularTotalPedido(
          manager,
          pedido,
        );
      },
    );
  }
}