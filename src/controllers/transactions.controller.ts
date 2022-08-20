import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  validTransactionAmount,
  transactionErrors,
  transactionMessages,
} from '../constants';
import { Response, Request } from 'express';
import { Middleware, UseMiddleware } from '../utils/helpers';
import { UserService } from '../services/user.service';
import { TransactionService } from '../services/transactions.service';
import { BuyReq, BuyRes, DepositReq } from '../dto/transactions.dto';

const { COOKIES } = process.env;

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
  ) {}

  @Middleware
  async sessionGuard(req, resp) {
    await this.userService.verifyToken(req, resp, {
      noTimeout: true,
      useCookies: COOKIES.toLowerCase() === 'true',
    });
  }

  @Post('deposit')
  @UseMiddleware('sessionGuard')
  async deposit(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: DepositReq,
  ) {
    const { amount } = req.body;

    if (!validTransactionAmount.includes(amount)) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: transactionErrors.invalidAmount,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const { success } = await this.transactionService.deposit(
      amount,
      req.body.user.id,
    );

    if (success) {
      resp.json({
        success,
        message: transactionMessages.depositSuccessful,
        status: HttpStatus.ACCEPTED,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: transactionErrors.depositFailed,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  @Post('buy')
  @UseMiddleware('sessionGuard')
  async buy(@Req() req: Request, @Res() resp: Response, @Body() body: BuyReq) {
    const res: BuyRes = await this.transactionService.buy(req.body);

    if (res.success) {
      delete res.success;

      resp.json({
        success: true,
        message: transactionMessages.purchaseSuccessful,
        status: HttpStatus.ACCEPTED,
        logs: res,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: transactionErrors.depositFailed,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  @Post('reset')
  @UseMiddleware('sessionGuard')
  async reset(@Req() req: Request, @Res() resp: Response) {
    const { success }: BuyRes = await this.transactionService.reset(
      req.body.user,
    );

    if (success) {
      resp.json({
        success,
        message: transactionMessages.resetSuccessful,
        status: HttpStatus.ACCEPTED,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: transactionErrors.resetFailed,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
