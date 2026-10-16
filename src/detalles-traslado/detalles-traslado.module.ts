import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { Traslado } from '../traslados/entities/traslado.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { DetallesTrasladoController } from './detalles-traslado.controller';
import { DetallesTrasladoService } from './detalles-traslado.service';
import { DetalleTraslado } from './entities/detalle-traslado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DetalleTraslado,
      Traslado,
      Medicamento,
      Usuario,
    ]),
  ],
  controllers: [
    DetallesTrasladoController,
  ],
  providers: [
    DetallesTrasladoService,
  ],
  exports: [
    DetallesTrasladoService,
  ],
})
export class DetallesTrasladoModule {}