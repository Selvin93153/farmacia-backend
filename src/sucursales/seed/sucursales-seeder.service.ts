import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sucursal } from '../entities/sucursal.entity';
import { Municipio } from '../../municipios/entities/municipio.entity';

@Injectable()
export class SucursalesSeederService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
  ) {}

  // Crea o actualiza las sucursales base del sistema.
  async seed(): Promise<void> {
    const sucursalesBase = [
      {
        codigo: 'SUC-001',
        nombre: 'Farmacia Central Guatemala',
        tipo_sucursal: 'FARMACIA',
        municipio: 'Guatemala',
        direccion: 'Zona 1, Ciudad de Guatemala',
        latitud: '14.6349150',
        longitud: '-90.5068820',
        telefono: '22000001',
        estado: 'ACTIVA',
      },
      {
        codigo: 'SUC-002',
        nombre: 'Farmacia Chiquimulilla',
        tipo_sucursal: 'FARMACIA',
        municipio: 'Chiquimulilla',
        direccion: 'Zona central, Chiquimulilla, Santa Rosa',
        latitud: '14.0858330',
        longitud: '-90.3769440',
        telefono: '22000002',
        estado: 'ACTIVA',
      },
      {
        codigo: 'SUC-003',
        nombre: 'Farmacia Escuintla',
        tipo_sucursal: 'FARMACIA',
        municipio: 'Escuintla',
        direccion: 'Zona 1, Escuintla',
        latitud: '14.3050000',
        longitud: '-90.7850000',
        telefono: '22000003',
        estado: 'ACTIVA',
      },
      {
        codigo: 'SUC-004',
        nombre: 'Farmacia Antigua Guatemala',
        tipo_sucursal: 'FARMACIA',
        municipio: 'Antigua Guatemala',
        direccion: 'Centro, Antigua Guatemala, Sacatepéquez',
        latitud: '14.5586000',
        longitud: '-90.7295000',
        telefono: '22000004',
        estado: 'ACTIVA',
      },
      {
        codigo: 'SUC-005',
        nombre: 'Farmacia Quetzaltenango',
        tipo_sucursal: 'FARMACIA',
        municipio: 'Quetzaltenango',
        direccion: 'Zona 1, Quetzaltenango',
        latitud: '14.8347000',
        longitud: '-91.5181000',
        telefono: '22000005',
        estado: 'ACTIVA',
      },
      {
        codigo: 'SUC-006',
        nombre: 'Farmacia Chiquimula',
        tipo_sucursal: 'FARMACIA',
        municipio: 'Chiquimula',
        direccion: 'Zona 1, Chiquimula',
        latitud: '14.8000000',
        longitud: '-89.5458000',
        telefono: '22000006',
        estado: 'ACTIVA',
      },
    ];

    for (const sucursalBase of sucursalesBase) {
      const municipio =
        await this.municipioRepository.findOne({
          where: {
            nombre: sucursalBase.municipio,
          },
        });

      if (!municipio) {
        throw new Error(
          `No existe el municipio ${sucursalBase.municipio}.`,
        );
      }

      const sucursalExistente =
        await this.sucursalRepository.findOne({
          where: {
            codigo: sucursalBase.codigo,
          },
        });

      if (sucursalExistente) {
        sucursalExistente.id_municipio =
          municipio.id_municipio;

        sucursalExistente.nombre =
          sucursalBase.nombre;

        sucursalExistente.tipo_sucursal =
          sucursalBase.tipo_sucursal;

        sucursalExistente.direccion =
          sucursalBase.direccion;

        sucursalExistente.latitud =
          sucursalBase.latitud;

        sucursalExistente.longitud =
          sucursalBase.longitud;

        sucursalExistente.telefono =
          sucursalBase.telefono;

        sucursalExistente.estado =
          sucursalBase.estado;

        await this.sucursalRepository.save(
          sucursalExistente,
        );
      } else {
        const nuevaSucursal =
          this.sucursalRepository.create({
            id_municipio:
              municipio.id_municipio,

            codigo:
              sucursalBase.codigo,

            nombre:
              sucursalBase.nombre,

            tipo_sucursal:
              sucursalBase.tipo_sucursal,

            direccion:
              sucursalBase.direccion,

            latitud:
              sucursalBase.latitud,

            longitud:
              sucursalBase.longitud,

            telefono:
              sucursalBase.telefono,

            estado:
              sucursalBase.estado,
          });

        await this.sucursalRepository.save(
          nuevaSucursal,
        );
      }
    }

    console.log(
      'Sucursales base verificadas correctamente',
    );
  }
}