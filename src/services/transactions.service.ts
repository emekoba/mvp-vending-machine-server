import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { productErrors } from 'src/constants';
import {
  CreateProductReq,
  CreateProductRes,
  FetchProductReq,
  FetchProductRes,
  UpdateProductReq,
  UpdateProductRes,
} from 'src/dto/product.dto';
import { Product } from 'src/entities/product.entity';
import { isEmpty } from 'src/utils/helpers';
import { Repository } from 'typeorm';

export class TransactionService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async createProduct(payload: CreateProductReq): Promise<CreateProductRes> {
    const { amountAvailable, cost, productName } = payload;

    let newProduct: Product;

    //* save new user values
    try {
      newProduct = await this.productRepo.save({
        amountAvailable,
        cost,
        productName,
      });
    } catch (e) {
      Logger.error(e);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.saveProduct + e,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return {
      newProduct,
      success: true,
    };
  }
}
