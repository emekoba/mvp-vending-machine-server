import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { productMessages, productErrors } from 'src/constants';
import { ProductService } from 'src/services/product.service';
import { Response, Request } from 'express';
import {
  CreateProductReq,
  UpdateProductReq,
  UpdateProductRes,
} from 'src/dto/product.dto';
import { Middleware, UseMiddleware } from 'src/utils/helpers';
import { UserService } from 'src/services/user.service';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @Middleware
  async sessionGuard(req, resp) {
    await this.userService.verifyToken(req, resp, {
      noTimeout: true,
      useCookies: true,
    });
  }

  @Post('deposit')
  // @UseMiddleware('sessionGuard')
  async update(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: UpdateProductReq,
  ) {
    const { updatedProduct, success }: UpdateProductRes =
      await this.productService.updateProduct(req.body);

    if (success) {
      resp.json({
        success,
        message: productMessages.updateSuccessful,
        status: HttpStatus.ACCEPTED,
        updatedProduct,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_MODIFIED,
          error: productErrors.updateFailed,
        },
        HttpStatus.NOT_MODIFIED,
      );
    }
  }
}
