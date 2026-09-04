import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  inicio() {
    return { message: 'API Farmacia funcionando con NestJS' };
  }
}