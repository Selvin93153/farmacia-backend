import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
} from 'typeorm';

import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';

import { Inventario } from '../inventarios/entities/inventario.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

export interface ProcesarMovimientoInventarioData {
  id_inventario: number;
  tipo_movimiento: string;
  motivo: string;
  cantidad: number;
  referencia?: string | null;
  observacion?: string | null;
}

@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepository: Repository<MovimientoInventario>,

    private readonly dataSource: DataSource,
  ) {}

  // Registra un movimiento manual de inventario.
  async create(
    createMovimientoDto: CreateMovimientoInventarioDto,
    id_usuario: number,
  ): Promise<MovimientoInventario> {
    const movimientoGuardado =
      await this.dataSource.transaction(async (manager) => {
        return this.procesarEnTransaccion(
          manager,
          createMovimientoDto,
          id_usuario,
        );
      });

    return this.findOne(movimientoGuardado.id_movimiento);
  }

  // Procesa un movimiento de inventario dentro de una transacción existente.
  async procesarEnTransaccion(
    manager: EntityManager,
    datos: ProcesarMovimientoInventarioData,
    id_usuario: number,
  ): Promise<MovimientoInventario> {
    const usuario = await manager.findOne(Usuario, {
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

    if (
      datos.tipo_movimiento !== 'ENTRADA' &&
      datos.tipo_movimiento !== 'SALIDA'
    ) {
      throw new BadRequestException(
        'El tipo de movimiento debe ser ENTRADA o SALIDA',
      );
    }

    if (
      !Number.isInteger(datos.cantidad) ||
      datos.cantidad <= 0
    ) {
      throw new BadRequestException(
        'La cantidad debe ser un número entero mayor que cero',
      );
    }

    const inventario = await manager.findOne(Inventario, {
      where: {
        id_inventario: datos.id_inventario,
      },
      lock: {
        mode: 'pessimistic_write',
      },
    });

    if (!inventario) {
      throw new NotFoundException(
        `El inventario con ID ${datos.id_inventario} no existe`,
      );
    }

    const stockAnterior = inventario.stock_actual;

    let stockNuevo = stockAnterior;

    if (datos.tipo_movimiento === 'ENTRADA') {
      stockNuevo += datos.cantidad;
    }

    if (datos.tipo_movimiento === 'SALIDA') {
      stockNuevo -= datos.cantidad;

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
        id_inventario: datos.id_inventario,
        id_usuario,
        tipo_movimiento: datos.tipo_movimiento,
        motivo: datos.motivo,
        cantidad: datos.cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        referencia: datos.referencia ?? null,
        observacion: datos.observacion ?? null,
      },
    );

    return manager.save(
      MovimientoInventario,
      movimiento,
    );
  }

  // Obtiene todos los movimientos de inventario.
  async findAll(): Promise<MovimientoInventario[]> {
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

  // Consulta los movimientos de inventario de la sucursal del usuario autenticado.
  async findMiSucursal(
    id_usuario: number,
  ): Promise<MovimientoInventario[]> {
    const usuario =
      await this.dataSource.manager.findOne(
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
        'El usuario no existe o se encuentra inactivo',
      );
    }

    if (usuario.id_sucursal == null) {
      throw new ForbiddenException(
        'El usuario no tiene una sucursal asignada',
      );
    }

    return this.movimientoRepository.find({
      where: {
        inventario: {
          id_sucursal: usuario.id_sucursal,
        },
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
      order: {
        fecha: 'DESC',
      },
    });
  }

  // Obtiene un movimiento de inventario por su identificador.
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