import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Http-Api业务异常抛出该异常
 */
export class ApiException extends HttpException {
  /**
   * 业务类型错误代码，非Http code
   */
  private errorCode: number;

  constructor(msg: string = '业务异常', errorCode: HttpStatus.BAD_REQUEST) {
    super(msg, HttpStatus.OK);
    this.errorCode = errorCode;
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
