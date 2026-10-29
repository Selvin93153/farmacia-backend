import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empleado } from '../entities/empleado.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Injectable()
export class EmpleadosSeederService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  // Crea o actualiza los empleados base asociados a usuarios del sistema.
  async seed(): Promise<void> {
    const empleadosBase = [
      {
        codigo_empleado: 'EMP-001',
        codigoSucursal: 'SUC-001',
        nombres: 'Administrador',
        apellidos: 'Sucursal',
        telefono: '55551001',
        puesto: 'Administrador de Sucursal',
        salario_base: 8500,
        fecha_ingreso: '2026-01-02',
        estado: 'ACTIVO',
      },
      {
        codigo_empleado: 'EMP-002',
        codigoSucursal: 'SUC-001',
        nombres: 'Encargado',
        apellidos: 'Inventario',
        telefono: '55551002',
        puesto: 'Encargado de Inventario',
        salario_base: 6000,
        fecha_ingreso: '2026-01-02',
        estado: 'ACTIVO',
      },
      {
        codigo_empleado: 'EMP-003',
        codigoSucursal: 'SUC-001',
        nombres: 'Recursos',
        apellidos: 'Humanos',
        telefono: '55551003',
        puesto: 'Recursos Humanos',
        salario_base: 7000,
        fecha_ingreso: '2026-01-02',
        estado: 'ACTIVO',
      },
      {
        codigo_empleado: 'EMP-004',
        codigoSucursal: 'SUC-001',
        nombres: 'Trabajador',
        apellidos: 'Sucursal',
        telefono: '55551004',
        puesto: 'Trabajador de Sucursal',
        salario_base: 4200,
        fecha_ingreso: '2026-01-02',
        estado: 'ACTIVO',
      },
    ];

    for (const empleadoBase of empleadosBase) {
      const sucursal =
        await this.sucursalRepository.findOne({
          where: {
            codigo: empleadoBase.codigoSucursal,
          },
        });

      if (!sucursal) {
        throw new Error(
          `No existe la sucursal ${empleadoBase.codigoSucursal}.`,
        );
      }

      const empleadoExistente =
        await this.empleadoRepository.findOne({
          where: {
            codigo_empleado:
              empleadoBase.codigo_empleado,
          },
        });

      if (empleadoExistente) {
        empleadoExistente.id_sucursal =
          sucursal.id_sucursal;

        empleadoExistente.nombres =
          empleadoBase.nombres;

        empleadoExistente.apellidos =
          empleadoBase.apellidos;

        empleadoExistente.telefono =
          empleadoBase.telefono;

        empleadoExistente.puesto =
          empleadoBase.puesto;

        empleadoExistente.salario_base =
          empleadoBase.salario_base;

        empleadoExistente.fecha_ingreso =
          empleadoBase.fecha_ingreso;

        empleadoExistente.estado =
          empleadoBase.estado;

        await this.empleadoRepository.save(
          empleadoExistente,
        );

        continue;
      }

      const nuevoEmpleado =
        this.empleadoRepository.create({
          id_sucursal:
            sucursal.id_sucursal,

          codigo_empleado:
            empleadoBase.codigo_empleado,

          nombres:
            empleadoBase.nombres,

          apellidos:
            empleadoBase.apellidos,

          telefono:
            empleadoBase.telefono,

          puesto:
            empleadoBase.puesto,

          salario_base:
            empleadoBase.salario_base,

          fecha_ingreso:
            empleadoBase.fecha_ingreso,

          estado:
            empleadoBase.estado,
        });

      await this.empleadoRepository.save(
        nuevoEmpleado,
      );
    }

    console.log(
      'Empleados base verificados correctamente',
    );
  }
}