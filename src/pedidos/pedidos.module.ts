import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cliente } from '../cliente/entities/cliente.entity';
import { DetallePedido } from '../detalles-pedido/entities/detalle-pedido.entity';
import { FormaPago } from '../formas-pago/entities/forma-pago.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Pedido } from './entities/pedido.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      Cliente,
      FormaPago,
      Usuario,
      DetallePedido,
      Inventario,
      Sucursal,
    ]),
  ],
  controllers: [
    PedidosController,
  ],
  providers: [
    PedidosService,
  ],
  exports: [
    PedidosService,
  ],
})
export class PedidosModule {}