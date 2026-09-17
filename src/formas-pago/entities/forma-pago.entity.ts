import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('formas_pago')
export class FormaPago {
  @PrimaryGeneratedColumn()
  id_forma_pago!: number;

  @Column({
    type: 'varchar',
    length: 80,
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