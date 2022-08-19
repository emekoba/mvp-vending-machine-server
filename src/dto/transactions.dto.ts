import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/entities/user.entity';

export class DepositReq {
  @IsString()
  @IsNotEmpty()
  amount: string;
}

export class DepositRes {
  success: boolean;
}

export class BuyReq {
  user: User;
  productId: string;
  @IsString()
  @IsNotEmpty()
  amount: string;
}
export class BuyRes {
  moneySpent: string;
  productName: string;
  changed: string;
  success: boolean;
}
