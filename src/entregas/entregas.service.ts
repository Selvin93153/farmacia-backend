import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
} from 'typeorm';

import { DetallePedido } from '../detalles-pedido/entities/detalle-pedido.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { MovimientosInventarioService } from '../movimientos-inventario/movimientos-inventario.service';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { AsignarRepartidorDto } from './dto/asignar-repartidor.dto';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { UpdateEntregaDto } from './dto/update-entrega.dto';
import { Entrega } from './entities/entrega.entity';

@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,

    private readonly movimientosInventarioService:
      MovimientosInventarioService,

    private readonly dataSource: DataSource,
  ) {}

  // Calcula la distancia aproximada entre la sucursal y el cliente.
  private calcularDistanciaKm(
    latitudOrigen: number,
    longitudOrigen: number,
    latitudDestino: number,
    longitudDestino: number,
  ): number {
    const radioTierraKm = 6371;

    const convertirRadianes = (grados: number) =>
      (grados * Math.PI) / 180;

    const diferenciaLatitud = convertirRadianes(
      latitudDestino - latitudOrigen,
    );

    const diferenciaLongitud = convertirRadianes(
      longitudDestino - longitudOrigen,
    );

    const latitudOrigenRad =
      convertirRadianes(latitudOrigen);

    const latitudDestinoRad =
      convertirRadianes(latitudDestino);

    const a =
      Math.sin(diferenciaLatitud / 2) ** 2 +
      Math.cos(latitudOrigenRad) *
        Math.cos(latitudDestinoRad) *
        Math.sin(diferenciaLongitud / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a),
      );

    return radioTierraKm * c;
  }

  // Calcula el tiempo estimado de preparación y traslado.
  private calcularTiempoEstimado(
    distanciaKm: number,
  ): number {
    const tiempoPreparacionMin = 15;
    const velocidadPromedioKmHora = 30;

    const tiempoTrasladoMin =
      (distanciaKm /
        velocidadPromedioKmHora) *
      60;

    return Math.ceil(
      tiempoPreparacionMin +
        tiempoTrasladoMin,
    );
  }

  // Crea la entrega, descuenta el inventario y registra sus movimientos.
  async create(
    createEntregaDto: CreateEntregaDto,
    id_usuario: number,
  ): Promise<Entrega> {
    const idEntrega =
      await this.dataSource.transaction(
        async (manager) => {
          const pedido =
            await manager.findOne(
              Pedido,
              {
                where: {
                  id_pedido:
                    createEntregaDto.id_pedido,
                },
                lock: {
                  mode: 'pessimistic_write',
                },
              },
            );

          if (!pedido) {
            throw new NotFoundException(
              'El pedido indicado no existe.',
            );
          }

          if (
            pedido.estado !== 'CONFIRMADO'
          ) {
            throw new BadRequestException(
              'Solo se puede crear una entrega para un pedido CONFIRMADO.',
            );
          }

          if (
            !pedido.id_sucursal_asignada
          ) {
            throw new BadRequestException(
              'El pedido debe tener una sucursal asignada.',
            );
          }

          const entregaExistente =
            await manager.findOne(
              Entrega,
              {
                where: {
                  id_pedido:
                    pedido.id_pedido,
                },
              },
            );

          if (entregaExistente) {
            throw new ConflictException(
              'El pedido ya tiene una entrega registrada.',
            );
          }

          const sucursal =
            await manager.findOne(
              Sucursal,
              {
                where: {
                  id_sucursal:
                    pedido.id_sucursal_asignada,
                },
              },
            );

          if (!sucursal) {
            throw new NotFoundException(
              'La sucursal asignada al pedido no existe.',
            );
          }

          if (
            sucursal.estado !== 'ACTIVA'
          ) {
            throw new BadRequestException(
              'La sucursal asignada al pedido está inactiva.',
            );
          }

          const detalles =
            await manager.find(
              DetallePedido,
              {
                where: {
                  id_pedido:
                    pedido.id_pedido,
                },
              },
            );

          if (
            detalles.length === 0
          ) {
            throw new BadRequestException(
              'El pedido no contiene medicamentos.',
            );
          }

          /*
           * Descuenta cada medicamento utilizando la misma lógica
           * centralizada de movimientos de inventario.
           */
          for (const detalle of detalles) {
            const inventario =
              await manager.findOne(
                Inventario,
                {
                  where: {
                    id_sucursal:
                      pedido.id_sucursal_asignada,

                    id_medicamento:
                      detalle.id_medicamento,
                  },
                },
              );

            if (!inventario) {
              throw new BadRequestException(
                `El medicamento con ID ${detalle.id_medicamento} no tiene inventario en la sucursal asignada.`,
              );
            }

            await this.movimientosInventarioService
              .procesarEnTransaccion(
                manager,
                {
                  id_inventario:
                    inventario.id_inventario,

                  tipo_movimiento:
                    'SALIDA',

                  motivo:
                    'PEDIDO',

                  cantidad:
                    detalle.cantidad,

                  referencia:
                    `PEDIDO-${pedido.id_pedido}`,

                  observacion:
                    'Salida automática por preparación de pedido',
                },
                id_usuario,
              );
          }

          const latitudSucursal =
            Number(sucursal.latitud);

          const longitudSucursal =
            Number(sucursal.longitud);

          const latitudEntrega =
            Number(
              pedido.latitud_entrega,
            );

          const longitudEntrega =
            Number(
              pedido.longitud_entrega,
            );

          const distanciaKm =
            this.calcularDistanciaKm(
              latitudSucursal,
              longitudSucursal,
              latitudEntrega,
              longitudEntrega,
            );

          const tiempoEstimadoMin =
            this.calcularTiempoEstimado(
              distanciaKm,
            );

          const entrega =
            manager.create(
              Entrega,
              {
                id_pedido:
                  pedido.id_pedido,

                id_repartidor:
                  null,

                fecha_asignacion:
                  null,

                fecha_salida:
                  null,

                fecha_entrega:
                  null,

                tiempo_estimado_min:
                  tiempoEstimadoMin,

                estado:
                  'PENDIENTE',

                observaciones:
                  null,
              },
            );

          const entregaGuardada =
            await manager.save(
              Entrega,
              entrega,
            );

          pedido.estado =
            'EN_PREPARACION';

          await manager.save(
            Pedido,
            pedido,
          );

          return entregaGuardada.id_entrega;
        },
      );

    return this.findOne(idEntrega);
  }

  // Obtiene todas las entregas registradas.
  async findAll(): Promise<Entrega[]> {
    return this.entregaRepository.find({
      relations: {
        pedido: {
          cliente: true,

          sucursal_asignada: {
            municipio: {
              departamento: true,
            },
          },

          forma_pago: true,
        },

        repartidor: {
          rol: true,
          sucursal: true,
        },
      },

      order: {
        id_entrega: 'DESC',
      },
    });
  }

  // Obtiene una entrega específica por su identificador.
  async findOne(
    id: number,
  ): Promise<Entrega> {
    const entrega =
      await this.entregaRepository.findOne({
        where: {
          id_entrega: id,
        },

        relations: {
          pedido: {
            cliente: true,

            sucursal_asignada: {
              municipio: {
                departamento: true,
              },
            },

            forma_pago: true,
          },

          repartidor: {
            rol: true,
            sucursal: true,
          },
        },
      });

    if (!entrega) {
      throw new NotFoundException(
        'La entrega no existe.',
      );
    }

    return entrega;
  }

  // Actualiza únicamente las observaciones de una entrega.
  async update(
    id: number,
    updateEntregaDto: UpdateEntregaDto,
  ): Promise<Entrega> {
    const entrega =
      await this.entregaRepository.findOne({
        where: {
          id_entrega: id,
        },
      });

    if (!entrega) {
      throw new NotFoundException(
        'La entrega no existe.',
      );
    }

    if (
      entrega.estado === 'ENTREGADA'
    ) {
      throw new BadRequestException(
        'Una entrega completada ya no puede modificarse.',
      );
    }

    if (
      updateEntregaDto.observaciones !==
      undefined
    ) {
      entrega.observaciones =
        updateEntregaDto.observaciones.trim() ||
        null;
    }

    await this.entregaRepository.save(
      entrega,
    );

    return this.findOne(id);
  }

  // Asigna un repartidor activo de la misma sucursal del pedido.
  async asignarRepartidor(
    id: number,
    asignarRepartidorDto: AsignarRepartidorDto,
  ): Promise<Entrega> {
    await this.dataSource.transaction(
      async (manager) => {
        const entrega =
          await manager.findOne(
            Entrega,
            {
              where: {
                id_entrega: id,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!entrega) {
          throw new NotFoundException(
            'La entrega no existe.',
          );
        }

        if (
          ![
            'PENDIENTE',
            'ASIGNADA',
          ].includes(entrega.estado)
        ) {
          throw new BadRequestException(
            'El repartidor solo puede asignarse antes de iniciar la entrega.',
          );
        }

        const pedido =
          await manager.findOne(
            Pedido,
            {
              where: {
                id_pedido:
                  entrega.id_pedido,
              },
              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!pedido) {
          throw new NotFoundException(
            'El pedido asociado no existe.',
          );
        }

        if (
          !pedido.id_sucursal_asignada
        ) {
          throw new BadRequestException(
            'El pedido no tiene una sucursal asignada.',
          );
        }

        const repartidor =
          await manager.findOne(
            Usuario,
            {
              where: {
                id_usuario:
                  asignarRepartidorDto.id_repartidor,
              },
            },
          );

        if (!repartidor) {
          throw new NotFoundException(
            'El repartidor indicado no existe.',
          );
        }

        if (
          repartidor.estado !== 'ACTIVO'
        ) {
          throw new BadRequestException(
            'El repartidor indicado está inactivo.',
          );
        }

        if (
          repartidor.id_sucursal !==
          pedido.id_sucursal_asignada
        ) {
          throw new BadRequestException(
            'El repartidor debe pertenecer a la sucursal asignada al pedido.',
          );
        }

        entrega.id_repartidor =
          repartidor.id_usuario;

        entrega.fecha_asignacion =
          new Date();

        entrega.estado =
          'ASIGNADA';

        await manager.save(
          Entrega,
          entrega,
        );
      },
    );

    return this.findOne(id);
  }

  // Inicia el recorrido de una entrega previamente asignada.
  async iniciar(
    id: number,
  ): Promise<Entrega> {
    await this.dataSource.transaction(
      async (manager) => {
        const entrega =
          await manager.findOne(
            Entrega,
            {
              where: {
                id_entrega: id,
              },

              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!entrega) {
          throw new NotFoundException(
            'La entrega no existe.',
          );
        }

        if (
          entrega.estado !== 'ASIGNADA'
        ) {
          throw new BadRequestException(
            'La entrega debe estar ASIGNADA antes de iniciar el recorrido.',
          );
        }

        if (!entrega.id_repartidor) {
          throw new BadRequestException(
            'La entrega debe tener un repartidor asignado.',
          );
        }

        const pedido =
          await manager.findOne(
            Pedido,
            {
              where: {
                id_pedido:
                  entrega.id_pedido,
              },

              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!pedido) {
          throw new NotFoundException(
            'El pedido asociado no existe.',
          );
        }

        entrega.estado =
          'EN_RUTA';

        entrega.fecha_salida =
          new Date();

        pedido.estado =
          'EN_ENTREGA';

        await manager.save(
          Entrega,
          entrega,
        );

        await manager.save(
          Pedido,
          pedido,
        );
      },
    );

    return this.findOne(id);
  }

  // Marca una entrega como completada y el pedido como entregado.
  async completar(
    id: number,
  ): Promise<Entrega> {
    await this.dataSource.transaction(
      async (manager) => {
        const entrega =
          await manager.findOne(
            Entrega,
            {
              where: {
                id_entrega: id,
              },

              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!entrega) {
          throw new NotFoundException(
            'La entrega no existe.',
          );
        }

        if (
          entrega.estado !== 'EN_RUTA'
        ) {
          throw new BadRequestException(
            'Solo se puede completar una entrega que esté EN_RUTA.',
          );
        }

        const pedido =
          await manager.findOne(
            Pedido,
            {
              where: {
                id_pedido:
                  entrega.id_pedido,
              },

              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!pedido) {
          throw new NotFoundException(
            'El pedido asociado no existe.',
          );
        }

        entrega.estado =
          'ENTREGADA';

        entrega.fecha_entrega =
          new Date();

        pedido.estado =
          'ENTREGADO';

        await manager.save(
          Entrega,
          entrega,
        );

        await manager.save(
          Pedido,
          pedido,
        );
      },
    );

    return this.findOne(id);
  }
}