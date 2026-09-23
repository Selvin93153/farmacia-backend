import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

import { Caja } from '../caja/entites/caja.entity';
import { FormaPago } from '../formas-pago/entities/forma-pago.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

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

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23503') {
        throw new ConflictException(
          'Existe un problema con las relaciones de la venta',
        );
      }
    }

    throw error;
  }
}