import { IsNotEmpty, IsString } from 'class-validator';

export class DepositReq {
  @IsString()
  @IsNotEmpty()
  amount: string;
}

export class DepositRes {
  success: boolean;
}

export class BuyRes {
  success: boolean;
}
