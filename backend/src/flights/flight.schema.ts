import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightDocument = Flight & Document;

export enum FlightStatus {
  SCHEDULED = 'scheduled',
  DELAYED = 'delayed',
  IN_AIR = 'in_air',
  LANDED = 'landed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Flight {

  @Prop({ required: true })
  flightNumber: string; // AI101

  @Prop({ required: true })
  origin: string; // DEL

  @Prop({ required: true })
  destination: string; // BOM

  @Prop({ required: true })
  departureTime: Date;

  @Prop({ required: true })
  arrivalTime: Date;

  // Aircraft will be assigned later by scheduler
  @Prop({ type: String, default: null })
  aircraftId: string | null;


  @Prop({ enum: FlightStatus, default: FlightStatus.SCHEDULED })
  status: FlightStatus;

  @Prop({ default: 0 })
  estimatedDelayMinutes: number;

  @Prop({ type: String, default: null })
  gateId: string | null;
}


export const FlightSchema = SchemaFactory.createForClass(Flight);
