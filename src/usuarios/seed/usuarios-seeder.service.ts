import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../../roles/entities/rol.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';

@Injectable()
export class UsuariosSeederService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  // Crea o actualiza un usuario base por cada rol del sistema.
  async seed(): Promise<void> {
    const sucursalBase =
      await this.sucursalRepository.findOne({
        where: {},
        order: {
          id_sucursal: 'ASC',
        },
      });

    if (!sucursalBase) {
      throw new Error(
        'No se pueden crear los usuarios base porque no existe ninguna sucursal.',
      );
    }

    const usuariosBase = [
      {
        codigoRol: 'ADMIN_SISTEMA',
        codigoEmpleado: null,
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo: 'admin.sistema@sigfar.com',
        telefono: '55550001',
        usaSucursal: false,
      },
      {
        codigoRol: 'ADMIN_SUCURSAL',
        codigoEmpleado: 'EMP-001',
        nombre: 'Administrador',
        apellido: 'Sucursal',
        correo: 'admin.sucursal@sigfar.com',
        telefono: '55550002',
        usaSucursal: true,
      },
      {
        codigoRol: 'INVENTARIO',
        codigoEmpleado: 'EMP-002',
        nombre: 'Encargado',
        apellido: 'Inventario',
        correo: 'inventario@sigfar.com',
        telefono: '55550003',
        usaSucursal: true,
      },
      {
        codigoRol: 'RRHH',
        codigoEmpleado: 'EMP-003',
        nombre: 'Recursos',
        apellido: 'Humanos',
        correo: 'rrhh@sigfar.com',
        telefono: '55550004',
        usaSucursal: false,
      },
      {
        codigoRol: 'TRABAJADOR_SUCURSAL',
        codigoEmpleado: 'EMP-004',
        nombre: 'Trabajador',
        apellido: 'Sucursal',
        correo: 'trabajador@sigfar.com',
        telefono: '55550005',
        usaSucursal: true,
      },
    ];

    // La contraseña base se cifra antes de guardar los usuarios nuevos.
    const passwordHash = await argon2.hash(
      'Contra123',
    );

    for (const usuarioBase of usuariosBase) {
      const rol =
        await this.rolRepository.findOne({
          where: {
            codigo: usuarioBase.codigoRol,
          },
        });

      if (!rol) {
        throw new Error(
          `No existe el rol ${usuarioBase.codigoRol}.`,
        );
      }

      let empleado: Empleado | null = null;

      if (usuarioBase.codigoEmpleado) {
        empleado =
          await this.empleadoRepository.findOne({
            where: {
              codigo_empleado:
                usuarioBase.codigoEmpleado,
            },
          });

        if (!empleado) {
          throw new Error(
            `No existe el empleado ${usuarioBase.codigoEmpleado}.`,
          );
        }
      }

      const usuarioExistente =
        await this.usuarioRepository.findOne({
          where: {
            correo: usuarioBase.correo,
          },
        });

      if (usuarioExistente) {
        usuarioExistente.id_rol =
          rol.id;

        usuarioExistente.id_sucursal =
          usuarioBase.usaSucursal
            ? sucursalBase.id_sucursal
            : null;

        usuarioExistente.id_empleado =
          empleado?.id_empleado ?? null;

        usuarioExistente.nombre =
          usuarioBase.nombre;

        usuarioExistente.apellido =
          usuarioBase.apellido;

        usuarioExistente.telefono =
          usuarioBase.telefono;

        usuarioExistente.estado =
          'ACTIVO';

        await this.usuarioRepository.save(
          usuarioExistente,
        );

        continue;
      }

      const nuevoUsuario =
        this.usuarioRepository.create({
          id_rol: rol.id,

          id_sucursal:
            usuarioBase.usaSucursal
              ? sucursalBase.id_sucursal
              : null,

          id_empleado:
            empleado?.id_empleado ?? null,

          nombre:
            usuarioBase.nombre,

          apellido:
            usuarioBase.apellido,

          correo:
            usuarioBase.correo,

          password:
            passwordHash,

          telefono:
            usuarioBase.telefono,

          estado:
            'ACTIVO',
        });

      await this.usuarioRepository.save(
        nuevoUsuario,
      );
    }

    console.log(
      'Usuarios base verificados correctamente',
    );
  }
}