import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientoInventario } from './entities/movimiento-inventario.entity';

import { MovimientosInventarioController } from './movimientos-inventario.controller';
import { MovimientosInventarioService } from './movimientos-inventario.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
    ]),
  ],
  controllers: [
    MovimientosInventarioController,
  ],
  providers: [
    MovimientosInventarioService,
  ],
  exports: [
    MovimientosInventarioService,
  ],
})
export class MovimientosInventarioModule {}