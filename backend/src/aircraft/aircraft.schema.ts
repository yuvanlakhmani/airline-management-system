import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Aircraft extends Document {
  
  @Prop({ required: true })
  regNumber: string; // VT-ABC

  @Prop({ required: true })
  type: string; // A320, B737

  @Prop()
  capacity: number;

  @Prop({ default: 45 })
  turnaroundMin: number; // min required for ground prep

  @Prop()
  baseAirport: string; // DEL, BOM etc.
}

export const AircraftSchema = SchemaFactory.createForClass(Aircraft);
