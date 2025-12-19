import { Module } from '@nestjs/common';
import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Aircraft, AircraftSchema } from './aircraft.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Aircraft.name, schema: AircraftSchema },
    ]),
  ],
  controllers: [AircraftController],
  providers: [AircraftService]
})
export class AircraftModule {}
