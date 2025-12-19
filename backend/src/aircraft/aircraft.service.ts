import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Aircraft } from './aircraft.schema';

@Injectable()
export class AircraftService {
  constructor(
    @InjectModel(Aircraft.name)
    private readonly aircraftModel: Model<Aircraft>,
  ) {}

  async create(data: any) {
    return this.aircraftModel.create(data);
  }

  async findAll() {
    return this.aircraftModel.find();
  }
}
