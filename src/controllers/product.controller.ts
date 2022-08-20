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
import { productMessages, productErrors } from '../constants';
import { ProductService } from '../services/product.service';
import { Response, Request } from 'express';
import {
  CreateProductReq,
  UpdateProductReq,
  UpdateProductRes,
} from '../dto/product.dto';
import { Middleware, UseMiddleware } from '../utils/helpers';
import { UserService } from '../services/user.service';
import { config } from 'dotenv';
config();

const { COOKIES } = process.env;

@Controller('product')
export class ProductController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @Middleware
  async sessionGuard(req, resp) {
    await this.userService.verifyToken(req, resp, {
      noTimeout: true,
      useCookies: COOKIES.toLowerCase() === 'true',
    });
  }

  @Post('create')
  @UseMiddleware('sessionGuard')
  async create(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: CreateProductReq,
  ) {
    const { success, newProduct } = await this.productService.createProduct(
      req.body,
    );

    if (success) {
      resp.json({
        status: HttpStatus.CREATED,
        message: productMessages.createdProduct,
        newProduct,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.createProduct,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  @Get('all')
  @UseMiddleware('sessionGuard')
  async readAll(@Req() req: Request, @Res() resp: Response) {
    const { success, products } = await this.productService.fetchAllProducts(
      req.body.user,
    );
    if (success) {
      resp.json({
        status: HttpStatus.FOUND,
        message: productMessages.fetchedAllProducts,
        products,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: productErrors.fetchFailed,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('/:id')
  async read(
    @Req() req: Request,
    @Res() resp: Response,
    @Param('id') productId: string,
  ) {
    const { success, product } = await this.productService.fetchProduct({
      productId,
      // user: req.body.user,
    });

    if (success) {
      resp.json({
        status: HttpStatus.FOUND,
        message: productMessages.fetchedProduct,
        product,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: productErrors.fetchFailed,
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

  @Delete('delete/:id')
  @UseMiddleware('sessionGuard')
  async delete(@Req() req: Request, @Res() resp: Response) {
    const { success } = await this.productService.deleteProduct(req.params.id);

    if (success) {
      resp.json({
        status: HttpStatus.FOUND,
        message: productMessages.deletedSuccessful,
      });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.deleteFailed,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
