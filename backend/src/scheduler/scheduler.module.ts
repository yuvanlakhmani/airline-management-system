import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { Flight, FlightSchema } from 'src/flights/flight.schema';
import { Aircraft, AircraftSchema } from 'src/aircraft/aircraft.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flight.name, schema: FlightSchema },
      { name: Aircraft.name, schema: AircraftSchema },
    ]),
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}
