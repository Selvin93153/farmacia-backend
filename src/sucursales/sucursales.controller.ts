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

import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sucursales')
export class SucursalesController {
  constructor(
    private readonly sucursalesService: SucursalesService,
  ) {}

   // Registra una nueva sucursal.
  @Roles('ADMIN_SISTEMA')
  @Post()
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalesService.create(createSucursalDto);
  }

     @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
    'TRABAJADOR_SUCURSAL',
    'RRHH',
  )
  @Get()
  findAll() {
    return this.sucursalesService.findAll();
  }

   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
    'TRABAJADOR_SUCURSAL',
    'RRHH'
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.findOne(id);
  }

   // Actualiza los datos de una sucursal.
   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSucursalDto: UpdateSucursalDto,
  ) {
    return this.sucursalesService.update(
      id,
      updateSucursalDto,
    );
  }

    // Elimina una sucursal registrada.
  @Roles('ADMIN_SISTEMA')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.sucursalesService.remove(id);
  }
}