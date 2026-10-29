import { Module } from '@nestjs/common';

import { DepartamentosModule } from '../departamentos/departamentos.module';
import { MunicipiosModule } from '../municipios/municipios.module';
import { RolesModule } from '../roles/roles.module';
import { FormasPagoModule } from '../formas-pago/formas-pago.module';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { SucursalesModule } from '../sucursales/sucursales.module';
import { CajasModule } from '../caja/cajas.module';
import { ActivosFijosModule } from '../activos-fijos/activos-fijos.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import {EmpleadosModule} from '../empleados/empleados.module';

import { SeedersService } from './seeders.service';

@Module({
  imports: [
    DepartamentosModule,
    MunicipiosModule,
    RolesModule,
    FormasPagoModule,
    MedicamentosModule,
    SucursalesModule,
    CajasModule,
    ActivosFijosModule,
    UsuariosModule,
    EmpleadosModule,
  ],

  providers: [
    SeedersService,
  ],
})
export class SeedersModule {}