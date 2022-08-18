import { HttpStatus } from '@nestjs/common';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Product } from 'src/entities/product.entity';

export class CreateProductReq {
  @IsNotEmpty()
  @IsString()
  amountAvailable: string;

  @IsNotEmpty()
  @IsString()
  cost: string;

  @IsNotEmpty()
  @IsString()
  productName: string;
}

export class CreateProductRes {
  success: boolean;
  newProduct: Product;
}

export class FetchProductReq {
  productId: string;
  userId: string;
}

export class FetchProductRes {
  success: boolean;
  product: Product;
}
export class FetchAllProductsRes {
  success: boolean;
  products: Product[];
}

export class UpdateProductReq {
  productId: string;
  amountAvailable: string;
  cost: string;
  productName: string;
}

export class UpdateProductRes {
  success: boolean;
  updatedProduct: Product;
}
