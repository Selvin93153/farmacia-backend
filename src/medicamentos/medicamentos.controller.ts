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

import { MedicamentosService } from './medicamentos.service';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('medicamentos')
export class MedicamentosController {
  constructor(
    private readonly medicamentosService: MedicamentosService,
  ) {}

    // Registra un nuevo medicamento.
  @Roles(
    'ADMIN_SISTEMA',
    'INVENTARIO',
  )
  @Post()
  create(
    @Body() createMedicamentoDto: CreateMedicamentoDto,
  ) {
    return this.medicamentosService.create(
      createMedicamentoDto,
    );
  }


    // Obtiene todos los medicamentos registrados.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
    'TRABAJADOR_SUCURSAL',
  )
  @Get()
  findAll() {
    return this.medicamentosService.findAll();
  }


    // Obtiene un medicamento por su identificador.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
    'TRABAJADOR_SUCURSAL',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.medicamentosService.findOne(id);
  }


    // Actualiza los datos de un medicamento.
  @Roles(
    'ADMIN_SISTEMA',
    'INVENTARIO',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicamentoDto: UpdateMedicamentoDto,
  ) {
    return this.medicamentosService.update(
      id,
      updateMedicamentoDto,
    );
  }


   // Elimina un medicamento registrado.
  @Roles(
    'ADMIN_SISTEMA',
    'INVENTARIO',
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.medicamentosService.remove(id);
  }
}