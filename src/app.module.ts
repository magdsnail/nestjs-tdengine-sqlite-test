import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './entity/machine.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'main.db',
      autoLoadEntities: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Machine]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


