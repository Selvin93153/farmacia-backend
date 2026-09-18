import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Planilla } from '../../planillas/entities/planilla.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';

@Entity('detalles_planilla')
@Unique([
  'id_planilla',
  'id_empleado',
])
export class DetallePlanilla {
  @PrimaryGeneratedColumn()
  id_detalle_planilla!: number;

  @Column()
  id_planilla!: number;

  @Column()
  id_empleado!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  salario_base!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  bonificaciones!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  descuentos!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  total_pagado!: number;

  @ManyToOne(
    () => Planilla,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_planilla',
  })
  planilla!: Planilla;

  @ManyToOne(
    () => Empleado,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_empleado',
  })
  empleado!: Empleado;
}