import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Departamento } from '../../departamentos/entities/departamento.entity';

@Entity('municipios')
@Unique(['id_departamento', 'nombre'])
export class Municipio {
  @PrimaryGeneratedColumn()
  id_municipio!: number;

  @Column()
  id_departamento!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVO',
  })
  estado!: string;

  @ManyToOne(
    () => Departamento,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_departamento',
  })
  departamento!: Departamento;
}