import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Municipio } from './entities/municipio.entity';
import { Departamento } from '../departamentos/entities/departamento.entity';
import { MunicipiosController } from './municipios.controller';
import { MunicipiosService } from './municipios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Municipio,
      Departamento,
    ]),
  ],
  controllers: [
    MunicipiosController,
  ],
  providers: [
    MunicipiosService,
  ],
  exports: [
    MunicipiosService,
  ],
})
export class MunicipiosModule {}