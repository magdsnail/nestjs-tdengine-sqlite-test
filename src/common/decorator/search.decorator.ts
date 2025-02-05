import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SearchQuery = createParamDecorator(
  async (_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    try {
      const search = JSON.parse(req.query?.search);
      return {
        ...req.query,
        search,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return req.query;
    }
  },
);
