

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight, FlightDocument, FlightStatus } from './flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';
import { SchedulerService } from '../scheduler/scheduler.service';



@Injectable()
export class FlightsService {

  constructor(
    @InjectModel(Flight.name)
    private readonly flightModel: Model<FlightDocument>,
    private readonly schedulerService: SchedulerService,
  ) {}

  async create(dto: CreateFlightDto) {
    const departureTime = new Date(dto.departureTime);
    const arrivalTime = new Date(dto.arrivalTime);
    
    if (arrivalTime <= departureTime) {
      throw new BadRequestException(
        'Arrival time must be after departure time',
      );
    }

    const flight = await this.flightModel.create({
      ...dto,
      departureTime,
      arrivalTime,
    });

    // Event-driven scheduling
    await this.schedulerService.assignAircraftToFlights();

    return flight;
  }

  async findAll() {
    return this.flightModel.find().sort({ departureTime: 1 });
  }

  async findById(id: string) {
    return this.flightModel.findById(id);
  }

  async updateStatus(id: string, nextStatus: string) {
  const flight = await this.flightModel.findById(id);

  if (!flight) {
    throw new BadRequestException('Flight not found');
  }

  const allowedTransitions: Record<string, string[]> = {
    scheduled: ['in_air', 'cancelled'],
    in_air: ['landed'],
    landed: [],
    cancelled: [],
  };

  const currentStatus = flight.status;

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new BadRequestException(
      `Invalid transition from ${currentStatus} to ${nextStatus}`,
    );
  }

  const update: any = { status: nextStatus };

  if (nextStatus === FlightStatus.IN_AIR) {
    update.gateId = null;
  }
  if (nextStatus === FlightStatus.LANDED) {
    update.aircraftId = null;
  }

  const updatedFlight = await this.flightModel.findByIdAndUpdate(
    id,
    update,
    { new: true },
  );

  if (nextStatus === FlightStatus.LANDED) {
    await this.schedulerService.assignAircraftToFlights();
  }

  return updatedFlight;
}

}
