import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Venta } from './entities/venta.entity';
import { Caja } from '../caja/entites/caja.entity';
import { FormaPago } from '../formas-pago/entities/forma-pago.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      Caja,
      FormaPago,
      Usuario,
    ]),
  ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService],
})
export class VentasModule {}