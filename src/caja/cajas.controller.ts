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

import { CajasService } from './cajas.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('cajas')
export class CajasController {
  constructor(
    private readonly cajasService: CajasService,
  ) {}

  @Post()
  create(
    @Body() createCajaDto: CreateCajaDto,
  ) {
    return this.cajasService.create(createCajaDto);
  }

  @Get()
  findAll() {
    return this.cajasService.findAll();
  }

  // Obtiene únicamente las cajas de la sucursal del usuario autenticado.
@Get('mi-sucursal')
findMiSucursal(
  @CurrentUser() user: JwtPayload,
) {
  return this.cajasService.findMiSucursal(user.sub);
}

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cajasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCajaDto: UpdateCajaDto,
  ) {
    return this.cajasService.update(
      id,
      updateCajaDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.cajasService.remove(id);
  }
}