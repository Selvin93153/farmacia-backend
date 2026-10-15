import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { AuditoriaEfectivoService } from './auditoria-efectivo.service';
import { FiltroAuditoriaEfectivoDto } from './dto/filtro-auditoria-efectivo.dto';

@Controller('auditoria-efectivo')
export class AuditoriaEfectivoController {
  constructor(
    private readonly auditoriaEfectivoService: AuditoriaEfectivoService,
  ) {}

  // Obtiene los totales consolidados del flujo de efectivo.
  @Get('resumen')
  obtenerResumen(
    @Query()
    filtros: FiltroAuditoriaEfectivoDto,
  ) {
    return this.auditoriaEfectivoService.obtenerResumen(filtros);
  }

  // Obtiene los movimientos de caja aplicando los filtros de auditoría.
  @Get('movimientos')
  obtenerMovimientos(
    @Query()
    filtros: FiltroAuditoriaEfectivoDto,
  ) {
    return this.auditoriaEfectivoService.obtenerMovimientos(filtros);
  }

  // Obtiene el flujo de efectivo consolidado por sucursal.
  @Get('por-sucursal')
  obtenerResumenPorSucursal(
    @Query()
    filtros: FiltroAuditoriaEfectivoDto,
  ) {
    return this.auditoriaEfectivoService.obtenerResumenPorSucursal(
      filtros,
    );
  }
}