import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}


   // Registra un nuevo usuario.
  @Roles('ADMIN_SISTEMA')
  @Post()
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ) {
    return this.usuariosService.create(
      createUsuarioDto,
    );
  }

   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
    'TRABAJADOR_SUCURSAL',
    'RRHH',
  )
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
    'TRABAJADOR_SUCURSAL',
    'RRHH',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuariosService.findOne(id);
  }

   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(
      id,
      updateUsuarioDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.usuariosService.remove(id);
  }
}