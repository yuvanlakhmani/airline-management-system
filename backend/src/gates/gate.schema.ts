import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Gate extends Document {
  @Prop({ required: true })
  gateNumber: string;

  @Prop({ required: true })
  airport: string;
}

export const GateSchema = SchemaFactory.createForClass(Gate);
