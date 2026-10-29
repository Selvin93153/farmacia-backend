import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuariosSeederService } from './seed/usuarios-seeder.service';
import { Empleado } from '../empleados/entities/empleado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      Sucursal,
      Empleado,
    ]),
  ],
  controllers: [
    UsuariosController,
  ],
  providers: [
    UsuariosService,
     UsuariosSeederService,
  ],
  exports: [
    UsuariosService,
     UsuariosSeederService,
  ],
})
export class UsuariosModule {}