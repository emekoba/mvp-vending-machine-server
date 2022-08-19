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
import { fromEnum } from 'src/utils/helpers';
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
    let moneySpent;
    let productName;
    let changed;

    //* check if username already exists
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

    if (
      foundUser.role !== fromEnum({ value: UserRoles.BUYER, enum: UserRoles })
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: transactionErrors.notBuyer,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    //* save new user values
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

    if (parseInt(product.cost) > parseInt(amount)) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: transactionErrors.insufficientFunds,
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return {
      moneySpent,
      productName,
      changed,
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
