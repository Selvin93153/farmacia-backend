import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicamento } from '../entities/medicamento.entity';

@Injectable()
export class MedicamentosSeederService {
  constructor(
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
  ) {}

  // Crea o actualiza los medicamentos base del sistema.
  async seed(): Promise<void> {
    const medicamentosBase = [
      {
        codigo: 'MED-001',
        nombre: 'Acetaminofén',
        principio_activo: 'Paracetamol',
        concentracion: '500 mg',
        presentacion: 'Tabletas',
        laboratorio: 'Bayer',
        precio_venta: 12.5,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-002',
        nombre: 'Ibuprofeno',
        principio_activo: 'Ibuprofeno',
        concentracion: '400 mg',
        presentacion: 'Tabletas',
        laboratorio: 'MK',
        precio_venta: 18.75,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-003',
        nombre: 'Amoxicilina',
        principio_activo: 'Amoxicilina',
        concentracion: '500 mg',
        presentacion: 'Cápsulas',
        laboratorio: 'MK',
        precio_venta: 38.5,
        requiere_receta: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-004',
        nombre: 'Loratadina',
        principio_activo: 'Loratadina',
        concentracion: '10 mg',
        presentacion: 'Tabletas',
        laboratorio: 'Genfar',
        precio_venta: 20,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-005',
        nombre: 'Omeprazol',
        principio_activo: 'Omeprazol',
        concentracion: '20 mg',
        presentacion: 'Cápsulas',
        laboratorio: 'Genfar',
        precio_venta: 24.5,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-006',
        nombre: 'Azitromicina',
        principio_activo: 'Azitromicina',
        concentracion: '500 mg',
        presentacion: 'Tabletas',
        laboratorio: 'MK',
        precio_venta: 55,
        requiere_receta: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-007',
        nombre: 'Diclofenaco',
        principio_activo: 'Diclofenaco sódico',
        concentracion: '50 mg',
        presentacion: 'Tabletas',
        laboratorio: 'Genfar',
        precio_venta: 16.75,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-008',
        nombre: 'Metformina',
        principio_activo: 'Metformina',
        concentracion: '850 mg',
        presentacion: 'Tabletas',
        laboratorio: 'MK',
        precio_venta: 32,
        requiere_receta: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-009',
        nombre: 'Losartán',
        principio_activo: 'Losartán potásico',
        concentracion: '50 mg',
        presentacion: 'Tabletas',
        laboratorio: 'Genfar',
        precio_venta: 35.5,
        requiere_receta: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-010',
        nombre: 'Amlodipino',
        principio_activo: 'Amlodipino',
        concentracion: '5 mg',
        presentacion: 'Tabletas',
        laboratorio: 'MK',
        precio_venta: 28,
        requiere_receta: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-011',
        nombre: 'Salbutamol',
        principio_activo: 'Salbutamol',
        concentracion: '100 mcg',
        presentacion: 'Inhalador',
        laboratorio: 'GlaxoSmithKline',
        precio_venta: 85,
        requiere_receta: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-012',
        nombre: 'Cetirizina',
        principio_activo: 'Cetirizina',
        concentracion: '10 mg',
        presentacion: 'Tabletas',
        laboratorio: 'Genfar',
        precio_venta: 22.5,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-013',
        nombre: 'Naproxeno',
        principio_activo: 'Naproxeno sódico',
        concentracion: '550 mg',
        presentacion: 'Tabletas',
        laboratorio: 'MK',
        precio_venta: 26.75,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-014',
        nombre: 'Clotrimazol',
        principio_activo: 'Clotrimazol',
        concentracion: '1%',
        presentacion: 'Crema 20 g',
        laboratorio: 'Genfar',
        precio_venta: 29.5,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
      {
        codigo: 'MED-015',
        nombre: 'Acetaminofén Pediátrico',
        principio_activo: 'Paracetamol',
        concentracion: '120 mg / 5 ml',
        presentacion: 'Jarabe 120 ml',
        laboratorio: 'MK',
        precio_venta: 31.5,
        requiere_receta: false,
        estado: 'ACTIVO',
      },
    ];

    for (const medicamentoBase of medicamentosBase) {
      const medicamentoExistente =
        await this.medicamentoRepository.findOne({
          where: {
            codigo: medicamentoBase.codigo,
          },
        });

      if (medicamentoExistente) {
        medicamentoExistente.nombre =
          medicamentoBase.nombre;

        medicamentoExistente.principio_activo =
          medicamentoBase.principio_activo;

        medicamentoExistente.concentracion =
          medicamentoBase.concentracion;

        medicamentoExistente.presentacion =
          medicamentoBase.presentacion;

        medicamentoExistente.laboratorio =
          medicamentoBase.laboratorio;

        medicamentoExistente.precio_venta =
          medicamentoBase.precio_venta;

        medicamentoExistente.requiere_receta =
          medicamentoBase.requiere_receta;

        medicamentoExistente.estado =
          medicamentoBase.estado;

        await this.medicamentoRepository.save(
          medicamentoExistente,
        );
      } else {
        const nuevoMedicamento =
          this.medicamentoRepository.create(
            medicamentoBase,
          );

        await this.medicamentoRepository.save(
          nuevoMedicamento,
        );
      }
    }

    console.log(
      'Medicamentos base verificados correctamente',
    );
  }
}