import { Test } from '@nestjs/testing';
import { TransactionService } from '../services/transactions.service';
import { TransactionController } from './transactions.controller';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockRepository } from '../utils/mockRepository';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import {
  mockBuyReq,
  mockBuyRequest,
  mockBuyRes,
  mockRequest,
  mockResponse,
} from '../utils/mockObject';
import { ValidateServiceRequest } from '../utils/validate.service.request';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;
  let validateService: ValidateServiceRequest;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        TransactionService,
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
    validateService = module.get<ValidateServiceRequest>(
      ValidateServiceRequest,
    );
    jest
      .spyOn(validateService, 'authenticateServiceRequest')
      .mockImplementation(async (token: string) => {
        console.log('this is mock', token);
      });
    // jest
    //   .spyOn(TransactionService, 'verifyToken')
    //   .mockImplementation(async (token: string) => {
    //     console.log('this is mock', token);
    //   });
  });

  afterEach(() => jest.clearAllMocks());

  it('should return an transaction log', async () => {
    const res = mockResponse();
    jest
      .spyOn(transactionService, 'buy')
      .mockImplementation(jest.fn().mockResolvedValueOnce(mockBuyRes));
    await controller.buy(mockRequest, res, mockBuyReq);
    expect(transactionService.buy).toHaveBeenCalledTimes(1);
  });

  describe('purchase product should return ok', () => {
    it('create activityType', async () => {
      const res = mockResponse();
      jest.spyOn(transactionService, 'buy').mockResolvedValueOnce(mockBuyRes);
      mockRequest.body = mockBuyReq;
      await controller.buy(mockRequest, res, mockBuyReq);
      expect(transactionService.buy).toHaveBeenCalledTimes(1);
    });
  });

  describe('purchase product should throw', () => {
    it('purchase product should throw exception', async () => {
      const res = mockResponse();
      jest.spyOn(transactionService, 'buy').mockImplementation(async () => {
        throw new HttpException(
          {
            status: HttpStatus.NOT_IMPLEMENTED,
          },
          HttpStatus.NOT_IMPLEMENTED,
        );
      });
      mockRequest.body = mockBuyReq;
      try {
        await controller.buy(mockRequest, res, mockBuyReq);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });

  // describe('update activityType should return ok', () => {
  //   it('update activityType', async () => {
  //     const res = mockResponse();
  //     jest
  //       .spyOn(transactionService, 'updateActivityLog')
  //       .mockResolvedValueOnce(mockedupdateActivityRes);
  //     mockRequest.body = mockedupdateActivityReq;
  //     await controller.updateActivityCtlr(mockRequest, res);
  //     expect(transactionService.updateActivityLog).toHaveBeenCalledTimes(1);
  //   });
  // });
});
