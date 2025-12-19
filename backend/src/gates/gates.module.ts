import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gate, GateSchema } from './gate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gate.name, schema: GateSchema },
    ]),
  ],
  exports: [MongooseModule], // important for Scheduler
})
export class GatesModule {}
