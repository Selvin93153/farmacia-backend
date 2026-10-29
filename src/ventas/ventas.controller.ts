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

import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ventas')
export class VentasController {
  constructor(
    private readonly ventasService: VentasService,
  ) {}

  // Registra una nueva venta utilizando el usuario autenticado.
  @Roles(
    'TRABAJADOR_SUCURSAL',
  )


   // Finaliza una venta registrada.
  @Roles('TRABAJADOR_SUCURSAL')
  @Post()
  create(
    @Body() createVentaDto: CreateVentaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ventasService.create(
      createVentaDto,
      user.sub,
    );
  }

  @Post(':id/finalizar')
finalizar(
  @Param('id', ParseIntPipe)
  id: number,

  @CurrentUser()
  user: JwtPayload,
) {
  return this.ventasService.finalizar(
    id,
    user.sub,
  );
}

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }

  // Obtiene las ventas de la sucursal asignada al usuario autenticado.
  @Roles(
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
@Get('mi-sucursal')
findMiSucursal(
  @CurrentUser() user: JwtPayload,
) {
  return this.ventasService.findMiSucursal(user.sub);
}

  // Obtiene únicamente los medicamentos asociados a una venta específica.
   @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
@Get(':id/detalles')
findDetalles(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.ventasService.findDetalles(id)
}


  @Roles(
    'ADMIN_SISTEMA',
    'ADMIN_SUCURSAL',
    'TRABAJADOR_SUCURSAL',
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ventasService.findOne(id);
  }


    // Actualiza los datos permitidos de una venta.
  @Roles('TRABAJADOR_SUCURSAL')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.update(
      id,
      updateVentaDto,
    );
  }

    // Elimina una venta registrada.
  @Roles('ADMIN_SISTEMA')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.ventasService.remove(id);
  }
}