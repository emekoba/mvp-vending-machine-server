import { Product } from '../entities/product.entity';
import { BuyReq, BuyRes } from '../dto/transactions.dto';
import { Request } from 'express';
import { UserRoles } from '../enums';

export const mockUser = {
  id: '2',
  username: 'russ',
  deposit: '200',
  token: '',
  password: '',
  role: UserRoles.BUYER,
  products: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBuyReq: BuyReq = {
  user: mockUser,
  productId: '',
  amount: '23',
};

export const mockBuyRes: BuyRes = {
  success: true,
  moneySpent: '122',
  productName: 'Milk',
  change: '321',
};

export const mockBuyRequest = {
  body: {
    // ...mockBuyReq,
  },
  headers: {
    authorization: 'Bearer eydsofiakloewksjdlfsjdlfjasldfjlk',
  },
} as Request;

export const mockRequest = {
  body: {},
  headers: {
    authorization: 'Bearer eydsofiakloewksjdlfsjdlfjasldfjlk',
  },
} as Request;

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
