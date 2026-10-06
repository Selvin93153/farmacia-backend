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

import { InventariosService } from './inventarios.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';


@Controller('inventarios')
export class InventariosController {
  constructor(
    private readonly inventariosService: InventariosService,
  ) {}

  @Post()
  create(
    @Body()
    createInventarioDto: CreateInventarioDto,
  ) {
    return this.inventariosService.create(
      createInventarioDto,
    );
  }

  @Get()
  findAll() {
    return this.inventariosService.findAll();
  }

  // Obtiene los inventarios de la sucursal del usuario autenticado.
@Get('mi-sucursal')
findMiSucursal(
  @CurrentUser() user: JwtPayload,
) {
  return this.inventariosService.findMiSucursal(user.sub);
}

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.inventariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateInventarioDto: UpdateInventarioDto,
  ) {
    return this.inventariosService.update(
      id,
      updateInventarioDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.inventariosService.remove(id);
  }
}