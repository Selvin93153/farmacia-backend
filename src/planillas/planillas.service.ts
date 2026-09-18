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

import { Planilla } from './entities/planilla.entity';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';

import { Sucursal } from '../sucursales/entities/sucursal.entity';

@Injectable()
export class PlanillasService {
  constructor(
    @InjectRepository(Planilla)
    private readonly planillaRepository:
      Repository<Planilla>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository:
      Repository<Sucursal>,
  ) {}

  async create(
    createPlanillaDto: CreatePlanillaDto,
  ): Promise<Planilla> {
    await this.validarSucursal(
      createPlanillaDto.id_sucursal,
    );

    try {
      const planilla =
        this.planillaRepository.create(
          createPlanillaDto,
        );

      const guardada =
        await this.planillaRepository.save(
          planilla,
        );

      return this.findOne(
        guardada.id_planilla,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Planilla[]> {
    return this.planillaRepository.find({
      relations: {
        sucursal: {
          municipio: {
            departamento: true,
          },
        },
      },
      order: {
        anio: 'DESC',
        mes: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Planilla> {
    const planilla =
      await this.planillaRepository.findOne({
        where: {
          id_planilla: id,
        },
        relations: {
          sucursal: {
            municipio: {
              departamento: true,
            },
          },
        },
      });

    if (!planilla) {
      throw new NotFoundException(
        `La planilla con ID ${id} no existe`,
      );
    }

    return planilla;
  }

  async update(
    id: number,
    updatePlanillaDto: UpdatePlanillaDto,
  ): Promise<Planilla> {
    const planilla =
      await this.planillaRepository.preload({
        id_planilla: id,
        ...updatePlanillaDto,
      });

    if (!planilla) {
      throw new NotFoundException(
        `La planilla con ID ${id} no existe`,
      );
    }

    await this.planillaRepository.save(
      planilla,
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const planilla = await this.findOne(id);

    try {
      await this.planillaRepository.remove(
        planilla,
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
          'Ya existe una planilla para esta sucursal, mes y año',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'La planilla tiene registros relacionados y no puede eliminarse',
        );
      }
    }

    throw error;
  }
}