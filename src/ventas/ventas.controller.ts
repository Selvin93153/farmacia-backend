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

import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('ventas')
export class VentasController {
  constructor(
    private readonly ventasService: VentasService,
  ) {}



  @Post()
  create(
    @Body() createVentaDto: CreateVentaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ventasService.create(
      createVentaDto,
      user.sub,
    );
  }

  @Post(':id/finalizar')
finalizar(
  @Param('id', ParseIntPipe)
  id: number,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.ventasService.finalizar(
    id,
    user.sub,
  );
}

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }


  // Obtiene únicamente los medicamentos asociados a una venta específica.
@Get(':id/detalles')
findDetalles(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.ventasService.findDetalles(id)
}


  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.update(
      id,
      updateVentaDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.ventasService.remove(id);
  }
}