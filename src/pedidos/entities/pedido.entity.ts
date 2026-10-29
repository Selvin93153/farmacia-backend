import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Cliente } from '../../cliente/entities/cliente.entity';
import { FormaPago } from '../../formas-pago/entities/forma-pago.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id_pedido!: number;

  @Column()
  id_cliente!: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  id_sucursal_origen!: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  id_sucursal_asignada!: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  id_forma_pago!: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  id_usuario_registra!: number | null;

  @CreateDateColumn({
    type: 'timestamp',
  })
  fecha!: Date;

  @Column({
    type: 'varchar',
    length: 300,
  })
  direccion_entrega!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  latitud_entrega!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  longitud_entrega!: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  canal!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  total!: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'BORRADOR',
  })
  estado!: string;

  @ManyToOne(() => Cliente, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_cliente',
  })
  cliente!: Cliente;

  @ManyToOne(() => Sucursal, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sucursal_origen',
  })
  sucursal_origen!: Sucursal | null;

  @ManyToOne(() => Sucursal, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sucursal_asignada',
  })
  sucursal_asignada!: Sucursal | null;

  @ManyToOne(() => FormaPago, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_forma_pago',
  })
  forma_pago!: FormaPago | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'id_usuario_registra',
  })
  usuario_registra!: Usuario | null;
}