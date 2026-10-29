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

import { DetallesPlanillaService } from './detalles-planilla.service';
import { CreateDetallePlanillaDto } from './dto/create-detalle-planilla.dto';
import { UpdateDetallePlanillaDto } from './dto/update-detalle-planilla.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('detalles-planilla')
export class DetallesPlanillaController {
  constructor(
    private readonly detallesService:
      DetallesPlanillaService,
  ) {}


    // Registra un nuevo detalle de planilla.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Post()
  create(
    @Body()
    createDto: CreateDetallePlanillaDto,
  ) {
    return this.detallesService.create(
      createDto,
    );
  }

  // Obtiene todos los detalles de planilla.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Get()
  findAll() {
    return this.detallesService.findAll();
  }


  // Obtiene un detalle de planilla por su identificador.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.detallesService.findOne(id);
  }


   // Actualiza un detalle de planilla.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateDto: UpdateDetallePlanillaDto,
  ) {
    return this.detallesService.update(
      id,
      updateDto,
    );
  }


    // Elimina un detalle de planilla.
  @Roles(
    'ADMIN_SISTEMA',
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.detallesService.remove(id);
  }
}