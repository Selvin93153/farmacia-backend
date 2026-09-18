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

@Controller('detalles-planilla')
export class DetallesPlanillaController {
  constructor(
    private readonly detallesService:
      DetallesPlanillaService,
  ) {}

  @Post()
  create(
    @Body()
    createDto: CreateDetallePlanillaDto,
  ) {
    return this.detallesService.create(
      createDto,
    );
  }

  @Get()
  findAll() {
    return this.detallesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.detallesService.findOne(id);
  }

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.detallesService.remove(id);
  }
}