import { Controller, Post, Query } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('assign-aircraft')
  async assignAircraftToFlights(
    @Query('simulate')simulate ?: string) {

    const isSimulation = simulate === 'true';

    const result = await this.schedulerService.assignAircraftToFlights(isSimulation);

    return result;
  }
}
