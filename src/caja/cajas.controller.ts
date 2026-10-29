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

import { CajasService } from './cajas.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cajas')
export class CajasController {
  constructor(
    private readonly cajasService: CajasService,
  ) {}

   // Registra una nueva caja.
  @Roles(
    'ADMIN_SUCURSAL',
  )

  @Post()
  create(
    @Body() createCajaDto: CreateCajaDto,
  ) {
    return this.cajasService.create(createCajaDto);
  }

    // Obtiene el listado de todas las cajas.
  @Roles('ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
  )
  @Get()
  findAll() {
    return this.cajasService.findAll();
  }

    // Obtiene las cajas de la sucursal del usuario autenticado.
  @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
@Get('mi-sucursal')
findMiSucursal(
  @CurrentUser() user: JwtPayload,
) {
  return this.cajasService.findMiSucursal(user.sub);
}

  // Obtiene una caja específica por su identificador.
  @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cajasService.findOne(id);
  }

  // Actualiza los datos permitidos de una caja.
    @Roles(
    'ADMIN_SUCURSAL',
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCajaDto: UpdateCajaDto,
  ) {
    return this.cajasService.update(
      id,
      updateCajaDto,
    );
  }

   // Elimina una caja registrada.
  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.cajasService.remove(id);
  }
}