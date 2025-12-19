import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsModule } from './flights/flights.module';
import { AircraftModule } from './aircraft/aircraft.module';
import { AirportsModule } from './airports/airports.module';
import { CrewModule } from './crew/crew.module';
import { SchedulerModule } from './scheduler/scheduler.module';

import { MongooseModule } from '@nestjs/mongoose';
import { GatesModule } from './gates/gates.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/airlineDB'),
    FlightsModule, AircraftModule, AirportsModule, CrewModule, SchedulerModule, GatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
