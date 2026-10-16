import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  In,
  Repository,
} from 'typeorm';

import { Cliente } from '../cliente/entities/cliente.entity';
import { DetallePedido } from '../detalles-pedido/entities/detalle-pedido.entity';
import { FormaPago } from '../formas-pago/entities/forma-pago.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AsignarSucursalPedidoDto } from './dto/asignar-sucursal-pedido.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido } from './entities/pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(FormaPago)
    private readonly formaPagoRepository: Repository<FormaPago>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(DetallePedido)
    private readonly detallePedidoRepository: Repository<DetallePedido>,

    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    private readonly dataSource: DataSource,
  ) {}

  // Calcula la distancia aproximada en kilómetros entre dos coordenadas.
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

  // Calcula un tiempo estimado de preparación y traslado del pedido usando distancia con Haversine
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

  // Registra un nuevo pedido en estado borrador.
  async create(
    createPedidoDto: CreatePedidoDto,
    idUsuario: number,
  ): Promise<Pedido> {
    const cliente =
      await this.clienteRepository.findOne({
        where: {
          id_cliente:
            createPedidoDto.id_cliente,
        },
      });

    if (!cliente) {
      throw new NotFoundException(
        'El cliente indicado no existe.',
      );
    }

    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          id_usuario: idUsuario,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'El usuario que registra el pedido no existe.',
      );
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El usuario que registra el pedido está inactivo.',
      );
    }

    let idFormaPago: number | null = null;

    if (
      createPedidoDto.id_forma_pago !==
      undefined
    ) {
      const formaPago =
        await this.formaPagoRepository.findOne({
          where: {
            id_forma_pago:
              createPedidoDto.id_forma_pago,
          },
        });

      if (!formaPago) {
        throw new NotFoundException(
          'La forma de pago indicada no existe.',
        );
      }

      if (formaPago.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'La forma de pago indicada está inactiva.',
        );
      }

      idFormaPago =
        formaPago.id_forma_pago;
    }

    const pedido =
      this.pedidoRepository.create({
        id_cliente:
          cliente.id_cliente,

        id_sucursal_asignada: null,

        id_forma_pago:
          idFormaPago,

        id_usuario_registra:
          usuario.id_usuario,

        direccion_entrega:
          createPedidoDto.direccion_entrega.trim(),

        latitud_entrega:
          createPedidoDto.latitud_entrega,

        longitud_entrega:
          createPedidoDto.longitud_entrega,

        canal:
          createPedidoDto.canal.toUpperCase(),

        total: 0,

        estado: 'BORRADOR',
      });

    const pedidoGuardado =
      await this.pedidoRepository.save(
        pedido,
      );

    return this.findOne(
      pedidoGuardado.id_pedido,
    );
  }

  // Obtiene todos los pedidos registrados.
  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      relations: {
        cliente: true,

        sucursal_asignada: {
          municipio: {
            departamento: true,
          },
        },

        forma_pago: true,

        usuario_registra: {
          rol: true,
        },
      },

      order: {
        fecha: 'DESC',
        id_pedido: 'DESC',
      },
    });
  }

  // Obtiene un pedido específico por su identificador.
  async findOne(
    id: number,
  ): Promise<Pedido> {
    const pedido =
      await this.pedidoRepository.findOne({
        where: {
          id_pedido: id,
        },

        relations: {
          cliente: true,

          sucursal_asignada: {
            municipio: {
              departamento: true,
            },
          },

          forma_pago: true,

          usuario_registra: {
            rol: true,
          },
        },
      });

    if (!pedido) {
      throw new NotFoundException(
        'El pedido no existe.',
      );
    }

    return pedido;
  }

  // Actualiza los datos permitidos de un pedido en borrador.
  async update(
    id: number,
    updatePedidoDto: UpdatePedidoDto,
  ): Promise<Pedido> {
    const pedido =
      await this.pedidoRepository.findOne({
        where: {
          id_pedido: id,
        },
      });

    if (!pedido) {
      throw new NotFoundException(
        'El pedido no existe.',
      );
    }

    if (pedido.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden modificar pedidos en estado BORRADOR.',
      );
    }

    if (
      updatePedidoDto.id_cliente !==
      undefined
    ) {
      const cliente =
        await this.clienteRepository.findOne({
          where: {
            id_cliente:
              updatePedidoDto.id_cliente,
          },
        });

      if (!cliente) {
        throw new NotFoundException(
          'El cliente indicado no existe.',
        );
      }

      pedido.id_cliente =
        cliente.id_cliente;
    }

    if (
      updatePedidoDto.id_forma_pago !==
      undefined
    ) {
      const formaPago =
        await this.formaPagoRepository.findOne({
          where: {
            id_forma_pago:
              updatePedidoDto.id_forma_pago,
          },
        });

      if (!formaPago) {
        throw new NotFoundException(
          'La forma de pago indicada no existe.',
        );
      }

      if (
        formaPago.estado !== 'ACTIVO'
      ) {
        throw new BadRequestException(
          'La forma de pago indicada está inactiva.',
        );
      }

      pedido.id_forma_pago =
        formaPago.id_forma_pago;
    }

    if (
      updatePedidoDto.direccion_entrega !==
      undefined
    ) {
      pedido.direccion_entrega =
        updatePedidoDto.direccion_entrega.trim();
    }

    if (
      updatePedidoDto.latitud_entrega !==
      undefined
    ) {
      pedido.latitud_entrega =
        updatePedidoDto.latitud_entrega;
    }

    if (
      updatePedidoDto.longitud_entrega !==
      undefined
    ) {
      pedido.longitud_entrega =
        updatePedidoDto.longitud_entrega;
    }

    if (
      updatePedidoDto.canal !== undefined
    ) {
      pedido.canal =
        updatePedidoDto.canal.toUpperCase();
    }

    await this.pedidoRepository.save(
      pedido,
    );

    return this.findOne(id);
  }

  // Busca las sucursales que pueden surtir completamente un pedido.
  async findSucursalesDisponibles(
    idPedido: number,
  ) {
    const pedido =
      await this.pedidoRepository.findOne({
        where: {
          id_pedido: idPedido,
        },
      });

    if (!pedido) {
      throw new NotFoundException(
        'El pedido no existe.',
      );
    }

    if (pedido.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'La búsqueda de sucursales solo está disponible para pedidos en BORRADOR.',
      );
    }

    const detalles =
      await this.detallePedidoRepository.find({
        where: {
          id_pedido: idPedido,
        },
      });

    if (detalles.length === 0) {
      throw new BadRequestException(
        'El pedido debe contener al menos un medicamento.',
      );
    }

    const sucursales =
      await this.sucursalRepository.find({
        where: {
          estado: 'ACTIVA',
        },

        relations: {
          municipio: {
            departamento: true,
          },
        },
      });

    if (sucursales.length === 0) {
      return [];
    }

    const idsSucursales =
      sucursales.map(
        (sucursal) =>
          sucursal.id_sucursal,
      );

    const idsMedicamentos =
      detalles.map(
        (detalle) =>
          detalle.id_medicamento,
      );

    const inventarios =
      await this.inventarioRepository.find({
        where: {
          id_sucursal:
            In(idsSucursales),

          id_medicamento:
            In(idsMedicamentos),
        },
      });

    const latitudEntrega =
      Number(pedido.latitud_entrega);

    const longitudEntrega =
      Number(pedido.longitud_entrega);

    const resultados = sucursales
      .map((sucursal) => {
        const inventarioSucursal =
          inventarios.filter(
            (inventario) =>
              inventario.id_sucursal ===
              sucursal.id_sucursal,
          );

        const puedeSurtir =
          detalles.every(
            (detalle) => {
              const inventario =
                inventarioSucursal.find(
                  (item) =>
                    item.id_medicamento ===
                    detalle.id_medicamento,
                );

              return (
                inventario !== undefined &&
                inventario.stock_actual >=
                  detalle.cantidad
              );
            },
          );

        if (!puedeSurtir) {
          return null;
        }

        const latitudSucursal =
          Number(sucursal.latitud);

        const longitudSucursal =
          Number(sucursal.longitud);

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

        return {
          id_sucursal:
            sucursal.id_sucursal,

          codigo:
            sucursal.codigo,

          nombre:
            sucursal.nombre,

          tipo_sucursal:
            sucursal.tipo_sucursal,

          direccion:
            sucursal.direccion,

          municipio:
            sucursal.municipio.nombre,

          departamento:
            sucursal.municipio
              .departamento.nombre,

          distancia_km:
            Number(
              distanciaKm.toFixed(2),
            ),

          tiempo_estimado_min:
            tiempoEstimadoMin,
        };
      })
      .filter(
        (
          sucursal,
        ): sucursal is NonNullable<
          typeof sucursal
        > => sucursal !== null,
      )
      .sort(
        (a, b) =>
          a.distancia_km -
          b.distancia_km,
      );

    return resultados;
  }

  // Asigna una sucursal capaz de surtir el pedido y lo confirma.
  async asignarSucursal(
    idPedido: number,
    asignarSucursalPedidoDto: AsignarSucursalPedidoDto,
  ): Promise<Pedido> {
    await this.dataSource.transaction(
      async (manager) => {
        const pedido =
          await manager.findOne(
            Pedido,
            {
              where: {
                id_pedido: idPedido,
              },

              lock: {
                mode: 'pessimistic_write',
              },
            },
          );

        if (!pedido) {
          throw new NotFoundException(
            'El pedido no existe.',
          );
        }

        if (
          pedido.estado !== 'BORRADOR'
        ) {
          throw new BadRequestException(
            'Solo se puede asignar una sucursal a pedidos en estado BORRADOR.',
          );
        }

        if (!pedido.id_forma_pago) {
          throw new BadRequestException(
            'Debes seleccionar una forma de pago antes de confirmar el pedido.',
          );
        }

        const sucursal =
          await manager.findOne(
            Sucursal,
            {
              where: {
                id_sucursal:
                  asignarSucursalPedidoDto.id_sucursal,
              },
            },
          );

        if (!sucursal) {
          throw new NotFoundException(
            'La sucursal indicada no existe.',
          );
        }

        if (
          sucursal.estado !== 'ACTIVA'
        ) {
          throw new BadRequestException(
            'La sucursal indicada está inactiva.',
          );
        }

        const detalles =
          await manager.find(
            DetallePedido,
            {
              where: {
                id_pedido: idPedido,
              },
            },
          );

        if (
          detalles.length === 0
        ) {
          throw new BadRequestException(
            'El pedido debe contener al menos un medicamento.',
          );
        }

        for (
          const detalle of detalles
        ) {
          const inventario =
            await manager.findOne(
              Inventario,
              {
                where: {
                  id_sucursal:
                    sucursal.id_sucursal,

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
              `La sucursal no posee inventario para el medicamento ${detalle.id_medicamento}.`,
            );
          }

          if (
            inventario.stock_actual <
            detalle.cantidad
          ) {
            throw new BadRequestException(
              `La sucursal no tiene existencia suficiente del medicamento ${detalle.id_medicamento}.`,
            );
          }
        }

        pedido.id_sucursal_asignada =
          sucursal.id_sucursal;

        pedido.estado =
          'CONFIRMADO';

        await manager.save(
          Pedido,
          pedido,
        );
      },
    );

    return this.findOne(
      idPedido,
    );
  }

  // Elimina un pedido únicamente mientras permanezca en borrador.
  async remove(
    id: number,
  ): Promise<void> {
    const pedido =
      await this.pedidoRepository.findOne({
        where: {
          id_pedido: id,
        },
      });

    if (!pedido) {
      throw new NotFoundException(
        'El pedido no existe.',
      );
    }

    if (pedido.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden eliminar pedidos en estado BORRADOR.',
      );
    }

    await this.pedidoRepository.remove(
      pedido,
    );
  }
}