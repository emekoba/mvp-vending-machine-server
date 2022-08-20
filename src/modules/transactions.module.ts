import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig, ModuleConfigs } from '../constants';
import { UserService } from '../services/user.service';
import { TransactionController } from 'src/controllers/transactions.controller';
import { TransactionService } from '../services/transactions.service';

@Module({
  imports: [
    jwtConfig,
    TypeOrmModule.forFeature(ModuleConfigs['transactions'].entities),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, UserService],
})
export class TransactionModule {}
