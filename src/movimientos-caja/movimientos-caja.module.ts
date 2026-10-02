import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Caja } from '../caja/entites/caja.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { MovimientosCajaController } from './movimientos-caja.controller';
import { MovimientosCajaService } from './movimientos-caja.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoCaja,
      Caja,
      Usuario,
    ]),
  ],
  controllers: [MovimientosCajaController],
  providers: [MovimientosCajaService],
  exports: [MovimientosCajaService],
})
export class MovimientosCajaModule {}