import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      Sucursal,
    ]),
  ],
  controllers: [
    UsuariosController,
  ],
  providers: [
    UsuariosService,
  ],
  exports: [
    UsuariosService,
  ],
})
export class UsuariosModule {}