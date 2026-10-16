import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DetalleTraslado } from '../../detalles-traslado/entities/detalle-traslado.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('traslados')
export class Traslado {
  @PrimaryGeneratedColumn()
  id_traslado!: number;

  @Column()
  id_sucursal_origen!: number;

  @Column()
  id_sucursal_destino!: number;

  @Column()
  id_usuario_solicita!: number;

  @Column({
    nullable: true,
  })
  id_usuario_envia!: number | null;

  @Column({
    nullable: true,
  })
  id_usuario_recibe!: number | null;

  @CreateDateColumn({
    type: 'timestamp',
  })
  fecha_solicitud!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_envio!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_recepcion!: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'SOLICITADO',
  })
  estado!: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observaciones!: string | null;

  @ManyToOne(() => Sucursal, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sucursal_origen',
  })
  sucursal_origen!: Sucursal;

  @ManyToOne(() => Sucursal, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sucursal_destino',
  })
  sucursal_destino!: Sucursal;

  @ManyToOne(() => Usuario, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_usuario_solicita',
  })
  usuario_solicita!: Usuario;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_usuario_envia',
  })
  usuario_envia!: Usuario | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_usuario_recibe',
  })
  usuario_recibe!: Usuario | null;

  @OneToMany(
    () => DetalleTraslado,
    (detalle) => detalle.traslado,
  )
  detalles!: DetalleTraslado[];
}