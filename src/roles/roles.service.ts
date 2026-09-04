import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    try {
      const rol = this.rolRepository.create(createRolDto);

      return await this.rolRepository.save(rol);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }

    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.rolRepository.preload({
      id,
      ...updateRolDto,
    });

    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }

    try {
      return await this.rolRepository.save(rol);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);

    await this.rolRepository.remove(rol);
  }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error as any).driverError?.code === '23505'
    ) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }

    throw error;
  }
}