import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { DetallesPedidoController } from './detalles-pedido.controller';
import { DetallesPedidoService } from './detalles-pedido.service';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DetallePedido,
      Pedido,
      Medicamento,
    ]),
  ],
  controllers: [
    DetallesPedidoController,
  ],
  providers: [
    DetallesPedidoService,
  ],
  exports: [
    DetallesPedidoService,
  ],
})
export class DetallesPedidoModule {}