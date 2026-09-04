import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('departamentos')
export class Departamento {
  @PrimaryGeneratedColumn()
  id_departamento!: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVO',
  })
  estado!: string;
}