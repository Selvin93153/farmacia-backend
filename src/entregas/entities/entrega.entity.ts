import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Pedido } from '../../pedidos/entities/pedido.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('entregas')
export class Entrega {
  @PrimaryGeneratedColumn()
  id_entrega!: number;

  @Column({
    type: 'int',
    unique: true,
  })
  id_pedido!: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  id_repartidor!: number | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_asignacion!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_salida!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_entrega!: Date | null;

  @Column({
    type: 'int',
  })
  tiempo_estimado_min!: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'PENDIENTE',
  })
  estado!: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observaciones!: string | null;

  @OneToOne(() => Pedido, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_pedido',
  })
  pedido!: Pedido;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'id_repartidor',
  })
  repartidor!: Usuario | null;
}