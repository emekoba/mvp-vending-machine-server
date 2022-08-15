import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Response, Request } from 'express';
import { appMessages } from 'src/constants';
import { RegisterRes } from 'src/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async create(@Req() req: Request, @Res() resp: Response) {
    const { createdUser, success }: RegisterRes =
      await this.authService.register(req.body);

    if (success) {
      resp.json({
        success,
        message: appMessages.registerSuccessful,
        status: HttpStatus.CREATED,
        createdUser,
      });
    }
  }
}
