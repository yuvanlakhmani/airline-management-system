import { Body, Controller, Get, Post } from '@nestjs/common';
import { AircraftService } from './aircraft.service';
import { CreateAircraftDto } from './dto/create-aircraft.dto';

@Controller('aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @Post()
  create(@Body() dto: CreateAircraftDto) {
    return this.aircraftService.create(dto);
  }

  @Get()
  findAll() {
    return this.aircraftService.findAll();
  }
}
