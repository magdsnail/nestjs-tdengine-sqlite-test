import { registerAs } from '@nestjs/config';

export interface TdengineConfigI {
  uri: string;
  db: string;
}

export default registerAs('tdengine', (): TdengineConfigI => ({
  uri: `ws://${process.env.TDENGINE_USER}:${process.env.TDENGINE_PASSWORD}@${process.env.TDENGINE_HOST}:${process.env.TDENGINE_PORT}/${process.env.TDENGINE_DATABASE}`,
  db: process.env.TDENGINE_DATABASE,
}));
