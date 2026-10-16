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

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AsignarSucursalPedidoDto } from './dto/asignar-sucursal-pedido.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
  ) {}

  // Registra un nuevo pedido utilizando el usuario autenticado.
  @Post()
  create(
    @Body()
    createPedidoDto: CreatePedidoDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.pedidosService.create(
      createPedidoDto,
      user.sub,
    );
  }

  // Obtiene todos los pedidos registrados.
  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  // Busca las sucursales capaces de surtir completamente el pedido.
  @Get(':id/sucursales-disponibles')
  findSucursalesDisponibles(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.pedidosService.findSucursalesDisponibles(
      id,
    );
  }

  // Obtiene un pedido específico por su identificador.
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.pedidosService.findOne(id);
  }

  // Actualiza los datos permitidos de un pedido en borrador.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updatePedidoDto: UpdatePedidoDto,
  ) {
    return this.pedidosService.update(
      id,
      updatePedidoDto,
    );
  }

  // Asigna una sucursal disponible y confirma el pedido.
  @Patch(':id/asignar-sucursal')
  asignarSucursal(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    asignarSucursalPedidoDto: AsignarSucursalPedidoDto,
  ) {
    return this.pedidosService.asignarSucursal(
      id,
      asignarSucursalPedidoDto,
    );
  }

  // Elimina un pedido mientras permanezca en estado borrador.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.pedidosService.remove(id);
  }
}