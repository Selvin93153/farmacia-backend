import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DetallePlanilla } from './entities/detalle-planilla.entity';

import { DetallesPlanillaController } from './detalles-planilla.controller';
import { DetallesPlanillaService } from './detalles-planilla.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DetallePlanilla,
    ]),
  ],
  controllers: [
    DetallesPlanillaController,
  ],
  providers: [
    DetallesPlanillaService,
  ],
  exports: [
    DetallesPlanillaService,
  ],
})
export class DetallesPlanillaModule {}