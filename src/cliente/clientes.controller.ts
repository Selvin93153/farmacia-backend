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

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  // Registra un nuevo cliente.
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
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // Obtiene un cliente específico por su identificador.
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.findOne(id);
  }

  // Actualiza los datos de un cliente.
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
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.remove(id);
  }
}