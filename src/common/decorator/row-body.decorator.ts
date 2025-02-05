import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  RawBodyRequest,
} from '@nestjs/common';

export const RowBody = createParamDecorator(
  async (_, context: ExecutionContext) => {
    const req = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();
    if (!req.rawBody) {
      throw new BadRequestException('Invalid rawBody');
    }
    try {
      const body = JSON.parse(req.rawBody.toString('utf8').trim());
      return body;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return req.body;
    }
  },
);
