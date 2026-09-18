import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('planillas')
@Unique([
  'id_sucursal',
  'mes',
  'anio',
])
export class Planilla {
  @PrimaryGeneratedColumn()
  id_planilla!: number;

  @Column()
  id_sucursal!: number;

  @Column({
    type: 'integer',
  })
  mes!: number;

  @Column({
    type: 'integer',
  })
  anio!: number;

  @CreateDateColumn()
  fecha_generacion!: Date;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  total_planilla!: number;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'BORRADOR',
  })
  estado!: string;

  @ManyToOne(
    () => Sucursal,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_sucursal',
  })
  sucursal!: Sucursal;
}