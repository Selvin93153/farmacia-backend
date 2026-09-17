import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { FormasPagoService } from './formas-pago.service';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';

@Controller('formas-pago')
export class FormasPagoController {
  constructor(
    private readonly formasPagoService:
      FormasPagoService,
  ) {}

  @Post()
  create(
    @Body()
    createFormaPagoDto: CreateFormaPagoDto,
  ) {
    return this.formasPagoService.create(
      createFormaPagoDto,
    );
  }

  @Get()
  findAll() {
    return this.formasPagoService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.formasPagoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateFormaPagoDto: UpdateFormaPagoDto,
  ) {
    return this.formasPagoService.update(
      id,
      updateFormaPagoDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    await this.formasPagoService.remove(id);
  }
}