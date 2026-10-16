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

import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { DetallesPedidoService } from './detalles-pedido.service';

@Controller('detalles-pedido')
export class DetallesPedidoController {
  constructor(
    private readonly detallesPedidoService: DetallesPedidoService,
  ) {}

  // Agrega un medicamento a un pedido en borrador.
  @Post()
  create(
    @Body()
    createDetallePedidoDto: CreateDetallePedidoDto,
  ) {
    return this.detallesPedidoService.create(
      createDetallePedidoDto,
    );
  }

  // Obtiene todos los detalles de pedidos registrados.
  @Get()
  findAll() {
    return this.detallesPedidoService.findAll();
  }

  // Obtiene los medicamentos pertenecientes a un pedido.
  @Get('pedido/:idPedido')
  findByPedido(
    @Param(
      'idPedido',
      ParseIntPipe,
    )
    idPedido: number,
  ) {
    return this.detallesPedidoService.findByPedido(
      idPedido,
    );
  }

  // Obtiene un detalle de pedido por su identificador.
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.detallesPedidoService.findOne(id);
  }

  // Actualiza la cantidad de un medicamento del pedido.
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateDetallePedidoDto: UpdateDetallePedidoDto,
  ) {
    return this.detallesPedidoService.update(
      id,
      updateDetallePedidoDto,
    );
  }

  // Elimina un medicamento de un pedido en borrador.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.detallesPedidoService.remove(id);
  }
}