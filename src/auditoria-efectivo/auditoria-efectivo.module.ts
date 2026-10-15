import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientoCaja } from '../movimientos-caja/entities/movimiento-caja.entity';
import { AuditoriaEfectivoController } from './auditoria-efectivo.controller';
import { AuditoriaEfectivoService } from './auditoria-efectivo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoCaja,
    ]),
  ],
  controllers: [
    AuditoriaEfectivoController,
  ],
  providers: [
    AuditoriaEfectivoService,
  ],
})
export class AuditoriaEfectivoModule {}