import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Municipio } from './entities/municipio.entity';
import { Departamento } from '../departamentos/entities/departamento.entity';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';

@Injectable()
export class MunicipiosService {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,

    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  async create(
    createMunicipioDto: CreateMunicipioDto,
  ): Promise<Municipio> {
    await this.validarDepartamento(
      createMunicipioDto.id_departamento,
    );

    try {
      const municipio =
        this.municipioRepository.create(createMunicipioDto);

      return await this.municipioRepository.save(municipio);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Municipio[]> {
    return this.municipioRepository.find({
      relations: {
        departamento: true,
      },
      order: {
        id_municipio: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Municipio> {
    const municipio = await this.municipioRepository.findOne({
      where: {
        id_municipio: id,
      },
      relations: {
        departamento: true,
      },
    });

    if (!municipio) {
      throw new NotFoundException(
        `El municipio con ID ${id} no existe`,
      );
    }

    return municipio;
  }

  async update(
    id: number,
    updateMunicipioDto: UpdateMunicipioDto,
  ): Promise<Municipio> {
    if (updateMunicipioDto.id_departamento !== undefined) {
      await this.validarDepartamento(
        updateMunicipioDto.id_departamento,
      );
    }

    const municipio = await this.municipioRepository.preload({
      id_municipio: id,
      ...updateMunicipioDto,
    });

    if (!municipio) {
      throw new NotFoundException(
        `El municipio con ID ${id} no existe`,
      );
    }

    try {
      await this.municipioRepository.save(municipio);

      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const municipio = await this.findOne(id);

    try {
      await this.municipioRepository.remove(municipio);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async validarDepartamento(id: number): Promise<void> {
    const existe = await this.departamentoRepository.exists({
      where: {
        id_departamento: id,
      },
    });

    if (!existe) {
      throw new NotFoundException(
        `El departamento con ID ${id} no existe`,
      );
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'El municipio ya existe en ese departamento',
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