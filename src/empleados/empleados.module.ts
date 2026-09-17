import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Empleado } from './entities/empleado.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empleado,
      Sucursal,
    ]),
  ],
  controllers: [
    EmpleadosController,
  ],
  providers: [
    EmpleadosService,
  ],
  exports: [
    EmpleadosService,
  ],
})
export class EmpleadosModule {}