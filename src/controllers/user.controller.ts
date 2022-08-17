import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Response, Request } from 'express';
import { appErrors, appMessages } from 'src/constants';
import {
  LoginReq,
  LoginRes,
  RegisterReq,
  RegisterRes,
  UpdateUserReq,
  UpdateUserRes,
} from 'src/dto/user.dto';
import { Middleware } from 'src/utils/helpers';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Middleware
  async sessionGuard(req, resp) {
    await this.userService.verifyToken(req, resp, {
      noTimeout: true,
      useCookies: true,
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
        message: appMessages.registerSuccessful,
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
        message: appMessages.fetchedUser,
        user,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: appErrors.fetchFailed,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('update')
  async update(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: UpdateUserReq,
  ) {
    const { updatedUser, success }: UpdateUserRes =
      await this.userService.updateUser(req.body);

    if (success) {
      resp.json({
        success,
        message: appMessages.updateSuccessful,
        status: HttpStatus.ACCEPTED,
        updatedUser,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_MODIFIED,
          error: appErrors.updateFailed,
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
        message: appMessages.deletedUser,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: appErrors.deleteFailed,
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
        message: appMessages.loginSuccess,
        token,
        user,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: appErrors.loginFailed,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
