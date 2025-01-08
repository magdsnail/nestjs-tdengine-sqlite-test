import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IedpApiI } from '../configs/iedp.config';
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

  @Inject('MATH_SERVICE_MQTT') protected mqttService: ClientProxy;

  async onApplicationBootstrap() {
    await this.mqttService.connect();
  }

  /**
   * 告警通知
   */
  async alarmNotice() {
    const { baseUrl } = this.configService.get<IedpApiI>('iedp');
    firstValueFrom(this.httpService.get(`${baseUrl}/alarm/notice/sync`));
  }
}