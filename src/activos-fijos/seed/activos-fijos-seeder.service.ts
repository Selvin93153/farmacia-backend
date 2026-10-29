import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivoFijo } from '../entities/activo-fijo.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Injectable()
export class ActivosFijosSeederService {
  constructor(
    @InjectRepository(ActivoFijo)
    private readonly activoFijoRepository: Repository<ActivoFijo>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  // Crea o actualiza los activos fijos base de las sucursales.
  async seed(): Promise<void> {
    const activosBase = [
      {
        codigo: 'ACT-001',
        codigoSucursal: 'SUC-001',
        descripcion: 'Computadora de escritorio',
        categoria: 'EQUIPO_COMPUTO',
        fecha_adquisicion: '2026-01-10',
        valor_adquisicion: 6500,
        valor_actual: 5850,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-002',
        codigoSucursal: 'SUC-001',
        descripcion: 'Mostrador principal de farmacia',
        categoria: 'MOBILIARIO',
        fecha_adquisicion: '2026-01-15',
        valor_adquisicion: 8500,
        valor_actual: 8000,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-003',
        codigoSucursal: 'SUC-002',
        descripcion: 'Refrigerador para medicamentos',
        categoria: 'REFRIGERACION',
        fecha_adquisicion: '2026-02-05',
        valor_adquisicion: 12000,
        valor_actual: 11000,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-004',
        codigoSucursal: 'SUC-002',
        descripcion: 'Impresora multifuncional',
        categoria: 'EQUIPO_COMPUTO',
        fecha_adquisicion: '2026-02-10',
        valor_adquisicion: 2500,
        valor_actual: 2200,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-005',
        codigoSucursal: 'SUC-003',
        descripcion: 'Caja registradora',
        categoria: 'EQUIPO_CAJA',
        fecha_adquisicion: '2026-03-01',
        valor_adquisicion: 4500,
        valor_actual: 4200,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-006',
        codigoSucursal: 'SUC-003',
        descripcion: 'Estantería metálica para medicamentos',
        categoria: 'MOBILIARIO',
        fecha_adquisicion: '2026-03-04',
        valor_adquisicion: 3200,
        valor_actual: 3000,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-007',
        codigoSucursal: 'SUC-004',
        descripcion: 'Aire acondicionado',
        categoria: 'CLIMATIZACION',
        fecha_adquisicion: '2026-04-12',
        valor_adquisicion: 5500,
        valor_actual: 5100,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-008',
        codigoSucursal: 'SUC-004',
        descripcion: 'Computadora portátil administrativa',
        categoria: 'EQUIPO_COMPUTO',
        fecha_adquisicion: '2026-04-15',
        valor_adquisicion: 7200,
        valor_actual: 6800,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-009',
        codigoSucursal: 'SUC-005',
        descripcion: 'Sistema de cámaras de seguridad',
        categoria: 'SEGURIDAD',
        fecha_adquisicion: '2026-05-05',
        valor_adquisicion: 9000,
        valor_actual: 8500,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-010',
        codigoSucursal: 'SUC-005',
        descripcion: 'Escritorio administrativo',
        categoria: 'MOBILIARIO',
        fecha_adquisicion: '2026-05-08',
        valor_adquisicion: 2800,
        valor_actual: 2600,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-011',
        codigoSucursal: 'SUC-006',
        descripcion: 'UPS para equipo de cómputo',
        categoria: 'EQUIPO_ELECTRICO',
        fecha_adquisicion: '2026-06-02',
        valor_adquisicion: 1800,
        valor_actual: 1650,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ACT-012',
        codigoSucursal: 'SUC-006',
        descripcion: 'Refrigerador vertical para medicamentos',
        categoria: 'REFRIGERACION',
        fecha_adquisicion: '2026-06-10',
        valor_adquisicion: 13500,
        valor_actual: 12800,
        estado: 'ACTIVO',
      },
    ];

    for (const activoBase of activosBase) {
      const sucursal =
        await this.sucursalRepository.findOne({
          where: {
            codigo: activoBase.codigoSucursal,
          },
        });

      if (!sucursal) {
        throw new Error(
          `No existe la sucursal ${activoBase.codigoSucursal}.`,
        );
      }

      const activoExistente =
        await this.activoFijoRepository.findOne({
          where: {
            codigo: activoBase.codigo,
          },
        });

      if (activoExistente) {
        activoExistente.id_sucursal =
          sucursal.id_sucursal;

        activoExistente.descripcion =
          activoBase.descripcion;

        activoExistente.categoria =
          activoBase.categoria;

        activoExistente.fecha_adquisicion =
          activoBase.fecha_adquisicion;

        activoExistente.valor_adquisicion =
          activoBase.valor_adquisicion;

        activoExistente.valor_actual =
          activoBase.valor_actual;

        activoExistente.estado =
          activoBase.estado;

        await this.activoFijoRepository.save(
          activoExistente,
        );
      } else {
        const nuevoActivo =
          this.activoFijoRepository.create({
            id_sucursal:
              sucursal.id_sucursal,

            codigo:
              activoBase.codigo,

            descripcion:
              activoBase.descripcion,

            categoria:
              activoBase.categoria,

            fecha_adquisicion:
              activoBase.fecha_adquisicion,

            valor_adquisicion:
              activoBase.valor_adquisicion,

            valor_actual:
              activoBase.valor_actual,

            estado:
              activoBase.estado,
          });

        await this.activoFijoRepository.save(
          nuevoActivo,
        );
      }
    }

    console.log(
      'Activos fijos base verificados correctamente',
    );
  }
}