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

export class createProductReq {
  @IsNotEmpty()
  @IsString()
  amountAvailable;

  @IsNotEmpty()
  @IsString()
  cost;

  @IsNotEmpty()
  @IsString()
  productName;
}

export class createProductRes {
  success: boolean;
  newProduct: Product;
}
