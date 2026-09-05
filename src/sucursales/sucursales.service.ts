import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Sucursal } from './entities/sucursal.entity';
import { Municipio } from '../municipios/entities/municipio.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
  ) {}

  async create(
    createSucursalDto: CreateSucursalDto,
  ): Promise<Sucursal> {
    await this.validarMunicipio(createSucursalDto.id_municipio);

    try {
      const sucursal =
        this.sucursalRepository.create(createSucursalDto);

      return await this.sucursalRepository.save(sucursal);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Sucursal[]> {
  return this.sucursalRepository.find({
    relations: {
      municipio: {
        departamento: true,
      },
    },
    order: {
      id_sucursal: 'ASC',
    },
  });
}

 async findOne(id: number): Promise<Sucursal> {
  const sucursal = await this.sucursalRepository.findOne({
    where: {
      id_sucursal: id,
    },
    relations: {
      municipio: {
        departamento: true,
      },
    },
  });

  if (!sucursal) {
    throw new NotFoundException(
      `La sucursal con ID ${id} no existe`,
    );
  }

  return sucursal;
}

  async update(
    id: number,
    updateSucursalDto: UpdateSucursalDto,
  ): Promise<Sucursal> {
    if (updateSucursalDto.id_municipio !== undefined) {
      await this.validarMunicipio(
        updateSucursalDto.id_municipio,
      );
    }

    const sucursal = await this.sucursalRepository.preload({
      id_sucursal: id,
      ...updateSucursalDto,
    });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${id} no existe`,
      );
    }

    try {
      await this.sucursalRepository.save(sucursal);

      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const sucursal = await this.findOne(id);

    try {
      await this.sucursalRepository.remove(sucursal);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async validarMunicipio(id: number): Promise<void> {
    const existe = await this.municipioRepository.exists({
      where: {
        id_municipio: id,
      },
    });

    if (!existe) {
      throw new NotFoundException(
        `El municipio con ID ${id} no existe`,
      );
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe una sucursal con ese código',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'No se puede realizar la operación porque existen registros relacionados',
        );
      }
    }

    throw error;
  }
}