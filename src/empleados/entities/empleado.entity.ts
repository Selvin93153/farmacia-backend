import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id_empleado!: number;

  @Column()
  id_sucursal!: number;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  codigo_empleado!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombres!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  apellidos!: string;

  @Column({
  type: 'varchar',
  length: 20,
})
telefono!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  puesto!: string;

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
    type: 'date',
  })
  fecha_ingreso!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVO',
  })
  estado!: string;

  @CreateDateColumn()
  fecha_creacion!: Date;

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