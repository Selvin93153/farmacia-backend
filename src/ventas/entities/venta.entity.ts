import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { Caja } from '../../caja/entites/caja.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { FormaPago } from '../../formas-pago/entities/forma-pago.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id_venta!: number;

  @Column()
  id_sucursal!: number;

  @Column()
  id_caja!: number;

  @Column()
  id_usuario!: number;

  @Column()
  id_forma_pago!: number;

  @CreateDateColumn()
  fecha!: Date;

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
  subtotal!: number;

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
  descuento!: number;

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
    length: 15,
    default: 'BORRADOR',
  })
  estado!: string;

  @ManyToOne(() => Sucursal, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal!: Sucursal;

  @ManyToOne(() => Caja, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_caja' })
  caja!: Caja;

  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => FormaPago, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_forma_pago' })
  forma_pago!: FormaPago;
}