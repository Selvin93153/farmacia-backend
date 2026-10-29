import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Caja } from '../entites/caja.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Injectable()
export class CajasSeederService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  // Crea una caja base por cada sucursal.
  async seed(): Promise<void> {
    const cajasBase = [
      {
        codigoSucursal: 'SUC-001',
        nombre: 'Caja Principal',
        estado: 'ACTIVA',
      },
      {
        codigoSucursal: 'SUC-002',
        nombre: 'Caja Principal',
        estado: 'ACTIVA',
      },
      {
        codigoSucursal: 'SUC-003',
        nombre: 'Caja Principal',
        estado: 'ACTIVA',
      },
      {
        codigoSucursal: 'SUC-004',
        nombre: 'Caja Principal',
        estado: 'ACTIVA',
      },
      {
        codigoSucursal: 'SUC-005',
        nombre: 'Caja Principal',
        estado: 'ACTIVA',
      },
      {
        codigoSucursal: 'SUC-006',
        nombre: 'Caja Principal',
        estado: 'ACTIVA',
      },
    ];

    for (const cajaBase of cajasBase) {
      const sucursal =
        await this.sucursalRepository.findOne({
          where: {
            codigo: cajaBase.codigoSucursal,
          },
        });

      if (!sucursal) {
        throw new Error(
          `No existe la sucursal ${cajaBase.codigoSucursal}.`,
        );
      }

      const cajaExistente =
        await this.cajaRepository.findOne({
          where: {
            id_sucursal: sucursal.id_sucursal,
            nombre: cajaBase.nombre,
          },
        });

      if (cajaExistente) {
        cajaExistente.estado =
          cajaBase.estado;

        await this.cajaRepository.save(
          cajaExistente,
        );

        continue;
      }

      const nuevaCaja =
        this.cajaRepository.create({
          id_sucursal:
            sucursal.id_sucursal,

          nombre:
            cajaBase.nombre,

          estado:
            cajaBase.estado,
        });

      await this.cajaRepository.save(
        nuevaCaja,
      );
    }

    console.log(
      'Cajas base verificadas correctamente',
    );
  }
}