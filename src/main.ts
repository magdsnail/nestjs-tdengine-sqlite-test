import { NestFactory } from '@nestjs/core';
import { getBodyParserOptions } from "@nestjs/platform-express/adapters/utils/get-body-parser-options.util";

import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    // app.use(json(getBodyParserOptions(true, { limit: '50mb'})));
    // app.use(urlencoded(getBodyParserOptions(true, { limit: '50mb' })));
    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    throw new Error(error);
  }

}
bootstrap();
