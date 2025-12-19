import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SchedulerService } from './scheduler.service';
import { FlightStatus } from '../flights/flight.schema';

describe('SchedulerService', () => {
  let service: SchedulerService;

  const mockFlightModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    bulkWrite: jest.fn(),
  };

  const mockAircraftModel = {
    find: jest.fn(),
  };

  const mockGateModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: getModelToken('Flight'), useValue: mockFlightModel },
        { provide: getModelToken('Aircraft'), useValue: mockAircraftModel },
        { provide: getModelToken('Gate'), useValue: mockGateModel },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    jest.clearAllMocks();
  });

  it('assigns aircraft and gate when available', async () => {
    // 🔹 Mock chained Mongo query: find().sort()
    mockFlightModel.find.mockImplementation((query) => {
      // Scheduled flights query
      if (query?.status === FlightStatus.SCHEDULED) {
        return {
          sort: jest.fn().mockResolvedValue([
            {
              _id: 'f1',
              flightNumber: 'AI101',
              origin: 'DEL',
              destination: 'BOM',
              departureTime: new Date('2025-01-01T10:00:00Z'),
              arrivalTime: new Date('2025-01-01T12:00:00Z'),
              status: FlightStatus.SCHEDULED,
              aircraftId: null,
            },
          ]),
        };
      }

      // Landed flights query (used for aircraft location)
      if (query?.status === 'landed') {
        return {
          sort: jest.fn().mockResolvedValue([]),
        };
      }

      return {
        sort: jest.fn().mockResolvedValue([]),
      };
    });

    mockFlightModel.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });

    mockAircraftModel.find.mockResolvedValue([
      {
        _id: 'a1',
        baseAirport: 'DEL',
        turnaroundMin: 45,
      },
    ]);

    mockGateModel.find.mockResolvedValue([
      {
        _id: 'g1',
        airport: 'DEL',
        gateNumber: 'G1',
      },
    ]);

    const result = await service.assignAircraftToFlights(true);

    expect(result.assignedFlights).toBe(1);
    expect(result.unassignedFlights).toBe(0);
  });
});
