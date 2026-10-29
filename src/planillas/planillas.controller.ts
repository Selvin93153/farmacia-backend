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

import { PlanillasService } from './planillas.service';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('planillas')
export class PlanillasController {
  constructor(
    private readonly planillasService:
      PlanillasService,
  ) {}


   // Registra una nueva planilla.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Post()
  create(
    @Body()
    createPlanillaDto: CreatePlanillaDto,
  ) {
    return this.planillasService.create(
      createPlanillaDto,
    );
  }

  // Obtiene todas las planillas registradas.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Get()
  findAll() {
    return this.planillasService.findAll();
  }

    // Obtiene una planilla por su identificador.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.planillasService.findOne(id);
  }


   // Actualiza los datos de una planilla.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updatePlanillaDto: UpdatePlanillaDto,
  ) {
    return this.planillasService.update(
      id,
      updatePlanillaDto,
    );
  }


   // Elimina una planilla registrada.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.planillasService.remove(id);
  }
}