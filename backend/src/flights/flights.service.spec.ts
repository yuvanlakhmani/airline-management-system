import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from './flights.service';
import { getModelToken } from '@nestjs/mongoose';
import { SchedulerService } from '../scheduler/scheduler.service';

describe('FlightsService', () => {
  let service: FlightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        {
          provide: getModelToken('Flight'),
          useValue: {}, // mock flight model
        },
        {
          provide: SchedulerService,
          useValue: {
            assignAircraftToFlights: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
