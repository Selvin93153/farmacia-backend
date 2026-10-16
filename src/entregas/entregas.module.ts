import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DetallePedido } from '../detalles-pedido/entities/detalle-pedido.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { MovimientosInventarioModule } from '../movimientos-inventario/movimientos-inventario.module';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { EntregasController } from './entregas.controller';
import { EntregasService } from './entregas.service';
import { Entrega } from './entities/entrega.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Entrega,
      Pedido,
      Usuario,
      DetallePedido,
      Inventario,
      Sucursal,
    ]),

    MovimientosInventarioModule,
  ],
  controllers: [
    EntregasController,
  ],
  providers: [
    EntregasService,
  ],
  exports: [
    EntregasService,
  ],
})
export class EntregasModule {}