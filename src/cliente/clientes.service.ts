import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  // Registra un nuevo cliente.
  async create(
    createClienteDto: CreateClienteDto,
  ): Promise<Cliente> {
    const cliente = this.clienteRepository.create({
      nombres: createClienteDto.nombres.trim(),
      apellidos:
        createClienteDto.apellidos?.trim() || null,
      telefono: createClienteDto.telefono.trim(),
      correo:
        createClienteDto.correo?.trim().toLowerCase() || null,
    });

    return this.clienteRepository.save(cliente);
  }

  // Obtiene todos los clientes registrados.
  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      order: {
        id_cliente: 'ASC',
      },
    });
  }

  // Obtiene un cliente por su identificador.
  async findOne(id: number): Promise<Cliente> {
    const cliente =
      await this.clienteRepository.findOne({
        where: {
          id_cliente: id,
        },
      });

    if (!cliente) {
      throw new NotFoundException(
        'El cliente no existe.',
      );
    }

    return cliente;
  }

  // Actualiza los datos de un cliente.
  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (updateClienteDto.nombres !== undefined) {
      cliente.nombres =
        updateClienteDto.nombres.trim();
    }

    if (updateClienteDto.apellidos !== undefined) {
      cliente.apellidos =
        updateClienteDto.apellidos.trim() || null;
    }

    if (updateClienteDto.telefono !== undefined) {
      cliente.telefono =
        updateClienteDto.telefono.trim();
    }

    if (updateClienteDto.correo !== undefined) {
      cliente.correo =
        updateClienteDto.correo.trim().toLowerCase() ||
        null;
    }

    return this.clienteRepository.save(cliente);
  }

  // Elimina un cliente mientras no tenga relaciones que lo impidan.
  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);

    await this.clienteRepository.remove(cliente);
  }
}