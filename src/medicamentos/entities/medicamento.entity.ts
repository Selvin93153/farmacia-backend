import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('medicamentos')
export class Medicamento {
  @PrimaryGeneratedColumn()
  id_medicamento!: number;

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
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  principio_activo!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  concentracion!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  presentacion!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  laboratorio!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  precio_venta!: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  requiere_receta!: boolean;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'ACTIVO',
  })
  estado!: string;

  @CreateDateColumn()
  fecha_creacion!: Date;
}