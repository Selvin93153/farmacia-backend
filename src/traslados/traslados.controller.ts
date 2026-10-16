import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { CreateTrasladoDto } from './dto/create-traslado.dto';
import { EnviarTrasladoDto } from './dto/enviar-traslado.dto';
import { RecibirTrasladoDto } from './dto/recibir-traslado.dto';
import { UpdateTrasladoDto } from './dto/update-traslado.dto';
import { TrasladosService } from './traslados.service';

@Controller('traslados')
export class TrasladosController {
  constructor(
    private readonly trasladosService: TrasladosService,
  ) {}

  // Crea un traslado usando automáticamente la sucursal del usuario autenticado.
  @Post()
  create(
    @Body() dto: CreateTrasladoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.trasladosService.create(
      dto,
      user.sub,
    );
  }

  // Obtiene la sucursal asignada al usuario autenticado.
  @Get('mi-sucursal')
  findMiSucursal(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.trasladosService.findMiSucursal(
      user.sub,
    );
  }

  // Obtiene todos los traslados registrados.
  @Get()
  findAll() {
    return this.trasladosService.findAll();
  }

  // Obtiene un traslado específico por su identificador.
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.trasladosService.findOne(id);
  }

  // Modifica un traslado mientras todavía se encuentre solicitado.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrasladoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.trasladosService.update(
      id,
      dto,
      user.sub,
    );
  }

  // Envía el traslado y descuenta el inventario de la sucursal origen.
  @Patch(':id/enviar')
  enviar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnviarTrasladoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.trasladosService.enviar(
      id,
      dto,
      user.sub,
    );
  }

  // Recibe el traslado y aumenta el inventario de la sucursal destino.
  @Patch(':id/recibir')
  recibir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecibirTrasladoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.trasladosService.recibir(
      id,
      dto,
      user.sub,
    );
  }

  // Cancela un traslado que todavía no ha sido enviado.
  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.trasladosService.cancelar(
      id,
      user.sub,
    );
  }
}