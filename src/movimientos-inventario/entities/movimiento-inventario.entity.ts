import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Inventario } from '../../inventarios/entities/inventario.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id_movimiento!: number;

  @Column()
  id_inventario!: number;

  @Column()
  id_usuario!: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  tipo_movimiento!: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  motivo!: string;

  @Column({
    type: 'integer',
  })
  cantidad!: number;

  @Column({
    type: 'integer',
  })
  stock_anterior!: number;

  @Column({
    type: 'integer',
  })
  stock_nuevo!: number;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  referencia!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacion!: string | null;

  @CreateDateColumn()
  fecha!: Date;

  @ManyToOne(
    () => Inventario,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_inventario',
  })
  inventario!: Inventario;

  @ManyToOne(
    () => Usuario,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'id_usuario',
  })
  usuario!: Usuario;
}