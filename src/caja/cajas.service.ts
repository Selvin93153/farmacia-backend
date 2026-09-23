import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Caja } from '../caja/entites/caja.entity';  
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';

import { Sucursal } from '../sucursales/entities/sucursal.entity';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async create(createCajaDto: CreateCajaDto): Promise<Caja> {
    await this.validarSucursal(createCajaDto.id_sucursal);

    try {
      const caja = this.cajaRepository.create(createCajaDto);

      const guardada = await this.cajaRepository.save(caja);

      return this.findOne(guardada.id_caja);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Caja[]> {
    return this.cajaRepository.find({
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
      order: {
        id_caja: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Caja> {
    const caja = await this.cajaRepository.findOne({
      where: {
        id_caja: id,
      },
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
    });

    if (!caja) {
      throw new NotFoundException(
        `La caja con ID ${id} no existe`,
      );
    }

    return caja;
  }

async update(
  id: number,
  updateCajaDto: UpdateCajaDto,
): Promise<Caja> {
  const caja = await this.cajaRepository.preload({
    id_caja: id,
    ...updateCajaDto,
  });

  if (!caja) {
    throw new NotFoundException(
      `La caja con ID ${id} no existe`,
    );
  }

  try {
    await this.cajaRepository.save(caja);

    return this.findOne(id);
  } catch (error) {
    this.handleDatabaseError(error);
  }
}

  async remove(id: number): Promise<void> {
    const caja = await this.findOne(id);

    try {
      await this.cajaRepository.remove(caja);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async validarSucursal(
    id_sucursal: number,
  ): Promise<void> {
    const existe = await this.sucursalRepository.exists({
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

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe una caja con ese nombre en esta sucursal',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'La caja tiene registros relacionados y no puede eliminarse',
        );
      }
    }

    throw error;
  }
}