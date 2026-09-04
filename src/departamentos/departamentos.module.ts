import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Departamento } from './entities/departamento.entity';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Departamento]),
  ],
  controllers: [
    DepartamentosController,
  ],
  providers: [
    DepartamentosService,
  ],
  exports: [
    DepartamentosService,
  ],
})
export class DepartamentosModule {}