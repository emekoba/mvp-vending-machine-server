import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig, ModuleConfigs } from 'src/constants';
import { UserService } from 'src/services/user.service';
import { TransactionController } from 'src/controllers/transactions.controller';
import { TransactionService } from 'src/services/transactions.service';

@Module({
  imports: [
    jwtConfig,
    TypeOrmModule.forFeature(ModuleConfigs['transactions'].entities),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, UserService],
})
export class TransactionModule {}
