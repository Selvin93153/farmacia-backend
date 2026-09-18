import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Planilla } from './entities/planilla.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

import { PlanillasController } from './planillas.controller';
import { PlanillasService } from './planillas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Planilla,
      Sucursal,
    ]),
  ],
  controllers: [
    PlanillasController,
  ],
  providers: [
    PlanillasService,
  ],
  exports: [
    PlanillasService,
  ],
})
export class PlanillasModule {}