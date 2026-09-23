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

import { DetallesVentaService } from './detalles-venta.service';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

@Controller('detalles-venta')
export class DetallesVentaController {
  constructor(
    private readonly detallesVentaService:
      DetallesVentaService,
  ) {}

  @Post()
  create(
    @Body()
    createDetalleVentaDto:
      CreateDetalleVentaDto,
  ) {
    return this.detallesVentaService.create(
      createDetalleVentaDto,
    );
  }

  @Get()
  findAll() {
    return this.detallesVentaService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.detallesVentaService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateDetalleVentaDto:
      UpdateDetalleVentaDto,
  ) {
    return this.detallesVentaService.update(
      id,
      updateDetalleVentaDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.detallesVentaService.remove(id);
  }
}