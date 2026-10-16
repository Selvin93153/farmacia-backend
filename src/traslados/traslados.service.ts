import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DetalleTraslado } from '../detalles-traslado/entities/detalle-traslado.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { MovimientosInventarioService } from '../movimientos-inventario/movimientos-inventario.service';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { CreateTrasladoDto } from './dto/create-traslado.dto';
import { EnviarTrasladoDto } from './dto/enviar-traslado.dto';
import { RecibirTrasladoDto } from './dto/recibir-traslado.dto';
import { UpdateTrasladoDto } from './dto/update-traslado.dto';
import { Traslado } from './entities/traslado.entity';

@Injectable()
export class TrasladosService {
  constructor(
    @InjectRepository(Traslado)
    private readonly trasladoRepository: Repository<Traslado>,

    private readonly movimientosInventarioService: MovimientosInventarioService,

    private readonly dataSource: DataSource,
  ) {}

  // Obtiene la sucursal asignada al usuario autenticado.
  async findMiSucursal(id_usuario: number): Promise<Sucursal> {
    const usuario = await this.dataSource.manager.findOne(Usuario, {
      where: {
        id_usuario,
        estado: 'ACTIVO',
      },
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'El usuario no existe o se encuentra inactivo.',
      );
    }

    if (usuario.id_sucursal == null || !usuario.sucursal) {
      throw new ForbiddenException(
        'El usuario no tiene una sucursal asignada.',
      );
    }

    return usuario.sucursal;
  }

  // Crea un traslado usando la sucursal del usuario como origen.
  async create(
    dto: CreateTrasladoDto,
    id_usuario: number,
  ): Promise<Traslado> {
    const idTraslado = await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.findOne(Usuario, {
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

      if (usuario.id_sucursal === dto.id_sucursal_destino) {
        throw new BadRequestException(
          'La sucursal origen y la sucursal destino deben ser diferentes.',
        );
      }

      const sucursalOrigen = await manager.findOne(Sucursal, {
        where: {
          id_sucursal: usuario.id_sucursal,
          estado: 'ACTIVA',
        },
      });

      if (!sucursalOrigen) {
        throw new BadRequestException(
          'La sucursal origen no existe o está inactiva.',
        );
      }

      const sucursalDestino = await manager.findOne(Sucursal, {
        where: {
          id_sucursal: dto.id_sucursal_destino,
          estado: 'ACTIVA',
        },
      });

      if (!sucursalDestino) {
        throw new BadRequestException(
          'La sucursal destino no existe o está inactiva.',
        );
      }

      const traslado = manager.create(Traslado, {
        id_sucursal_origen: usuario.id_sucursal,
        id_sucursal_destino: dto.id_sucursal_destino,
        id_usuario_solicita: id_usuario,
        id_usuario_envia: null,
        id_usuario_recibe: null,
        fecha_envio: null,
        fecha_recepcion: null,
        estado: 'SOLICITADO',
        observaciones: dto.observaciones || null,
      });

      const trasladoGuardado = await manager.save(Traslado, traslado);

      return trasladoGuardado.id_traslado;
    });

    return this.findOne(idTraslado);
  }

  // Obtiene todos los traslados registrados.
  async findAll(): Promise<Traslado[]> {
    return this.trasladoRepository.find({
      relations: {
        sucursal_origen: {
          municipio: {
            departamento: true,
          },
        },
        sucursal_destino: {
          municipio: {
            departamento: true,
          },
        },
        usuario_solicita: {
          rol: true,
        },
        usuario_envia: {
          rol: true,
        },
        usuario_recibe: {
          rol: true,
        },
        detalles: {
          medicamento: true,
        },
      },
      order: {
        id_traslado: 'DESC',
      },
    });
  }

  // Obtiene un traslado por su identificador.
  async findOne(id: number): Promise<Traslado> {
    const traslado = await this.trasladoRepository.findOne({
      where: {
        id_traslado: id,
      },
      relations: {
        sucursal_origen: {
          municipio: {
            departamento: true,
          },
        },
        sucursal_destino: {
          municipio: {
            departamento: true,
          },
        },
        usuario_solicita: {
          rol: true,
        },
        usuario_envia: {
          rol: true,
        },
        usuario_recibe: {
          rol: true,
        },
        detalles: {
          medicamento: true,
        },
      },
    });

    if (!traslado) {
      throw new NotFoundException('El traslado no existe.');
    }

    return traslado;
  }

