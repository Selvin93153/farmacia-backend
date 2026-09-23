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
  QueryFailedError,
  Repository,
} from 'typeorm';

import { DetalleVenta } from './entities/detalle-venta.entity';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

import { Venta } from '../ventas/entities/venta.entity';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';

@Injectable()
export class DetallesVentaService {
  constructor(
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository:
      Repository<DetalleVenta>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createDetalleVentaDto: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    try {
      const detalleGuardado =
        await this.dataSource.transaction(
          async (manager) => {
            const venta = await manager.findOne(
              Venta,
              {
                where: {
                  id_venta:
                    createDetalleVentaDto.id_venta,
                },
              },
            );

            if (!venta) {
              throw new NotFoundException(
                `La venta con ID ${createDetalleVentaDto.id_venta} no existe`,
              );
            }

            if (venta.estado !== 'BORRADOR') {
              throw new BadRequestException(
                'Solo se pueden agregar medicamentos a una venta en estado BORRADOR',
              );
            }

            const medicamento =
              await manager.findOne(
                Medicamento,
                {
                  where: {
                    id_medicamento:
                      createDetalleVentaDto.id_medicamento,
                    estado: 'ACTIVO',
                  },
                },
              );

            if (!medicamento) {
              throw new NotFoundException(
                'El medicamento no existe o se encuentra inactivo',
              );
            }

            const precioUnitario =
              medicamento.precio_venta;

            const subtotal =
              createDetalleVentaDto.cantidad *
              precioUnitario;

            const detalle = manager.create(
              DetalleVenta,
              {
                id_venta:
                  createDetalleVentaDto.id_venta,

                id_medicamento:
                  createDetalleVentaDto.id_medicamento,

                cantidad:
                  createDetalleVentaDto.cantidad,

                precio_unitario:
                  precioUnitario,

                subtotal,
              },
            );

            const guardado =
              await manager.save(
                DetalleVenta,
                detalle,
              );

            await this.recalcularVenta(
              manager,
              venta,
            );

            return guardado;
          },
        );

      return this.findOne(
        detalleGuardado.id_detalle_venta,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<DetalleVenta[]> {
    return this.detalleVentaRepository.find({
      relations: {
        venta: {
          sucursal: true,
          caja: true,
          usuario: true,
          forma_pago: true,
        },
        medicamento: true,
      },
      order: {
        id_detalle_venta: 'ASC',
      },
    });
  }

  async findOne(
    id: number,
  ): Promise<DetalleVenta> {
    const detalle =
      await this.detalleVentaRepository.findOne({
        where: {
          id_detalle_venta: id,
        },
        relations: {
          venta: {
            sucursal: true,
            caja: true,
            usuario: true,
            forma_pago: true,
          },
          medicamento: true,
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        `El detalle de venta con ID ${id} no existe`,
      );
    }

    return detalle;
  }

  async update(
    id: number,
    updateDetalleVentaDto: UpdateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle =
          await manager.findOne(
            DetalleVenta,
            {
              where: {
                id_detalle_venta: id,
              },
            },
          );

        if (!detalle) {
          throw new NotFoundException(
            `El detalle de venta con ID ${id} no existe`,
          );
        }

        const venta = await manager.findOne(
          Venta,
          {
            where: {
              id_venta: detalle.id_venta,
            },
          },
        );

        if (!venta) {
          throw new NotFoundException(
            'La venta relacionada no existe',
          );
        }

        if (venta.estado !== 'BORRADOR') {
          throw new BadRequestException(
            'Solo se pueden modificar detalles de una venta en estado BORRADOR',
          );
        }

        if (
          updateDetalleVentaDto.cantidad !==
          undefined
        ) {
          detalle.cantidad =
            updateDetalleVentaDto.cantidad;
        }

        detalle.subtotal =
          detalle.cantidad *
          detalle.precio_unitario;

        await manager.save(
          DetalleVenta,
          detalle,
        );

        await this.recalcularVenta(
          manager,
          venta,
        );
      },
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle =
          await manager.findOne(
            DetalleVenta,
            {
              where: {
                id_detalle_venta: id,
              },
            },
          );

        if (!detalle) {
          throw new NotFoundException(
            `El detalle de venta con ID ${id} no existe`,
          );
        }

        const venta = await manager.findOne(
          Venta,
          {
            where: {
              id_venta: detalle.id_venta,
            },
          },
        );

        if (!venta) {
          throw new NotFoundException(
            'La venta relacionada no existe',
          );
        }

        if (venta.estado !== 'BORRADOR') {
          throw new BadRequestException(
            'Solo se pueden eliminar detalles de una venta en estado BORRADOR',
          );
        }

        await manager.remove(
          DetalleVenta,
          detalle,
        );

        await this.recalcularVenta(
          manager,
          venta,
        );
      },
    );
  }

  private async recalcularVenta(
    manager: EntityManager,
    venta: Venta,
  ): Promise<void> {
    const resultado =
      await manager
        .createQueryBuilder(
          DetalleVenta,
          'detalle',
        )
        .select(
          'COALESCE(SUM(detalle.subtotal), 0)',
          'subtotal',
        )
        .where(
          'detalle.id_venta = :id_venta',
          {
            id_venta: venta.id_venta,
          },
        )
        .getRawOne();

    const subtotal = Number(
      resultado.subtotal,
    );

    if (venta.descuento > subtotal) {
      throw new BadRequestException(
        'El descuento de la venta no puede ser mayor que el nuevo subtotal',
      );
    }

    venta.subtotal = subtotal;

    venta.total =
      subtotal - venta.descuento;

    await manager.save(
      Venta,
      venta,
    );
  }

  private handleDatabaseError(
    error: unknown,
  ): never {
    if (error instanceof QueryFailedError) {
      const code =
        (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Este medicamento ya está agregado a la venta',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'Existe un problema con las relaciones del detalle de venta',
        );
      }
    }

    throw error;
  }
}