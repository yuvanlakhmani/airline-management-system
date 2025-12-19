export class CreateAircraftDto {
  regNumber: string;
  type: string;
  capacity?: number;
  turnaroundMin?: number;
  baseAirport: string;
}
