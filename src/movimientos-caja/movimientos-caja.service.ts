import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';

import { Caja } from '../caja/entites/caja.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class MovimientosCajaService {
  constructor(
    @InjectRepository(MovimientoCaja)
    private readonly movimientoCajaRepository: Repository<MovimientoCaja>,

    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(
    createMovimientoCajaDto: CreateMovimientoCajaDto,
    id_usuario: number,
  ): Promise<MovimientoCaja> {
    const caja = await this.cajaRepository.findOne({
      where: {
        id_caja: createMovimientoCajaDto.id_caja,
        estado: 'ACTIVA',
      },
    });

    if (!caja) {
      throw new NotFoundException(
        'La caja no existe o se encuentra inactiva',
      );
    }

    const usuarioExiste = await this.usuarioRepository.exists({
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
      const movimiento = this.movimientoCajaRepository.create({
        id_caja: createMovimientoCajaDto.id_caja,
        id_usuario,
        id_venta: null,
        tipo_movimiento: createMovimientoCajaDto.tipo_movimiento,
        concepto: createMovimientoCajaDto.concepto,
        monto: createMovimientoCajaDto.monto,
      });

      const guardado =
        await this.movimientoCajaRepository.save(movimiento);

      return this.findOne(guardado.id_movimiento_caja);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<MovimientoCaja[]> {
    return this.movimientoCajaRepository.find({
      relations: {
        caja: {
          sucursal: {
            municipio: {
              departamento: true,
            },
          },
        },
        usuario: {
          rol: true,
        },
        venta: {
          forma_pago: true,
        },
      },
      order: {
        fecha: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<MovimientoCaja> {
    const movimiento =
      await this.movimientoCajaRepository.findOne({
        where: {
          id_movimiento_caja: id,
        },
        relations: {
          caja: {
            sucursal: {
              municipio: {
                departamento: true,
              },
            },
          },
          usuario: {
            rol: true,
          },
          venta: {
            forma_pago: true,
          },
        },
      });

    if (!movimiento) {
      throw new NotFoundException(
        `El movimiento de caja con ID ${id} no existe`,
      );
    }

    return movimiento;
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23503') {
        throw new ConflictException(
          'Existe un problema con las relaciones del movimiento de caja',
        );
      }
    }

    throw error;
  }
}