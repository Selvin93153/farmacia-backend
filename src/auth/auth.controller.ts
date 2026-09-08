import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Get } from '@nestjs/common';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

//iniciar sesión
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, usuario } =
      await this.authService.login(loginDto);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: 'Inicio de sesión exitoso',
      usuario,
    };
  }


  //sirve para saber quién tiene la sesión actual
 @Get('me')
  me(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.authService.me(user.sub);
  }


  //borrar la cookie access_token
  @Post('logout')
@HttpCode(HttpStatus.OK)
logout(
  @Res({ passthrough: true }) response: Response,
) {
  response.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return {
    message: 'Sesión cerrada correctamente',
  };
}

}