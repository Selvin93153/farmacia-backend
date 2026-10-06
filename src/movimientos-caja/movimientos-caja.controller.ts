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

  // Registra un movimiento manual y asigna el usuario autenticado.
  @Post()
  create(
    @Body() createMovimientoCajaDto: CreateMovimientoCajaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.movimientosCajaService.create(createMovimientoCajaDto, user.sub);
  }

  // Consulta general; restringir por permisos de rol en la política de autorización.
  @Get()
  findAll() {
    return this.movimientosCajaService.findAll();
  }

  // Consulta únicamente movimientos de la sucursal del usuario autenticado.
  @Get('mi-sucursal')
  findMiSucursal(@CurrentUser() user: JwtPayload) {
    return this.movimientosCajaService.findMiSucursal(user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosCajaService.findOne(id);
  }
}
