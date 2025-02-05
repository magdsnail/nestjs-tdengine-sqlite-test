import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

export class Base {
  @Prop()
  created: Date;

  @Prop()
  updated: Date;
}

export type BaseDocument = HydratedDocument<Base> & SchemaTimestampsConfig;
export const BaseSchema = SchemaFactory.createForClass(Base);
