import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const req = context.getArgByIndex(0);
    return next.handle().pipe(
      map((data = true) => {
  //       const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // Request original url: ${req.originalUrl}
  // Method: ${req.method}
  // IP: ${req.ip}
  // Response data:\n ${JSON.stringify(data, (key, value) =>
  //         typeof value === "bigint" ? Number(value) : value
  //       )}
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;
        // this.logger.debug(logFormat);
        return typeof data === 'object'
          ? {
            ...data,
            code: HttpStatus.OK,
            message: 'success',
          }
          : data;
      }),
    );
  }
}
