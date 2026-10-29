import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ActivosFijosController } from './activos-fijos.controller';
import { ActivosFijosService } from './activos-fijos.service';
import { ActivoFijo } from './entities/activo-fijo.entity';
import { ActivosFijosSeederService } from './seed/activos-fijos-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivoFijo,
      Sucursal,
      Usuario,
    ]),
  ],
  controllers: [
    ActivosFijosController,
  ],
  providers: [
    ActivosFijosService, ActivosFijosSeederService,
  ],
  exports: [
    ActivosFijosService, ActivosFijosSeederService,
  ],
})
export class ActivosFijosModule {}
