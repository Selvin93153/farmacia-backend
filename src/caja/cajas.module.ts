import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Caja } from '../caja/entites/caja.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

import { CajasController } from './cajas.controller';
import { CajasService } from './cajas.service';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Caja,
      Sucursal,
      Usuario,
    ]),
  ],
  controllers: [
    CajasController,
  ],
  providers: [
    CajasService,
  ],
  exports: [
    CajasService,
  ],
})
export class CajasModule {}