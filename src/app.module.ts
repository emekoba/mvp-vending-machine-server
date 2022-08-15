import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENTITIES } from './constants';
import { configService } from './services/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig(ENTITIES)),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
