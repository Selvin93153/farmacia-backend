import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { MovimientoCaja } from '../movimientos-caja/entities/movimiento-caja.entity';
import { FiltroAuditoriaEfectivoDto } from './dto/filtro-auditoria-efectivo.dto';

@Injectable()
export class AuditoriaEfectivoService {
  constructor(
    @InjectRepository(MovimientoCaja)
    private readonly movimientoCajaRepository: Repository<MovimientoCaja>,
  ) {}

  // Calcula los totales generales del flujo de efectivo.
  async obtenerResumen(
    filtros: FiltroAuditoriaEfectivoDto,
  ) {
    const query = this.movimientoCajaRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.caja', 'caja')
      .innerJoin('caja.sucursal', 'sucursal');

    this.aplicarFiltros(query, filtros);

    const resultado = await query
      .select(
        'COUNT(movimiento.id_movimiento_caja)',
        'total_movimientos',
      )
      .addSelect(
        `
        COALESCE(
          SUM(
            CASE
              WHEN movimiento.tipo_movimiento = 'INGRESO'
              THEN movimiento.monto
              ELSE 0
            END
          ),
          0
        )
        `,
        'total_ingresos',
      )
      .addSelect(
        `
        COALESCE(
          SUM(
            CASE
              WHEN movimiento.tipo_movimiento = 'EGRESO'
              THEN movimiento.monto
              ELSE 0
            END
          ),
          0
        )
        `,
        'total_egresos',
      )
      .addSelect(
        `
        COALESCE(
          SUM(
            CASE
              WHEN movimiento.id_venta IS NOT NULL
              THEN 1
              ELSE 0
            END
          ),
          0
        )
        `,
        'movimientos_venta',
      )
      .addSelect(
        `
        COALESCE(
          SUM(
            CASE
              WHEN movimiento.id_venta IS NULL
              THEN 1
              ELSE 0
            END
          ),
          0
        )
        `,
        'movimientos_manuales',
      )
      .getRawOne();

    const totalIngresos = Number(resultado.total_ingresos);
    const totalEgresos = Number(resultado.total_egresos);

    return {
      total_movimientos: Number(resultado.total_movimientos),
      total_ingresos: totalIngresos,
      total_egresos: totalEgresos,
      flujo_neto: totalIngresos - totalEgresos,
      movimientos_venta: Number(resultado.movimientos_venta),
      movimientos_manuales: Number(resultado.movimientos_manuales),
    };
  }

  // Obtiene el detalle completo de movimientos para auditoría.
  async obtenerMovimientos(
    filtros: FiltroAuditoriaEfectivoDto,
  ): Promise<MovimientoCaja[]> {
    const query = this.movimientoCajaRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.caja', 'caja')
      .leftJoinAndSelect('caja.sucursal', 'sucursal')
      .leftJoinAndSelect('sucursal.municipio', 'municipio')
      .leftJoinAndSelect(
        'municipio.departamento',
        'departamento',
      )
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .leftJoinAndSelect('movimiento.venta', 'venta')
      .leftJoinAndSelect(
        'venta.forma_pago',
        'formaPago',
      );

    this.aplicarFiltros(query, filtros);

    return query
      .orderBy('movimiento.fecha', 'DESC')
      .addOrderBy(
        'movimiento.id_movimiento_caja',
        'DESC',
      )
      .getMany();
  }

  // Consolida ingresos, egresos y flujo neto por cada sucursal.
  async obtenerResumenPorSucursal(
    filtros: FiltroAuditoriaEfectivoDto,
  ) {
    const query = this.movimientoCajaRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.caja', 'caja')
      .innerJoin('caja.sucursal', 'sucursal');

    this.aplicarFiltros(query, filtros);

    const resultados = await query
      .select(
        'sucursal.id_sucursal',
        'id_sucursal',
      )
      .addSelect(
        'sucursal.codigo',
        'codigo',
      )
      .addSelect(
        'sucursal.nombre',
        'sucursal',
      )
      .addSelect(
        'COUNT(movimiento.id_movimiento_caja)',
        'total_movimientos',
      )
      .addSelect(
        `
        COALESCE(
          SUM(
            CASE
              WHEN movimiento.tipo_movimiento = 'INGRESO'
              THEN movimiento.monto
              ELSE 0
            END
          ),
          0
        )
        `,
        'ingresos',
      )
      .addSelect(
        `
        COALESCE(
          SUM(
            CASE
              WHEN movimiento.tipo_movimiento = 'EGRESO'
              THEN movimiento.monto
              ELSE 0
            END
          ),
          0
        )
        `,
        'egresos',
      )
      .groupBy('sucursal.id_sucursal')
      .addGroupBy('sucursal.codigo')
      .addGroupBy('sucursal.nombre')
      .orderBy('sucursal.nombre', 'ASC')
      .getRawMany();

    return resultados.map((resultado) => {
      const ingresos = Number(resultado.ingresos);
      const egresos = Number(resultado.egresos);

      return {
        id_sucursal: Number(resultado.id_sucursal),
        codigo: resultado.codigo,
        sucursal: resultado.sucursal,
        total_movimientos: Number(
          resultado.total_movimientos,
        ),
        ingresos,
        egresos,
        flujo_neto: ingresos - egresos,
      };
    });
  }

  // Aplica los filtros comunes a las consultas de auditoría.
  private aplicarFiltros(
    query: SelectQueryBuilder<MovimientoCaja>,
    filtros: FiltroAuditoriaEfectivoDto,
  ): void {
    if (filtros.fecha_desde) {
      query.andWhere(
        'movimiento.fecha >= :fechaDesde',
        {
          fechaDesde: `${filtros.fecha_desde} 00:00:00`,
        },
      );
    }

    if (filtros.fecha_hasta) {
      const siguienteDia = this.obtenerSiguienteDia(
        filtros.fecha_hasta,
      );

      query.andWhere(
        'movimiento.fecha < :fechaHasta',
        {
          fechaHasta: `${siguienteDia} 00:00:00`,
        },
      );
    }

    if (filtros.id_sucursal) {
      query.andWhere(
        'sucursal.id_sucursal = :idSucursal',
        {
          idSucursal: filtros.id_sucursal,
        },
      );
    }

    if (filtros.id_caja) {
      query.andWhere(
        'movimiento.id_caja = :idCaja',
        {
          idCaja: filtros.id_caja,
        },
      );
    }

    if (filtros.tipo_movimiento) {
      query.andWhere(
        'movimiento.tipo_movimiento = :tipoMovimiento',
        {
          tipoMovimiento:
            filtros.tipo_movimiento,
        },
      );
    }

    if (filtros.origen === 'VENTA') {
      query.andWhere(
        'movimiento.id_venta IS NOT NULL',
      );
    }

    if (filtros.origen === 'MANUAL') {
      query.andWhere(
        'movimiento.id_venta IS NULL',
      );
    }
  }

  // Obtiene el día siguiente para incluir completamente la fecha final.
  private obtenerSiguienteDia(
    fecha: string,
  ): string {
    const fechaUtc = new Date(
      `${fecha}T00:00:00.000Z`,
    );

    fechaUtc.setUTCDate(
      fechaUtc.getUTCDate() + 1,
    );

    return fechaUtc
      .toISOString()
      .slice(0, 10);
  }
}