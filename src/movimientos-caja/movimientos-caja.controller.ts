import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { MovimientosCajaService } from './movimientos-caja.service';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('movimientos-caja')
export class MovimientosCajaController {
  constructor(
    private readonly movimientosCajaService: MovimientosCajaService,
  ) {}

  @Post()
  create(
    @Body() createMovimientoCajaDto: CreateMovimientoCajaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.movimientosCajaService.create(
      createMovimientoCajaDto,
      user.sub,
    );
  }

  @Get()
  findAll() {
    return this.movimientosCajaService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.movimientosCajaService.findOne(id);
  }
}