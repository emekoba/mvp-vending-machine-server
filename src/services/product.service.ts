import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { productErrors } from 'src/constants';
import {
  CreateProductReq,
  CreateProductRes,
  FetchAllProductsRes,
  FetchProductReq,
  FetchProductRes,
  UpdateProductReq,
  UpdateProductRes,
} from 'src/dto/product.dto';
import { Product } from 'src/entities/product.entity';
import { isEmpty } from 'src/utils/helpers';
import { Repository } from 'typeorm';

export class ProductService {
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

  async fetchProduct(payload: FetchProductReq): Promise<FetchProductRes> {
    const { productId, userId } = payload;

    let product: Product;

    //* check if username already exists
    try {
      product = await this.productRepo.findOne({
        where: {
          id: productId,
          // user: { id: userId }
        },
      });
    } catch {
      Logger.error(productErrors.findProduct);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.findProduct,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* If user not found throw error
    if (!product) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `user with id ${productId} does not exist`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      product,
      success: true,
    };
  }

  async fetchAllProducts(): Promise<FetchAllProductsRes> {
    let products: Product[];

    //* check if username already exists
    try {
      products = await this.productRepo.find({});
    } catch {
      Logger.error(productErrors.findProduct);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.findProduct,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return {
      products,
      success: true,
    };
  }

  async updateProduct(payload: UpdateProductReq): Promise<UpdateProductRes> {
    const { productId, amountAvailable, cost, productName } = payload;

    let foundProduct: Product, updatedProduct: Product;

    //* check if user exists
    try {
      foundProduct = await this.productRepo.findOne({
        where: { id: productId },
      });
    } catch {
      Logger.error(productErrors.findProduct);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.findProduct,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (!foundProduct) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `user with id ${productId} does not exist`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    //* update user values
    try {
      updatedProduct = await this.productRepo.save({
        ...foundProduct,
        amountAvailable: isEmpty(amountAvailable)
          ? foundProduct.amountAvailable
          : amountAvailable,
        cost: isEmpty(cost) ? foundProduct.cost : cost,
        productName: isEmpty(productName)
          ? foundProduct.productName
          : productName,
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
      success: true,
      updatedProduct,
    };
  }

  async deleteProduct(userId: string): Promise<any> {
    try {
      this.productRepo.delete({ id: userId });
    } catch {
      Logger.error(productErrors.findProduct);

      return { success: false };
    }

    return { success: true };
  }
}
