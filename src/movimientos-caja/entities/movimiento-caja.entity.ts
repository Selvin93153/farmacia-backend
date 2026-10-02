import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Caja } from '../../caja/entites/caja.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Venta } from '../../ventas/entities/venta.entity';

@Entity('movimientos_caja')
export class MovimientoCaja {
  @PrimaryGeneratedColumn()
  id_movimiento_caja!: number;

  @Column()
  id_caja!: number;

  @Column()
  id_usuario!: number;

  @Column({
    nullable: true,
  })
  id_venta!: number | null;

  @Column({
    type: 'varchar',
    length: 20,
  })
  tipo_movimiento!: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  concepto!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  monto!: number;

  @CreateDateColumn()
  fecha!: Date;

  @ManyToOne(() => Caja, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_caja',
  })
  caja!: Caja;

  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_usuario',
  })
  usuario!: Usuario;

  @ManyToOne(() => Venta, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_venta',
  })
  venta!: Venta | null;
}