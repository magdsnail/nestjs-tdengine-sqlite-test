import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const MqttPayloadBody = createParamDecorator(
  async (_, context: ExecutionContext) => {
    const payload = context.getArgByIndex(0);
    if (!payload) {
      throw new BadRequestException('Invalid rawBody');
    }
    try {
      const body = JSON.parse(payload.toString('utf8').trim());
      return body;
    } catch (error) {
      throw new BadRequestException(error);
    }
  },
);
