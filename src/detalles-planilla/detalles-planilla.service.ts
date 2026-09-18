import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { DetallePlanilla } from './entities/detalle-planilla.entity';
import { CreateDetallePlanillaDto } from './dto/create-detalle-planilla.dto';
import { UpdateDetallePlanillaDto } from './dto/update-detalle-planilla.dto';

import { Planilla } from '../planillas/entities/planilla.entity';
import { Empleado } from '../empleados/entities/empleado.entity';

@Injectable()
export class DetallesPlanillaService {
  constructor(
    @InjectRepository(DetallePlanilla)
    private readonly detalleRepository:
      Repository<DetallePlanilla>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createDto: CreateDetallePlanillaDto,
  ): Promise<DetallePlanilla> {
    try {
      const detalleGuardado =
        await this.dataSource.transaction(
          async (manager) => {
            const planilla =
              await manager.findOne(Planilla, {
                where: {
                  id_planilla:
                    createDto.id_planilla,
                },
              });

            if (!planilla) {
              throw new NotFoundException(
                `La planilla con ID ${createDto.id_planilla} no existe`,
              );
            }

            if (planilla.estado !== 'BORRADOR') {
              throw new BadRequestException(
                'Solo se pueden agregar empleados a una planilla en estado BORRADOR',
              );
            }

            const empleado =
              await manager.findOne(Empleado, {
                where: {
                  id_empleado:
                    createDto.id_empleado,
                },
              });

            if (!empleado) {
              throw new NotFoundException(
                `El empleado con ID ${createDto.id_empleado} no existe`,
              );
            }

            if (empleado.estado !== 'ACTIVO') {
              throw new BadRequestException(
                'El empleado no se encuentra activo',
              );
            }

            if (
              empleado.id_sucursal !==
              planilla.id_sucursal
            ) {
              throw new BadRequestException(
                'El empleado no pertenece a la sucursal de esta planilla',
              );
            }

            const salarioBase =
              empleado.salario_base;

            const bonificaciones =
              createDto.bonificaciones ?? 0;

            const descuentos =
              createDto.descuentos ?? 0;

            const totalPagado =
              salarioBase +
              bonificaciones -
              descuentos;

            if (totalPagado < 0) {
              throw new BadRequestException(
                'Los descuentos no pueden superar el salario más las bonificaciones',
              );
            }

            const detalle = manager.create(
              DetallePlanilla,
              {
                id_planilla:
                  createDto.id_planilla,

                id_empleado:
                  createDto.id_empleado,

                salario_base:
                  salarioBase,

                bonificaciones,

                descuentos,

                total_pagado:
                  totalPagado,
              },
            );

            const guardado =
              await manager.save(
                DetallePlanilla,
                detalle,
              );

            await this.recalcularTotal(
              manager,
              planilla,
            );

            return guardado;
          },
        );

      return this.findOne(
        detalleGuardado.id_detalle_planilla,
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<
    DetallePlanilla[]
  > {
    return this.detalleRepository.find({
      relations: {
        planilla: {
          sucursal: true,
        },
        empleado: {
          sucursal: true,
        },
      },
      order: {
        id_detalle_planilla: 'ASC',
      },
    });
  }

  async findOne(
    id: number,
  ): Promise<DetallePlanilla> {
    const detalle =
      await this.detalleRepository.findOne({
        where: {
          id_detalle_planilla: id,
        },
        relations: {
          planilla: {
            sucursal: true,
          },
          empleado: {
            sucursal: true,
          },
        },
      });

    if (!detalle) {
      throw new NotFoundException(
        `El detalle de planilla con ID ${id} no existe`,
      );
    }

    return detalle;
  }

  async update(
    id: number,
    updateDto: UpdateDetallePlanillaDto,
  ): Promise<DetallePlanilla> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle =
          await manager.findOne(
            DetallePlanilla,
            {
              where: {
                id_detalle_planilla: id,
              },
            },
          );

        if (!detalle) {
          throw new NotFoundException(
            `El detalle de planilla con ID ${id} no existe`,
          );
        }

        const planilla =
          await manager.findOne(Planilla, {
            where: {
              id_planilla:
                detalle.id_planilla,
            },
          });

        if (!planilla) {
          throw new NotFoundException(
            'La planilla relacionada no existe',
          );
        }

        if (planilla.estado !== 'BORRADOR') {
          throw new BadRequestException(
            'Solo se puede modificar una planilla en estado BORRADOR',
          );
        }

        if (
          updateDto.bonificaciones !==
          undefined
        ) {
          detalle.bonificaciones =
            updateDto.bonificaciones;
        }

        if (
          updateDto.descuentos !==
          undefined
        ) {
          detalle.descuentos =
            updateDto.descuentos;
        }

        detalle.total_pagado =
          detalle.salario_base +
          detalle.bonificaciones -
          detalle.descuentos;

        if (detalle.total_pagado < 0) {
          throw new BadRequestException(
            'Los descuentos no pueden superar el salario más las bonificaciones',
          );
        }

        await manager.save(
          DetallePlanilla,
          detalle,
        );

        await this.recalcularTotal(
          manager,
          planilla,
        );
      },
    );

    return this.findOne(id);
  }

  async remove(
    id: number,
  ): Promise<void> {
    await this.dataSource.transaction(
      async (manager) => {
        const detalle =
          await manager.findOne(
            DetallePlanilla,
            {
              where: {
                id_detalle_planilla: id,
              },
            },
          );

        if (!detalle) {
          throw new NotFoundException(
            `El detalle de planilla con ID ${id} no existe`,
          );
        }

        const planilla =
          await manager.findOne(Planilla, {
            where: {
              id_planilla:
                detalle.id_planilla,
            },
          });

        if (!planilla) {
          throw new NotFoundException(
            'La planilla relacionada no existe',
          );
        }

        if (planilla.estado !== 'BORRADOR') {
          throw new BadRequestException(
            'Solo se pueden eliminar detalles de una planilla en estado BORRADOR',
          );
        }

        await manager.remove(
          DetallePlanilla,
          detalle,
        );

        await this.recalcularTotal(
          manager,
          planilla,
        );
      },
    );
  }
  
//La suma de todos los empleados se hace aquí
  private async recalcularTotal(
    manager: any,
    planilla: Planilla,
  ): Promise<void> {
    const resultado =
      await manager
        .createQueryBuilder(
          DetallePlanilla,
          'detalle',
        )
        .select(
          'COALESCE(SUM(detalle.total_pagado), 0)',
          'total',
        )
        .where(
          'detalle.id_planilla = :id_planilla',
          {
            id_planilla:
              planilla.id_planilla,
          },
        )
        .getRawOne();

    planilla.total_planilla =
      Number(resultado.total);

    await manager.save(
      Planilla,
      planilla,
    );
  }

  private handleDatabaseError(
    error: unknown,
  ): never {
    if (error instanceof QueryFailedError) {
      const code =
        (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Este empleado ya está incluido en esta planilla',
        );
      }

      if (code === '23503') {
        throw new ConflictException(
          'Existe un problema con las relaciones del detalle de planilla',
        );
      }
    }

    throw error;
  }
}