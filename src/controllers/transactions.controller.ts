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
} from 'src/constants';
import { Response, Request } from 'express';
import { Middleware, UseMiddleware } from 'src/utils/helpers';
import { UserService } from 'src/services/user.service';
import { TransactionService } from 'src/services/transactions.service';
import { BuyReq, BuyRes, DepositReq } from 'src/dto/transactions.dto';

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
      useCookies: true,
    });
  }

  @Post('deposit')
  @UseMiddleware('sessionGuard')
  async update(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: DepositReq,
  ) {
    const { amount } = body;

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
    const { amount, productId } = body;

    // if (!validTransactionAmount.includes(amount)) {
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.NOT_ACCEPTABLE,
    //       error: transactionErrors.invalidAmount,
    //     },
    //     HttpStatus.NOT_ACCEPTABLE,
    //   );
    // }

    if (req.body.user.amount == 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: transactionErrors.walletEmpty,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const { success }: BuyRes = await this.transactionService.buy({
      amount,
      user: req.body.user,
      productId,
    });

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
