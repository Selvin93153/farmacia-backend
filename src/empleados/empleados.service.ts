import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryFailedError,
  Repository,
} from 'typeorm';

import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

import { Sucursal } from '../sucursales/entities/sucursal.entity';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository:
      Repository<Empleado>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository:
      Repository<Sucursal>,
  ) {}

  async create(
    createEmpleadoDto: CreateEmpleadoDto,
  ): Promise<Empleado> {
    await this.validarSucursal(
      createEmpleadoDto.id_sucursal,
    );

    try {
      const empleado =
        this.empleadoRepository.create(
          createEmpleadoDto,
        );

      const guardado =
        await this.empleadoRepository.save(
          empleado,
        );

      return this.findOne(
        guardado.id_empleado,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Empleado[]> {
    return this.empleadoRepository.find({
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
      order: {
        id_empleado: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Empleado> {
    const empleado =
      await this.empleadoRepository.findOne({
        where: {
          id_empleado: id,
        },
        relations: {
          sucursal: {
            municipio: {
              departamento: true,
            },
          },
        },
      });

    if (!empleado) {
      throw new NotFoundException(
        `El empleado con ID ${id} no existe`,
      );
    }

    return empleado;
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    if (
      updateEmpleadoDto.id_sucursal !== undefined
    ) {
      await this.validarSucursal(
        updateEmpleadoDto.id_sucursal,
      );
    }

    const empleado =
      await this.empleadoRepository.preload({
        id_empleado: id,
        ...updateEmpleadoDto,
      });

    if (!empleado) {
      throw new NotFoundException(
        `El empleado con ID ${id} no existe`,
      );
    }

    try {
      await this.empleadoRepository.save(
        empleado,
      );

      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);

    try {
      await this.empleadoRepository.remove(
        empleado,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async validarSucursal(
    id_sucursal: number,
  ): Promise<void> {
    const existe =
      await this.sucursalRepository.exists({
        where: {
          id_sucursal,
        },
      });

    if (!existe) {
      throw new NotFoundException(
        `La sucursal con ID ${id_sucursal} no existe`,
      );
    }
  }

  private handleDatabaseError(
    error: unknown,
  ): never {
    if (error instanceof QueryFailedError) {
      const code =
        (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe un empleado con ese código',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'El empleado tiene registros relacionados y no puede eliminarse',
        );
      }
    }

    throw error;
  }
}