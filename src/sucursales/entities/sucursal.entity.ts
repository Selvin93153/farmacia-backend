import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Municipio } from '../../municipios/entities/municipio.entity';

@Entity('sucursales')
export class Sucursal {
  @PrimaryGeneratedColumn()
  id_sucursal!: number;

  @Column()
  id_municipio!: number;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  codigo!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  tipo_sucursal!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  direccion!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  latitud!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  longitud!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  telefono!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVA',
  })
  estado!: string;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @ManyToOne(
    () => Municipio,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_municipio',
  })
  municipio!: Municipio;
}