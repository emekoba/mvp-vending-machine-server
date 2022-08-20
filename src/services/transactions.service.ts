import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { productErrors, transactionErrors, userErrors } from 'src/constants';
import {
  BuyReq,
  BuyRes,
  DepositReq,
  DepositRes,
} from 'src/dto/transactions.dto';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { fromEnum, toEnum } from 'src/utils/helpers';
import { UserRoles } from 'src/enums';

export class TransactionService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async deposit(amount: string, userId: string): Promise<DepositRes> {
    let user: User;

    //* check if user exists
    try {
      user = await this.userRepo.findOne({
        where: { id: userId },
      });
    } catch {
      Logger.error(userErrors.findUser);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.findUser,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `user with id ${userId} does not exist`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    //* update deposit amount
    try {
      user = await this.userRepo.save({
        ...user,
        deposit: `${parseInt(amount) + parseInt(user.deposit)}`,
      });
    } catch (e) {
      Logger.error(e);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.updateUser + e,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return {
      success: true,
    };
  }

  async buy(payload: BuyReq): Promise<BuyRes> {
    const { amount, user, productId } = payload;

    let product: Product, foundUser: User;

    //* fetch recent* user data
    try {
      foundUser = await this.userRepo.findOne({
        where: { id: user.id },
      });
    } catch {
      Logger.error(userErrors.findUser);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.findUser,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    //* ensure user is buyer
    if (foundUser.role !== UserRoles.BUYER) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: transactionErrors.notBuyer,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    //* find product by id provided
    try {
      product = await this.productRepo.findOne({
        where: { id: productId },
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

    if (!product) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: productErrors.foundProduct,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    //* assert if user can afford product
    if (
      parseInt(product.cost) * parseInt(amount) >
      parseInt(foundUser.deposit)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: transactionErrors.insufficientFunds,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    //* assert product stock
    if (parseInt(product.amountAvailable) < parseInt(amount)) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: transactionErrors.insufficientProduct,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    console.log(
      product,
      product.amountAvailable,
      amount,
      parseInt(product.amountAvailable) - parseInt(amount),
    );

    if (parseInt(product.amountAvailable) !== 0) {
      //* debit user
      foundUser = await this.userRepo.save({
        ...foundUser,
        deposit: `${parseInt(foundUser.deposit) - parseInt(product.cost)}`,
      });

      //* update stock for product
      try {
        product = await this.productRepo.save({
          ...product,
          amountAvailable: `${
            parseInt(product.amountAvailable) - parseInt(amount)
          }`,
        });
      } catch (e) {
        Logger.error(e);

        throw new HttpException(
          {
            status: HttpStatus.NOT_IMPLEMENTED,
            error: transactionErrors.finalisingTransaction + e,
          },
          HttpStatus.NOT_IMPLEMENTED,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: productErrors.outOfStock,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return {
      moneySpent: product.cost,
      productName: product.productName,
      change: foundUser.deposit,
      success: true,
    };
  }

  async reset(user: User): Promise<any> {
    //* save new user values
    try {
      await this.userRepo.save({
        ...user,
        deposit: '0',
      });
    } catch (e) {
      Logger.error(e);

      throw new HttpException(
        {
          status: HttpStatus.NOT_IMPLEMENTED,
          error: userErrors.updateUser + e,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return {
      success: true,
    };
  }
}
