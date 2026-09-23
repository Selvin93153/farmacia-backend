import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('cajas')
@Unique(['id_sucursal', 'nombre'])
export class Caja {
  @PrimaryGeneratedColumn()
  id_caja!: number;

  @Column()
  id_sucursal!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVA',
  })
  estado!: string;

  @ManyToOne(() => Sucursal, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sucursal',
  })
  sucursal!: Sucursal;
}