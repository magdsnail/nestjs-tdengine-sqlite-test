import { Global, Module } from '@nestjs/common';
import { TdengineService } from './tdengine.service';
import { HttpModule } from '@nestjs/axios';
import { MongodbService } from './mongodb.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      global: true,
    })],
  providers: [TdengineService],
  exports: [TdengineService],
})
export class CoreModule { }
