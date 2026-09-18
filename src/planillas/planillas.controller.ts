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

@Controller('planillas')
export class PlanillasController {
  constructor(
    private readonly planillasService:
      PlanillasService,
  ) {}

  @Post()
  create(
    @Body()
    createPlanillaDto: CreatePlanillaDto,
  ) {
    return this.planillasService.create(
      createPlanillaDto,
    );
  }

  @Get()
  findAll() {
    return this.planillasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.planillasService.findOne(id);
  }

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.planillasService.remove(id);
  }
}