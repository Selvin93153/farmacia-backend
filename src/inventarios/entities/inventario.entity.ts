import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';

@Entity('inventarios')
@Unique(['id_sucursal', 'id_medicamento'])
export class Inventario {
  @PrimaryGeneratedColumn()
  id_inventario!: number;

  @Column()
  id_sucursal!: number;

  @Column()
  id_medicamento!: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  stock_actual!: number;

  @Column({
    type: 'integer',
  })
  stock_minimo!: number;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;

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

  @ManyToOne(
    () => Medicamento,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_medicamento',
  })
  medicamento!: Medicamento;
}