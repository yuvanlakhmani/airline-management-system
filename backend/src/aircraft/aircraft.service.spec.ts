import { Test, TestingModule } from '@nestjs/testing';
import { AircraftService } from './aircraft.service';
import { getModelToken } from '@nestjs/mongoose';

describe('AircraftService', () => {
  let service: AircraftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AircraftService,
        {
          provide: getModelToken('Aircraft'),
          useValue: {}, // mock model
        },
      ],
    }).compile();

    service = module.get<AircraftService>(AircraftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
