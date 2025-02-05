import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let customCode =
      exception instanceof ApiException
        ? (exception as ApiException).getErrorCode()
        : status;
    let customMsg: string;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message = (response as any).message ?? response;
      if (Array.isArray(message)) {
        customMsg = message[0];
      } else {
        customMsg = exception.message;
      }
    } else {
      customMsg = `${exception}`;
    }
    try {
      const { code, message } = JSON.parse(exception.message);
      customCode = code;
      customMsg = message;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // ignore
    }

    const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	  Request original url: ${request.originalUrl}
	  Method: ${request.method}
	  IP: ${request.ip}
	  Status code: ${status}
	  Response: ${exception.toString()} \n  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	  `;
    this.logger.debug(logFormat);
    response.status(status).send({
      code: customCode ?? status,
      message: customMsg,
      success: false,
      timestamp: new Date().toLocaleString(),
      path: request.url,
    });
  }
}
