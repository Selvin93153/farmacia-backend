import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medicamento } from './entities/medicamento.entity';
import { MedicamentosController } from './medicamentos.controller';
import { MedicamentosService } from './medicamentos.service';
import { MedicamentosSeederService } from './seed/medicamentos-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicamento]),
  ],
  controllers: [
    MedicamentosController,
  ],
  providers: [
    MedicamentosService,
    MedicamentosSeederService,
  ],
  exports: [
    MedicamentosService,
    MedicamentosSeederService,
  ],
})
export class MedicamentosModule {}