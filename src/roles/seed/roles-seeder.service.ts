import {
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rol } from '../entities/rol.entity';

@Injectable()
export class RolesSeederService
  implements OnApplicationBootstrap
{
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const rolesBase = [
      {
        codigo: 'ADMIN_SISTEMA',
        nombre: 'Administrador del Sistema',
        descripcion:
          'Administra la configuración general y los recursos principales del sistema.',
        activo: true,
      },
      {
        codigo: 'ADMIN_SUCURSAL',
        nombre: 'Administrador de Sucursal',
        descripcion:
          'Administra las operaciones correspondientes a una sucursal.',
        activo: true,
      },
      {
        codigo: 'INVENTARIO',
        nombre: 'Encargado de Inventario',
        descripcion:
          'Gestiona medicamentos, existencias y movimientos de inventario.',
        activo: true,
      },
      {
        codigo: 'RRHH',
        nombre: 'Recursos Humanos',
        descripcion:
          'Gestiona empleados, planillas y procesos de recursos humanos.',
        activo: true,
      },
      {
        codigo: 'TRABAJADOR_SUCURSAL',
        nombre: 'Trabajador de Sucursal',
        descripcion:
          'Realiza las operaciones asignadas dentro de una sucursal.',
        activo: true,
      },
    ];

    for (const rolBase of rolesBase) {
      let rolExistente =
        await this.rolRepository.findOne({
          where: {
            codigo: rolBase.codigo,
          },
        });

      if (!rolExistente) {
        rolExistente =
          await this.rolRepository.findOne({
            where: {
              nombre: rolBase.nombre,
            },
          });
      }

      if (
        !rolExistente &&
        rolBase.codigo === 'RRHH'
      ) {
        rolExistente =
          await this.rolRepository.findOne({
            where: {
              nombre:
                'Recursos Humanos / Planilla',
            },
          });
      }

      if (rolExistente) {
        rolExistente.codigo =
          rolBase.codigo;

        rolExistente.nombre =
          rolBase.nombre;

        rolExistente.descripcion =
          rolBase.descripcion;

        rolExistente.activo =
          rolBase.activo;

        await this.rolRepository.save(
          rolExistente,
        );
      } else {
        const nuevoRol =
          this.rolRepository.create(
            rolBase,
          );

        await this.rolRepository.save(
          nuevoRol,
        );
      }
    }

    console.log(
      'Roles base verificados correctamente',
    );
  }
}