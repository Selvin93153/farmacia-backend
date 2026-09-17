import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FormaPago } from './entities/forma-pago.entity';
import { FormasPagoController } from './formas-pago.controller';
import { FormasPagoService } from './formas-pago.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormaPago,
    ]),
  ],
  controllers: [
    FormasPagoController,
  ],
  providers: [
    FormasPagoService,
  ],
  exports: [
    FormasPagoService,
  ],
})
export class FormasPagoModule {}