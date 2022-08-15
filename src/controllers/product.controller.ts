import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { appMessages } from 'src/constants';
import { ProductService } from 'src/services/product.service';
import { Response, Request } from 'express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  async create(@Req() req: Request, @Res() resp: Response) {
    const { newProduct } = await this.productService.createProduct(req.body);

    resp.json({
      success: true,
      status: HttpStatus.CREATED,
      message: appMessages.productCreated,
      product: newProduct,
    });
  }
}
