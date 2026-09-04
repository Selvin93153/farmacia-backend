import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Departamento } from './entities/departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  async create(
    createDepartamentoDto: CreateDepartamentoDto,
  ): Promise<Departamento> {
    try {
      const departamento =
        this.departamentoRepository.create(createDepartamentoDto);

      return await this.departamentoRepository.save(departamento);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Departamento[]> {
    return this.departamentoRepository.find({
      order: {
        id_departamento: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Departamento> {
    const departamento = await this.departamentoRepository.findOne({
      where: {
        id_departamento: id,
      },
    });

    if (!departamento) {
      throw new NotFoundException(
        `El departamento con ID ${id} no existe`,
      );
    }

    return departamento;
  }

  async update(
    id: number,
    updateDepartamentoDto: UpdateDepartamentoDto,
  ): Promise<Departamento> {
    const departamento = await this.departamentoRepository.preload({
      id_departamento: id,
      ...updateDepartamentoDto,
    });

    if (!departamento) {
      throw new NotFoundException(
        `El departamento con ID ${id} no existe`,
      );
    }

    try {
      return await this.departamentoRepository.save(departamento);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const departamento = await this.findOne(id);

    try {
      await this.departamentoRepository.remove(departamento);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe un departamento con ese nombre',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'No se puede eliminar el departamento porque tiene registros relacionados',
        );
      }
    }

    throw error;
  }
}