  // Modifica un traslado mientras se encuentre solicitado.
  async update(
    id: number,
    dto: UpdateTrasladoDto,
    id_usuario: number,
  ): Promise<Traslado> {
    await this.dataSource.transaction(async (manager) => {
      const traslado = await manager.findOne(Traslado, {
        where: {
          id_traslado: id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!traslado) {
        throw new NotFoundException('El traslado no existe.');
      }

      if (traslado.estado !== 'SOLICITADO') {
        throw new BadRequestException(
          'Solo se puede modificar un traslado SOLICITADO.',
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

      if (usuario.id_sucursal !== traslado.id_sucursal_origen) {
        throw new ForbiddenException(
          'Solo la sucursal origen puede modificar el traslado.',
        );
      }

      if (dto.id_sucursal_destino !== undefined) {
        if (
          dto.id_sucursal_destino === traslado.id_sucursal_origen
        ) {
          throw new BadRequestException(
            'La sucursal origen y destino deben ser diferentes.',
          );
        }

        const sucursalDestino = await manager.findOne(Sucursal, {
          where: {
            id_sucursal: dto.id_sucursal_destino,
            estado: 'ACTIVA',
          },
        });

        if (!sucursalDestino) {
          throw new BadRequestException(
            'La sucursal destino no existe o está inactiva.',
          );
        }

        traslado.id_sucursal_destino = dto.id_sucursal_destino;
      }

      if (dto.observaciones !== undefined) {
        traslado.observaciones = dto.observaciones || null;
      }

      await manager.save(Traslado, traslado);
    });

    return this.findOne(id);
  }

  // Envía el traslado y descuenta el inventario de la sucursal origen.
  async enviar(
    id: number,
    dto: EnviarTrasladoDto,
    id_usuario: number,
  ): Promise<Traslado> {
    await this.dataSource.transaction(async (manager) => {
      const traslado = await manager.findOne(Traslado, {
        where: {
          id_traslado: id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!traslado) {
        throw new NotFoundException('El traslado no existe.');
      }

      if (traslado.estado !== 'SOLICITADO') {
        throw new BadRequestException(
          'Solo se puede enviar un traslado SOLICITADO.',
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

      if (usuario.id_sucursal !== traslado.id_sucursal_origen) {
        throw new ForbiddenException(
          'Solo un usuario de la sucursal origen puede enviar el traslado.',
        );
      }

      const detalles = await manager.find(DetalleTraslado, {
        where: {
          id_traslado: id,
        },
        order: {
          id_detalle_traslado: 'ASC',
        },
      });

      if (detalles.length === 0) {
        throw new BadRequestException(
          'El traslado no contiene medicamentos.',
        );
      }

      if (dto.detalles.length !== detalles.length) {
        throw new BadRequestException(
          'Debe indicar la cantidad enviada de todos los medicamentos.',
        );
      }

      const idsDetalles = dto.detalles.map(
        (detalle) => detalle.id_detalle_traslado,
      );

      if (new Set(idsDetalles).size !== idsDetalles.length) {
        throw new BadRequestException(
          'Existen detalles repetidos en la solicitud.',
        );
      }

      const mapaCantidades = new Map(
        dto.detalles.map((detalle) => [
          detalle.id_detalle_traslado,
          detalle.cantidad_enviada,
        ]),
      );

      let totalEnviado = 0;

      const detallesOrdenados = [...detalles].sort(
        (a, b) => a.id_medicamento - b.id_medicamento,
      );

      for (const detalle of detallesOrdenados) {
        const cantidadEnviada = mapaCantidades.get(
          detalle.id_detalle_traslado,
        );

        if (cantidadEnviada === undefined) {
          throw new BadRequestException(
            `Falta indicar la cantidad enviada del detalle ${detalle.id_detalle_traslado}.`,
          );
        }

        if (cantidadEnviada > detalle.cantidad_solicitada) {
          throw new BadRequestException(
            'La cantidad enviada no puede ser mayor que la cantidad solicitada.',
          );
        }

        detalle.cantidad_enviada = cantidadEnviada;

        totalEnviado += cantidadEnviada;

        if (cantidadEnviada > 0) {
          const inventario = await manager.findOne(Inventario, {
            where: {
              id_sucursal: traslado.id_sucursal_origen,
              id_medicamento: detalle.id_medicamento,
            },
          });

          if (!inventario) {
            throw new BadRequestException(
              `El medicamento con ID ${detalle.id_medicamento} no tiene inventario en la sucursal origen.`,
            );
          }

          await this.movimientosInventarioService.procesarEnTransaccion(
            manager,
            {
              id_inventario: inventario.id_inventario,
              tipo_movimiento: 'SALIDA',
              motivo: 'TRASLADO',
              cantidad: cantidadEnviada,
              referencia: `TRASLADO-${traslado.id_traslado}`,
              observacion:
                'Salida automática por traslado entre sucursales',
            },
            id_usuario,
          );
        }

        await manager.save(DetalleTraslado, detalle);
      }

      if (totalEnviado === 0) {
        throw new BadRequestException(
          'Debe enviarse al menos una unidad.',
        );
      }

      traslado.id_usuario_envia = id_usuario;
      traslado.fecha_envio = new Date();
      traslado.estado = 'ENVIADO';

      await manager.save(Traslado, traslado);
    });

    return this.findOne(id);
  }

  // Recibe el traslado y aumenta el inventario de la sucursal destino.
  async recibir(
    id: number,
    dto: RecibirTrasladoDto,
    id_usuario: number,
  ): Promise<Traslado> {
    await this.dataSource.transaction(async (manager) => {
      const traslado = await manager.findOne(Traslado, {
        where: {
          id_traslado: id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!traslado) {
        throw new NotFoundException('El traslado no existe.');
      }

      if (traslado.estado !== 'ENVIADO') {
        throw new BadRequestException(
          'Solo se puede recibir un traslado ENVIADO.',
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

      if (usuario.id_sucursal !== traslado.id_sucursal_destino) {
        throw new ForbiddenException(
          'Solo un usuario de la sucursal destino puede recibir el traslado.',
        );
      }

      const detalles = await manager.find(DetalleTraslado, {
        where: {
          id_traslado: id,
        },
        order: {
          id_detalle_traslado: 'ASC',
        },
      });

      if (detalles.length === 0) {
        throw new BadRequestException(
          'El traslado no contiene medicamentos.',
        );
      }

      if (dto.detalles.length !== detalles.length) {
        throw new BadRequestException(
          'Debe indicar la cantidad recibida de todos los medicamentos.',
        );
      }

      const idsDetalles = dto.detalles.map(
        (detalle) => detalle.id_detalle_traslado,
      );

      if (new Set(idsDetalles).size !== idsDetalles.length) {
        throw new BadRequestException(
          'Existen detalles repetidos en la solicitud.',
        );
      }

      const mapaCantidades = new Map(
        dto.detalles.map((detalle) => [
          detalle.id_detalle_traslado,
          detalle.cantidad_recibida,
        ]),
      );

      let totalRecibido = 0;

      const detallesOrdenados = [...detalles].sort(
        (a, b) => a.id_medicamento - b.id_medicamento,
      );

      for (const detalle of detallesOrdenados) {
        const cantidadRecibida = mapaCantidades.get(
          detalle.id_detalle_traslado,
        );

        if (cantidadRecibida === undefined) {
          throw new BadRequestException(
            `Falta indicar la cantidad recibida del detalle ${detalle.id_detalle_traslado}.`,
          );
        }

        const cantidadEnviada = detalle.cantidad_enviada ?? 0;

        if (cantidadRecibida > cantidadEnviada) {
          throw new BadRequestException(
            'La cantidad recibida no puede ser mayor que la cantidad enviada.',
          );
        }

        detalle.cantidad_recibida = cantidadRecibida;

        totalRecibido += cantidadRecibida;

        if (cantidadRecibida > 0) {
          let inventario = await manager.findOne(Inventario, {
            where: {
              id_sucursal: traslado.id_sucursal_destino,
              id_medicamento: detalle.id_medicamento,
            },
          });

          if (!inventario) {
            inventario = manager.create(Inventario, {
              id_sucursal: traslado.id_sucursal_destino,
              id_medicamento: detalle.id_medicamento,
              stock_actual: 0,
              stock_minimo: 0,
            });

            inventario = await manager.save(
              Inventario,
              inventario,
            );
          }

          await this.movimientosInventarioService.procesarEnTransaccion(
            manager,
            {
              id_inventario: inventario.id_inventario,
              tipo_movimiento: 'ENTRADA',
              motivo: 'TRASLADO',
              cantidad: cantidadRecibida,
              referencia: `TRASLADO-${traslado.id_traslado}`,
              observacion:
                'Entrada automática por traslado entre sucursales',
            },
            id_usuario,
          );
        }

        await manager.save(DetalleTraslado, detalle);
      }

      if (totalRecibido === 0) {
        throw new BadRequestException(
          'Debe recibirse al menos una unidad.',
        );
      }

      traslado.id_usuario_recibe = id_usuario;
      traslado.fecha_recepcion = new Date();
      traslado.estado = 'RECIBIDO';

      await manager.save(Traslado, traslado);
    });

    return this.findOne(id);
  }

  // Cancela un traslado que todavía no ha sido enviado.
  async cancelar(
    id: number,
    id_usuario: number,
  ): Promise<Traslado> {
    await this.dataSource.transaction(async (manager) => {
      const traslado = await manager.findOne(Traslado, {
        where: {
          id_traslado: id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!traslado) {
        throw new NotFoundException('El traslado no existe.');
      }

      if (traslado.estado !== 'SOLICITADO') {
        throw new BadRequestException(
          'Solo se puede cancelar un traslado SOLICITADO.',
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

      if (usuario.id_sucursal !== traslado.id_sucursal_origen) {
        throw new ForbiddenException(
          'Solo la sucursal origen puede cancelar el traslado.',
        );
      }

      traslado.estado = 'CANCELADO';

      await manager.save(Traslado, traslado);
    });

    return this.findOne(id);
  }
}