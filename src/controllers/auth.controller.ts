import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Req() req: Request, @Res() resp: Response) {}
}
