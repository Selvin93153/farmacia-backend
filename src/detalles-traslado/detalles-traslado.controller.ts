import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { CreateDetalleTrasladoDto } from './dto/create-detalle-traslado.dto';
import { UpdateDetalleTrasladoDto } from './dto/update-detalle-traslado.dto';
import { DetallesTrasladoService } from './detalles-traslado.service';

@Controller('detalles-traslado')
export class DetallesTrasladoController {
  constructor(
    private readonly detallesTrasladoService: DetallesTrasladoService,
  ) {}

  // Agrega un medicamento a un traslado solicitado.
  @Post()
  create(
    @Body() dto: CreateDetalleTrasladoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.detallesTrasladoService.create(
      dto,
      user.sub,
    );
  }

  // Obtiene todos los detalles de traslado registrados.
  @Get()
  findAll() {
    return this.detallesTrasladoService.findAll();
  }

  // Obtiene los medicamentos pertenecientes a un traslado.
  @Get('traslado/:idTraslado')
  findByTraslado(
    @Param('idTraslado', ParseIntPipe)
    idTraslado: number,
  ) {
    return this.detallesTrasladoService.findByTraslado(
      idTraslado,
    );
  }

  // Obtiene un detalle de traslado por su identificador.
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.detallesTrasladoService.findOne(id);
  }

  // Modifica la cantidad solicitada de un medicamento.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDetalleTrasladoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.detallesTrasladoService.update(
      id,
      dto,
      user.sub,
    );
  }

  // Elimina un medicamento de un traslado solicitado.
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.detallesTrasladoService.remove(
      id,
      user.sub,
    );
  }
}