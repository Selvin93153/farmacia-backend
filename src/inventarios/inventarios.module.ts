import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inventario } from './entities/inventario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';

import { InventariosController } from './inventarios.controller';
import { InventariosService } from './inventarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventario,
      Sucursal,
      Medicamento,
    ]),
  ],
  controllers: [
    InventariosController,
  ],
  providers: [
    InventariosService,
  ],
  exports: [
    InventariosService,
  ],
})
export class InventariosModule {}