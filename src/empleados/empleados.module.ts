import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Empleado } from './entities/empleado.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';
import { EmpleadosSeederService } from './seed/empleados-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empleado,
      Sucursal,
      Usuario,
    ]),
  ],
  controllers: [
    EmpleadosController,
  ],
  providers: [
    EmpleadosService,EmpleadosSeederService,
  ],
  exports: [
    EmpleadosService,EmpleadosSeederService,
  ],
})
export class EmpleadosModule {}