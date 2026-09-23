import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Venta } from '../../ventas/entities/venta.entity';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';

@Entity('detalles_venta')
@Unique([
  'id_venta',
  'id_medicamento',
])
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id_detalle_venta!: number;

  @Column()
  id_venta!: number;

  @Column()
  id_medicamento!: number;

  @Column({
    type: 'integer',
  })
  cantidad!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  precio_unitario!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  subtotal!: number;

  @ManyToOne(() => Venta, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_venta',
  })
  venta!: Venta;

  @ManyToOne(() => Medicamento, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_medicamento',
  })
  medicamento!: Medicamento;
}