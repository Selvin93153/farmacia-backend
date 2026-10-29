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

import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  // Registra un nuevo cliente.
   @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Post()
  create(
    @Body()
    createClienteDto: CreateClienteDto,
  ) {
    return this.clientesService.create(
      createClienteDto,
    );
  }

  // Obtiene todos los clientes registrados.
  @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // Obtiene un cliente específico por su identificador.
   @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.findOne(id);
  }

  // Actualiza los datos de un cliente.
   @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(
      id,
      updateClienteDto,
    );
  }

  // Elimina un cliente registrado.
   // Elimina un cliente registrado.
  @Roles(
    'ADMIN_SISTEMA',
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.remove(id);
  }
}