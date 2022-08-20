import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Response, Request } from 'express';
import { userErrors, userMessages } from '../constants';
import {
  LoginReq,
  LoginRes,
  RegisterReq,
  RegisterRes,
  UpdateUserReq,
  UpdateUserRes,
} from '../dto/user.dto';
import { Middleware, UseMiddleware } from '../utils/helpers';
import { config } from 'dotenv';
config();

const { COOKIES } = process.env;

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Middleware
  async sessionGuard(req, resp) {
    await this.userService.verifyToken(req, resp, {
      noTimeout: true,
      useCookies: COOKIES.toLowerCase() === 'true',
    });
  }

  @Post('create')
  async create(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: RegisterReq,
  ) {
    const { createdUser, success }: RegisterRes =
      await this.userService.register(req.body);

    if (success) {
      resp.json({
        success,
        message: userMessages.registerSuccessful,
        status: HttpStatus.CREATED,
        createdUser,
      });
    }
  }

  @Get(':id')
  async read(@Res() resp: Response, @Param('id') id) {
    const { success, user } = await this.userService.fetchUser(id);

    if (success) {
      resp.json({
        status: HttpStatus.FOUND,
        message: userMessages.fetchedUser,
        user,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: userErrors.fetchFailed,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('update')
  @UseMiddleware('sessionGuard')
  async update(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: UpdateUserReq,
  ) {
    const { updatedUser, success }: UpdateUserRes =
      await this.userService.updateUser({
        ...req.body,
        userId: req.body.user.id,
      });

    if (success) {
      resp.json({
        success,
        message: userMessages.updateSuccessful,
        status: HttpStatus.ACCEPTED,
        updatedUser,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_MODIFIED,
          error: userErrors.updateFailed,
        },
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  @Delete('delete/:id')
  async delete(@Res() resp: Response, @Param('id') id) {
    const { success } = await this.userService.deleteUser(id);

    if (success) {
      resp.json({
        status: HttpStatus.FOUND,
        message: userMessages.deletedUser,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.deleteFailed,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  @Post('login')
  async loginCtlr(@Res() resp: Response, @Body() body: LoginReq) {
    const { success, user, token }: LoginRes = await this.userService.login(
      body,
    );

    if (success) {
      resp.cookie('jwt', token, { httpOnly: true });

      resp.json({
        status: HttpStatus.CREATED,
        message: userMessages.loginSuccess,
        token,
        user,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: userErrors.loginFailed,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
