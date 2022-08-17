import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig, ModuleConfigs } from 'src/constants';
import { UserService } from 'src/services/user.service';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';

@Module({
  imports: [
    jwtConfig,
    TypeOrmModule.forFeature(ModuleConfigs['product'].entities),
  ],
  controllers: [ProductController],
  providers: [ProductService, UserService],
})
export class ProductModule {}
