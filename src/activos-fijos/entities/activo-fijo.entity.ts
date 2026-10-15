import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('activos_fijos')
export class ActivoFijo {
  @PrimaryGeneratedColumn()
  id_activo!: number;

  @Column()
  id_sucursal!: number;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  codigo!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  descripcion!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  categoria!: string;

  @Column({
    type: 'date',
  })
  fecha_adquisicion!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  valor_adquisicion!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  valor_actual!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVO',
  })
  estado!: string;

  @ManyToOne(() => Sucursal, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sucursal',
  })
  sucursal!: Sucursal;
}