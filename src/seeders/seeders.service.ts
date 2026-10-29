import {
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';

import { DepartamentosSeederService } from '../departamentos/seed/departamentos-seeder.service';
import { MunicipiosSeederService } from '../municipios/seed/municipios-seeder.service';
import { RolesSeederService } from '../roles/seed/roles-seeder.service';
import { FormasPagoSeederService } from '../formas-pago/seed/formas-pago-seeder.service';
import { MedicamentosSeederService } from '../medicamentos/seed/medicamentos-seeder.service';
import { SucursalesSeederService } from '../sucursales/seed/sucursales-seeder.service';
import { CajasSeederService } from '../caja/seed/cajas-seeder.service';
import { ActivosFijosSeederService } from '../activos-fijos/seed/activos-fijos-seeder.service';
import { UsuariosSeederService } from '../usuarios/seed/usuarios-seeder.service';
import { EmpleadosSeederService } from '../empleados/seed/empleados-seeder.service';

@Injectable()
export class SeedersService
  implements OnApplicationBootstrap
{
  constructor(
    private readonly departamentosSeeder:
      DepartamentosSeederService,

    private readonly municipiosSeeder:
      MunicipiosSeederService,

    private readonly rolesSeeder:
      RolesSeederService,

    private readonly formasPagoSeeder:
      FormasPagoSeederService,

    private readonly medicamentosSeeder:
      MedicamentosSeederService,

    private readonly sucursalesSeeder:
      SucursalesSeederService,

    private readonly cajasSeeder:
      CajasSeederService,

    private readonly activosFijosSeeder:
      ActivosFijosSeederService,

      private readonly empleadosSeeder:
      EmpleadosSeederService,

    private readonly usuariosSeeder:
      UsuariosSeederService,
  ) {}

  // Ejecuta todos los seeders respetando sus dependencias.
  async onApplicationBootstrap(): Promise<void> {
    try {
      console.log(
        'Iniciando carga de datos base...',
      );

      await this.departamentosSeeder.seed();

      await this.municipiosSeeder.seed();

      await this.rolesSeeder.seed();

      await this.formasPagoSeeder.seed();

      await this.medicamentosSeeder.seed();

      await this.sucursalesSeeder.seed();

      await this.cajasSeeder.seed();

      await this.activosFijosSeeder.seed();

      await this.empleadosSeeder.seed();

      await this.usuariosSeeder.seed();

      console.log(
        'Datos base cargados correctamente',
      );
    } catch (error) {
      console.error(
        'Error al ejecutar los seeders:',
        error,
      );

      throw error;
    }
  }
}