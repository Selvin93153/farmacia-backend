import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Medicamento } from './entities/medicamento.entity';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';

@Injectable()
export class MedicamentosService {
  constructor(
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
  ) {}

  async create(
    createMedicamentoDto: CreateMedicamentoDto,
  ): Promise<Medicamento> {
    try {
      const medicamento =
        this.medicamentoRepository.create(createMedicamentoDto);

      return await this.medicamentoRepository.save(medicamento);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Medicamento[]> {
    return this.medicamentoRepository.find({
      order: {
        id_medicamento: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Medicamento> {
    const medicamento =
      await this.medicamentoRepository.findOne({
        where: {
          id_medicamento: id,
        },
      });

    if (!medicamento) {
      throw new NotFoundException(
        `El medicamento con ID ${id} no existe`,
      );
    }

    return medicamento;
  }

  async update(
    id: number,
    updateMedicamentoDto: UpdateMedicamentoDto,
  ): Promise<Medicamento> {
    const medicamento =
      await this.medicamentoRepository.preload({
        id_medicamento: id,
        ...updateMedicamentoDto,
      });

    if (!medicamento) {
      throw new NotFoundException(
        `El medicamento con ID ${id} no existe`,
      );
    }

    try {
      return await this.medicamentoRepository.save(medicamento);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const medicamento = await this.findOne(id);

    try {
      await this.medicamentoRepository.remove(medicamento);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe un medicamento con ese código',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'No se puede eliminar el medicamento porque tiene registros relacionados',
        );
      }
    }

    throw error;
  }
}