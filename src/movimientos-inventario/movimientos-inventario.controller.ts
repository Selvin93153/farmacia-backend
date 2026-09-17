import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { MovimientosInventarioService } from './movimientos-inventario.service';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosService:
      MovimientosInventarioService,
  ) {}

  @Post()
  create(
    @Body()
    createMovimientoDto:
      CreateMovimientoInventarioDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.movimientosService.create(
      createMovimientoDto,
      user.sub,
    );
  }

  @Get()
  findAll() {
    return this.movimientosService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.movimientosService.findOne(id);
  }
}