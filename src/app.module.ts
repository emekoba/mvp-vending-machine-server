import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GET_ALL_ENTITIES, ModuleConfigs } from './constants';
import { UserModule } from './modules/user.module';
import { configService } from './services/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig(GET_ALL_ENTITIES())),
    TypeOrmModule.forFeature(ModuleConfigs['app'].entities),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
