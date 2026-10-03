import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id!: number;

   @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: true,
  })
  codigo!: string | null;
  
  @Column({ length: 50, unique: true })
  nombre!: string;

  @Column({ length: 150, nullable: true })
  descripcion!: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;
}