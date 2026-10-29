import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FormaPago } from '../entities/forma-pago.entity';

@Injectable()
export class FormasPagoSeederService {
  constructor(
    @InjectRepository(FormaPago)
    private readonly formaPagoRepository: Repository<FormaPago>,
  ) {}

  // Crea o actualiza las formas de pago base del sistema.
  async seed(): Promise<void> {
    const formasPagoBase = [
      {
        nombre: 'Efectivo',
        estado: 'ACTIVO',
      },
      {
        nombre: 'Tarjeta',
        estado: 'ACTIVO',
      },
    ];

    for (const formaPagoBase of formasPagoBase) {
      const formaPagoExistente =
        await this.formaPagoRepository.findOne({
          where: {
            nombre: formaPagoBase.nombre,
          },
        });

      if (formaPagoExistente) {
        formaPagoExistente.estado =
          formaPagoBase.estado;

        await this.formaPagoRepository.save(
          formaPagoExistente,
        );

        continue;
      }

      const nuevaFormaPago =
        this.formaPagoRepository.create(
          formaPagoBase,
        );

      await this.formaPagoRepository.save(
        nuevaFormaPago,
      );
    }

    console.log(
      'Formas de pago base verificadas correctamente',
    );
  }
}