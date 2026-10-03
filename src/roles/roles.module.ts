import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Rol } from './entities/rol.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesSeederService } from './seed/roles-seeder.service';


@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [RolesController],
  providers: [RolesService, RolesSeederService],
  exports: [RolesService],
})
export class RolesModule {}