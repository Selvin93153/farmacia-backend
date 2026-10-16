import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Medicamento } from '../../medicamentos/entities/medicamento.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';

@Entity('detalles_pedido')
@Index(
  'UQ_detalle_pedido_medicamento',
  ['id_pedido', 'id_medicamento'],
  {
    unique: true,
  },
)
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id_detalle_pedido!: number;

  @Column()
  id_pedido!: number;

  @Column()
  id_medicamento!: number;

  @Column({
    type: 'int',
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

  @ManyToOne(() => Pedido, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_pedido',
  })
  pedido!: Pedido;

  @ManyToOne(() => Medicamento, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_medicamento',
  })
  medicamento!: Medicamento;
}