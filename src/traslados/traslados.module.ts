import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DetalleTraslado } from '../detalles-traslado/entities/detalle-traslado.entity';
import { Inventario } from '../inventarios/entities/inventario.entity';
import { MovimientosInventarioModule } from '../movimientos-inventario/movimientos-inventario.module';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { Traslado } from './entities/traslado.entity';
import { TrasladosController } from './traslados.controller';
import { TrasladosService } from './traslados.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Traslado,
      DetalleTraslado,
      Inventario,
      Sucursal,
      Usuario,
    ]),
    MovimientosInventarioModule,
  ],
  controllers: [
    TrasladosController,
  ],
  providers: [
    TrasladosService,
  ],
  exports: [
    TrasladosService,
  ],
})
export class TrasladosModule {}