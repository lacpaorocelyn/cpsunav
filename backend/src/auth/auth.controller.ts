import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { pin: string; fullName?: string }) {
    return this.authService.register(body.pin, body.fullName);
  }

  @Post('login')
  async login(@Body() body: { studentId: string; pin: string }) {
    return this.authService.login(body.studentId, body.pin);
  }
}
