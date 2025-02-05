import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';

/**
 * 公用方法
 */
@Injectable()
export class BaseService {

  @Inject()
  protected readonly configService: ConfigService;

  @Inject()
  protected readonly httpService: HttpService;

  @Inject()
  protected readonly eventEmitter: EventEmitter2;

  // @Inject(MqttService)
  // protected readonly mqttService: MqttService;

  @Inject('MATH_SERVICE_MQTT') protected mqttService: ClientProxy;

  @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger;
  
  async onApplicationBootstrap() {
    await this.mqttService.connect();
  }

}