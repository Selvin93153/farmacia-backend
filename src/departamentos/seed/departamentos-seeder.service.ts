import {
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Departamento } from '../entities/departamento.entity';

@Injectable()
export class DepartamentosSeederService
  implements OnApplicationBootstrap
{
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const departamentosBase = [
      'Alta Verapaz',
      'Baja Verapaz',
      'Chimaltenango',
      'Chiquimula',
      'El Progreso',
      'Escuintla',
      'Guatemala',
      'Huehuetenango',
      'Izabal',
      'Jalapa',
      'Jutiapa',
      'Petén',
      'Quetzaltenango',
      'Quiché',
      'Retalhuleu',
      'Sacatepéquez',
      'San Marcos',
      'Santa Rosa',
      'Sololá',
      'Suchitepéquez',
      'Totonicapán',
      'Zacapa',
    ];

    for (const nombre of departamentosBase) {
      const departamentoExistente =
        await this.departamentoRepository.findOne({
          where: {
            nombre,
          },
        });

      if (departamentoExistente) {
        if (departamentoExistente.estado !== 'ACTIVO') {
          departamentoExistente.estado = 'ACTIVO';

          await this.departamentoRepository.save(
            departamentoExistente,
          );
        }

        continue;
      }

      const nuevoDepartamento =
        this.departamentoRepository.create({
          nombre,
          estado: 'ACTIVO',
        });

      await this.departamentoRepository.save(
        nuevoDepartamento,
      );
    }

    console.log(
      'Departamentos base verificados correctamente',
    );
  }
}