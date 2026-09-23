import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

import { Caja } from '../caja/entites/caja.entity';
import { FormaPago } from '../formas-pago/entities/forma-pago.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { DetalleVenta } from '../detalles-venta/entities/detalle-venta.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,

    @InjectRepository(FormaPago)
    private readonly formaPagoRepository: Repository<FormaPago>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createVentaDto: CreateVentaDto,
    id_usuario: number,
  ): Promise<Venta> {
    const caja = await this.cajaRepository.findOne({
      where: {
        id_caja: createVentaDto.id_caja,
        estado: 'ACTIVA',
      },
    });

    if (!caja) {
      throw new NotFoundException(
        'La caja no existe o se encuentra inactiva',
      );
    }

    await this.validarFormaPago(
      createVentaDto.id_forma_pago,
    );

    const usuarioExiste =
      await this.usuarioRepository.exists({
        where: {
          id_usuario,
          estado: 'ACTIVO',
        },
      });

    if (!usuarioExiste) {
      throw new UnauthorizedException(
        'El usuario no está disponible',
      );
    }

    try {
      const venta = this.ventaRepository.create({
        id_sucursal: caja.id_sucursal,
        id_caja: caja.id_caja,
        id_usuario,
        id_forma_pago:
          createVentaDto.id_forma_pago,
        subtotal: 0,
        descuento: 0,
        total: 0,
      });

      const guardada =
        await this.ventaRepository.save(venta);

      return this.findOne(guardada.id_venta);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Venta[]> {
    return this.ventaRepository.find({
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
        caja: true,
        usuario: {
          rol: true,
        },
        forma_pago: true,
      },
      order: {
        fecha: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: {
        id_venta: id,
      },
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
        caja: true,
        usuario: {
          rol: true,
        },
        forma_pago: true,
      },
    });

    if (!venta) {
      throw new NotFoundException(
        `La venta con ID ${id} no existe`,
      );
    }

    return venta;
  }

  async update(
    id: number,
    updateVentaDto: UpdateVentaDto,
  ): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: {
        id_venta: id,
      },
    });

    if (!venta) {
      throw new NotFoundException(
        `La venta con ID ${id} no existe`,
      );
    }

    if (venta.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden modificar ventas en estado BORRADOR',
      );
    }

    if (updateVentaDto.id_forma_pago !== undefined) {
      await this.validarFormaPago(
        updateVentaDto.id_forma_pago,
      );

      venta.id_forma_pago =
        updateVentaDto.id_forma_pago;
    }

    if (updateVentaDto.descuento !== undefined) {
      if (updateVentaDto.descuento > venta.subtotal) {
        throw new BadRequestException(
          'El descuento no puede ser mayor que el subtotal',
        );
      }

      venta.descuento =
        updateVentaDto.descuento;
    }

    venta.total =
      venta.subtotal - venta.descuento;

    try {
      await this.ventaRepository.save(venta);

      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async finalizar(
    id: number,
    id_usuario: number,
  ): Promise<Venta> {
    await this.dataSource.transaction(
      async (manager) => {
        const venta = await manager.findOne(
          Venta,
          {
            where: {
              id_venta: id,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          },
        );

        if (!venta) {
          throw new NotFoundException(
            `La venta con ID ${id} no existe`,
          );
        }

        if (venta.estado !== 'BORRADOR') {
          throw new BadRequestException(
            'Solo se pueden finalizar ventas en estado BORRADOR',
          );
        }

        const usuarioExiste =
          await manager.exists(Usuario, {
            where: {
              id_usuario,
              estado: 'ACTIVO',
            },
          });

        if (!usuarioExiste) {
          throw new UnauthorizedException(
            'El usuario no está disponible',
          );
        }

        const detalles = await manager.find(
          DetalleVenta,
          {
            where: {
              id_venta: id,
            },
          },
        );

        if (detalles.length === 0) {
          throw new BadRequestException(
            'La venta no tiene medicamentos agregados',
          );
        }

        for (const detalle of detalles) {
          const inventario =
            await manager.findOne(
              Inventario,
              {
                where: {
                  id_sucursal:
                    venta.id_sucursal,
                  id_medicamento:
                    detalle.id_medicamento,
                },
                lock: {
                  mode: 'pessimistic_write',
                },
              },
            );

          if (!inventario) {
            throw new BadRequestException(
              `El medicamento con ID ${detalle.id_medicamento} no tiene inventario en esta sucursal`,
            );
          }

          if (
            inventario.stock_actual <
            detalle.cantidad
          ) {
            throw new BadRequestException(
              `No hay suficiente stock del medicamento con ID ${detalle.id_medicamento}`,
            );
          }

          const stockAnterior =
            inventario.stock_actual;

          const stockNuevo =
            stockAnterior - detalle.cantidad;

          inventario.stock_actual =
            stockNuevo;

          await manager.save(
            Inventario,
            inventario,
          );

          const movimiento =
            manager.create(
              MovimientoInventario,
              {
                id_inventario:
                  inventario.id_inventario,

                id_usuario,

                tipo_movimiento: 'SALIDA',

                motivo: 'VENTA',

                cantidad:
                  detalle.cantidad,

                stock_anterior:
                  stockAnterior,

                stock_nuevo:
                  stockNuevo,

                referencia:
                  `VENTA-${venta.id_venta}`,

                observacion:
                  'Salida automática por venta',
              },
            );

          await manager.save(
            MovimientoInventario,
            movimiento,
          );
        }

        venta.estado = 'COMPLETADA';

        await manager.save(
          Venta,
          venta,
        );
      },
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const venta = await this.ventaRepository.findOne({
      where: {
        id_venta: id,
      },
    });

    if (!venta) {
      throw new NotFoundException(
        `La venta con ID ${id} no existe`,
      );
    }

    if (venta.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden eliminar ventas en estado BORRADOR',
      );
    }

    try {
      await this.ventaRepository.remove(venta);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async validarFormaPago(
    id_forma_pago: number,
  ): Promise<void> {
    const existe =
      await this.formaPagoRepository.exists({
        where: {
          id_forma_pago,
          estado: 'ACTIVO',
        },
      });

    if (!existe) {
      throw new NotFoundException(
        'La forma de pago no existe o se encuentra inactiva',
      );
    }
  }

  private handleDatabaseError(
    error: unknown,
  ): never {
    if (error instanceof QueryFailedError) {
      const code =
        (error as any).driverError?.code;

      if (code === '23503') {
        throw new ConflictException(
          'Existe un problema con las relaciones de la venta',
        );
      }
    }

    throw error;
  }
}