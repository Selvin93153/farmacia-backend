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
import { Roles } from '../auth/decorators/roles.decorator';

import { AsignarRepartidorDto } from './dto/asignar-repartidor.dto';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { UpdateEntregaDto } from './dto/update-entrega.dto';
import { EntregasService } from './entregas.service';

@Controller('entregas')
export class EntregasController {
  constructor(
    private readonly entregasService: EntregasService,
  ) {}

  // Crea una entrega y descuenta el inventario del pedido.
   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Post()
  create(
    @Body()
    createEntregaDto: CreateEntregaDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.entregasService.create(
      createEntregaDto,
      user.sub,
    );
  }

  // Obtiene todas las entregas registradas.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Get()
  findAll() {
    return this.entregasService.findAll();
  }

  // Obtiene una entrega específica por su identificador.
    @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.entregasService.findOne(id);
  }

  // Actualiza las observaciones de una entrega.
   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateEntregaDto: UpdateEntregaDto,
  ) {
    return this.entregasService.update(
      id,
      updateEntregaDto,
    );
  }

  // Asigna un repartidor a una entrega pendiente.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  
  @Patch(':id/asignar-repartidor')
  asignarRepartidor(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    asignarRepartidorDto: AsignarRepartidorDto,
  ) {
    return this.entregasService.asignarRepartidor(
      id,
      asignarRepartidorDto,
    );
  }

  // Inicia el recorrido de una entrega asignada.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Patch(':id/iniciar')
  iniciar(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.entregasService.iniciar(id);
  }

  // Completa una entrega y marca el pedido como entregado.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Patch(':id/completar')
  completar(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.entregasService.completar(id);
  }
}