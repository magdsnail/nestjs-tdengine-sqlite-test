import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable()
export class MqttInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MqttInterceptor.name, { timestamp: true });

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> | any {
    // if (context.getType() !== 'rpc') {
    //   return;
    // }
    
    const { responseTopic = '' } = context.getArgs()[1].getPacket()?.properties;
    const topic = context.getArgs()[1].getTopic();
    this.logger.log(`Before... 收到 MQTT 推送的 数据 TOPIC ${topic}`);
    const formatdata = {
      topic,
      responseTopic,
      data: context.getArgs()[0],
    };
    this.logger.log(JSON.stringify(formatdata));
    const now = Date.now();
    return next.handle().pipe(tap(() => this.logger.log(`After... ${Date.now() - now}ms`)));
  }
}