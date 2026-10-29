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

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';

import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Controller('empleados')
export class EmpleadosController {
  constructor(
    private readonly empleadosService:
      EmpleadosService,
  ) {}

   // Registra un nuevo empleado.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Post()
  create(
    @Body()
    createEmpleadoDto: CreateEmpleadoDto,
  ) {
    return this.empleadosService.create(
      createEmpleadoDto,
    );
  }

   // Obtiene todos los empleados registrados.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
  @Get()
  findAll() {
    return this.empleadosService.findAll();
  }

// Obtiene los empleados de la sucursal del usuario autenticado.
@Get('mi-sucursal')
findMiSucursal(@CurrentUser() user: JwtPayload) {
  return this.empleadosService.findMiSucursal(user.sub);
}

 // Obtiene un empleado por su identificador.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'RRHH',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.empleadosService.findOne(id);
  }

    // Actualiza los datos de un empleado.
  @Roles(
    'ADMIN_SISTEMA',
    'RRHH',
  )
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

  // Elimina un empleado registrado.
  @Roles(
    'ADMIN_SISTEMA',
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.empleadosService.remove(id);
  }
}