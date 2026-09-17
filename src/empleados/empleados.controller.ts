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

import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Controller('empleados')
export class EmpleadosController {
  constructor(
    private readonly empleadosService:
      EmpleadosService,
  ) {}

  @Post()
  create(
    @Body()
    createEmpleadoDto: CreateEmpleadoDto,
  ) {
    return this.empleadosService.create(
      createEmpleadoDto,
    );
  }

  @Get()
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.update(
      id,
      updateEmpleadoDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.empleadosService.remove(id);
  }
}