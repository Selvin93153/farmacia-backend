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

import { Inventario } from './entities/inventario.entity';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';

import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';

@Injectable()
export class InventariosService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
  ) {}

  async create(
    createInventarioDto: CreateInventarioDto,
  ): Promise<Inventario> {
    await this.validarSucursal(
      createInventarioDto.id_sucursal,
    );

    await this.validarMedicamento(
      createInventarioDto.id_medicamento,
    );

    try {
      const inventario =
        this.inventarioRepository.create(
          createInventarioDto,
        );

      const guardado =
        await this.inventarioRepository.save(
          inventario,
        );

      return this.findOne(
        guardado.id_inventario,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Inventario[]> {
    return this.inventarioRepository.find({
      relations: {
      sucursal: {
        municipio: {
          departamento: true,
        },
      },
      medicamento: true,
    },
    order: {
      id_inventario: 'ASC',
    },
  });
}

  async findOne(id: number): Promise<Inventario> {
    const inventario =
      await this.inventarioRepository.findOne({
        where: {
          id_inventario: id,
        },
         relations: {
      sucursal: {
        municipio: {
          departamento: true,
        },
      },
      medicamento: true,
    },
    order: {
      id_inventario: 'ASC',
    },
  });


    if (!inventario) {
      throw new NotFoundException(
        `El inventario con ID ${id} no existe`,
      );
    }

    return inventario;
  }

  async update(
    id: number,
    updateInventarioDto: UpdateInventarioDto,
  ): Promise<Inventario> {
    await this.findOne(id);

  const inventario =
    await this.inventarioRepository.preload({
      id_inventario: id,
      ...updateInventarioDto,
    });

  if (!inventario) {
    throw new NotFoundException(
      `El inventario con ID ${id} no existe`,
    );
  }

  await this.inventarioRepository.save(inventario);

  return this.findOne(id);


  }

  async remove(id: number): Promise<void> {
    const inventario = await this.findOne(id);

    try {
      await this.inventarioRepository.remove(
        inventario,
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

  private async validarMedicamento(
    id_medicamento: number,
  ): Promise<void> {
    const existe =
      await this.medicamentoRepository.exists({
        where: {
          id_medicamento,
        },
      });

    if (!existe) {
      throw new NotFoundException(
        `El medicamento con ID ${id_medicamento} no existe`,
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
          'Este medicamento ya tiene un inventario registrado en esta sucursal',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'Existe un problema con las relaciones del inventario',
        );
      }
    }

    throw error;
  }
}