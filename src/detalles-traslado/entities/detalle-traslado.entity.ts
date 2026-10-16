import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Medicamento } from '../../medicamentos/entities/medicamento.entity';
import { Traslado } from '../../traslados/entities/traslado.entity';

@Entity('detalles_traslado')
@Index(
  ['id_traslado', 'id_medicamento'],
  {
    unique: true,
  },
)
export class DetalleTraslado {
  @PrimaryGeneratedColumn()
  id_detalle_traslado!: number;

  @Column()
  id_traslado!: number;

  @Column()
  id_medicamento!: number;

  @Column({
    type: 'int',
  })
  cantidad_solicitada!: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  cantidad_enviada!: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  cantidad_recibida!: number | null;

  @ManyToOne(
    () => Traslado,
    (traslado) => traslado.detalles,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'id_traslado',
  })
  traslado!: Traslado;

  @ManyToOne(() => Medicamento, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_medicamento',
  })
  medicamento!: Medicamento;
}