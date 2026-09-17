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

import { FormaPago } from './entities/forma-pago.entity';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';

@Injectable()
export class FormasPagoService {
  constructor(
    @InjectRepository(FormaPago)
    private readonly formaPagoRepository:
      Repository<FormaPago>,
  ) {}

  async create(
    createFormaPagoDto: CreateFormaPagoDto,
  ): Promise<FormaPago> {
    try {
      const formaPago =
        this.formaPagoRepository.create(
          createFormaPagoDto,
        );

      return await this.formaPagoRepository.save(
        formaPago,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<FormaPago[]> {
    return this.formaPagoRepository.find({
      order: {
        id_forma_pago: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<FormaPago> {
    const formaPago =
      await this.formaPagoRepository.findOne({
        where: {
          id_forma_pago: id,
        },
      });

    if (!formaPago) {
      throw new NotFoundException(
        `La forma de pago con ID ${id} no existe`,
      );
    }

    return formaPago;
  }

  async update(
    id: number,
    updateFormaPagoDto: UpdateFormaPagoDto,
  ): Promise<FormaPago> {
    const formaPago =
      await this.formaPagoRepository.preload({
        id_forma_pago: id,
        ...updateFormaPagoDto,
      });

    if (!formaPago) {
      throw new NotFoundException(
        `La forma de pago con ID ${id} no existe`,
      );
    }

    try {
      return await this.formaPagoRepository.save(
        formaPago,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const formaPago = await this.findOne(id);

    try {
      await this.formaPagoRepository.remove(
        formaPago,
      );
    } catch (error) {
      this.handleDatabaseError(error);
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
          'Ya existe una forma de pago con ese nombre',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'No se puede eliminar la forma de pago porque tiene registros relacionados',
        );
      }
    }

    throw error;
  }
}