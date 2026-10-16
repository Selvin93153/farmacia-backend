import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id_cliente!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombres!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidos!: string | null;

  @Column({
    type: 'varchar',
    length: 30,
  })
  telefono!: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  correo!: string | null;
}