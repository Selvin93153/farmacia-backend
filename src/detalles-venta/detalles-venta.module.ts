import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DetalleVenta } from './entities/detalle-venta.entity';

import { DetallesVentaController } from './detalles-venta.controller';
import { DetallesVentaService } from './detalles-venta.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DetalleVenta,
    ]),
  ],
  controllers: [
    DetallesVentaController,
  ],
  providers: [
    DetallesVentaService,
  ],
  exports: [
    DetallesVentaService,
  ],
})
export class DetallesVentaModule {}