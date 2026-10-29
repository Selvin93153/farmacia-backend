import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ActivosFijosService } from './activos-fijos.service';
import { CreateActivoFijoDto } from './dto/create-activo-fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo-fijo.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('activos-fijos')
export class ActivosFijosController {
  constructor(
    private readonly activosFijosService: ActivosFijosService,
  ) {}

  // Registra un nuevo activo fijo en una sucursal.

    // Registra un nuevo activo fijo en una sucursal.
  @Roles(
    'ADMIN_SUCURSAL',
  )

  @Post()
  create(
    @Body()
    createActivoFijoDto: CreateActivoFijoDto,
  ) {
    return this.activosFijosService.create(
      createActivoFijoDto,
    );
  }

  // Obtiene el listado de todos los activos fijos.

   @Roles('ADMIN_SISTEMA')
  @Get()
  findAll() {
    return this.activosFijosService.findAll();
  }

    // Obtiene los activos de la sucursal del usuario autenticado.
  @Roles(
    'ADMIN_SUCURSAL',
    'INVENTARIO',
  )
  @Get('mi-sucursal')
  findMiSucursal(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activosFijosService.findMiSucursal(
      user.sub,
    );
  }

  // Obtiene un activo fijo específico por su identificador.
    // Obtiene un activo fijo específico por su identificador.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'INVENTARIO',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.activosFijosService.findOne(id);
  }

  // Actualiza los datos permitidos de un activo fijo.
  @Roles(
    'ADMIN_SUCURSAL',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateActivoFijoDto: UpdateActivoFijoDto,
  ) {
    return this.activosFijosService.update(
      id,
      updateActivoFijoDto,
    );
  }
}
