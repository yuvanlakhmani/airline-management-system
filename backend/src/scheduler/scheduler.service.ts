import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Aircraft } from '../aircraft/aircraft.schema';
import { Flight, FlightDocument, FlightStatus } from '../flights/flight.schema';

import { Gate } from '../gates/gate.schema';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectModel(Flight.name)
    private readonly flightModel: Model<FlightDocument>,

    @InjectModel(Aircraft.name)
    private readonly aircraftModel: Model<Aircraft>,

    @InjectModel(Gate.name)
    private readonly gateModel: Model<Gate>,
  ) {}

  /**
   * MAIN ORCHESTRATOR
   * ------------------
   * This function:
   * 1. Fetches schedulable flights
   * 2. Computes aircraft availability & location
   * 3. Computes gate availability per airport
   * 4. Assigns aircraft + gates
   * 5. Optionally persists results (unless simulate = true)
   * 6. Returns a detailed scheduling report
   */
  async assignAircraftToFlights(simulate = false) {

    // =========================
    // LOG / REPORT VARIABLES
    // =========================
    const assignments: {
      flightNumber: string;
      aircraftId: string;
      gateId: string;
    }[] = [];

    const conflicts: {
      flightNumber: string;
      reason: string;
    }[] = [];

    // =========================
    // FETCH FLIGHTS TO SCHEDULE
    // =========================
    // Only SCHEDULED flights with no aircraft assigned
    const flights = await this.flightModel
      .find({ aircraftId: null, status: FlightStatus.SCHEDULED })
      .sort({ departureTime: 1 });

    if (flights.length === 0) {
      return {
      totalFlights: 0,
      assignedFlights: 0,
      unassignedFlights: 0,
      conflicts: [],
      assignments: [],
    };
  }

    // =========================
    // FETCH STATIC DATA
    // =========================
    const aircraftList = await this.aircraftModel.find();
    const gates = await this.gateModel.find();

    // =========================
    // PRECOMPUTED MAPS
    // =========================
    const aircraftAvailability = this.buildAircraftAvailabilityMap(aircraftList);
    const aircraftLocation = await this.buildAircraftLocationMap(aircraftList);
    const gateAvailability = this.buildGateAvailabilityMap(gates);

    const updates: Promise<any>[] = [];
    const GATE_BUFFER_MS = 30 * 60 * 1000;

    // =========================
    // CORE SCHEDULING LOOP
    // =========================
    for (const flight of flights) {

      // -------------------------
      // 1️⃣ AIRCRAFT ASSIGNMENT
      // -------------------------
      const aircraftId = this.assignAircraftToFlight(
        flight,
        aircraftList,
        aircraftAvailability,
        aircraftLocation,
      );

      if (!aircraftId) {
        conflicts.push({
          flightNumber: flight.flightNumber,
          reason: 'No aircraft available at origin airport at departure time',
        });
        continue;
      }

      // -------------------------
      // 2️⃣ GATE ASSIGNMENT
      // -------------------------
      const gateId = this.assignGateToFlight(
        flight,
        gates,
        gateAvailability,
        GATE_BUFFER_MS,
      );

      if (!gateId) {
        conflicts.push({
          flightNumber: flight.flightNumber,
          reason: 'No gate available at departure airport',
        });
        continue;
      }

      // -------------------------
      // 3️⃣ APPLY ASSIGNMENTS
      // -------------------------
      flight.aircraftId = aircraftId;
      flight.gateId = gateId;

      assignments.push({
        flightNumber: flight.flightNumber,
        aircraftId,
        gateId,
      });

      // Persist later (bulk write)
      if (!simulate) {
        updates.push(
          this.flightModel.updateOne(
            { _id: flight._id },
            { $set: { aircraftId, gateId } },
          ),
        );
      }
    }

    // =========================
    // DATABASE WRITE (BULK)
    // =========================
    if (!simulate && updates.length > 0) {
      await Promise.all(updates);
    }

    // =========================
    // FINAL REPORT
    // =========================
    return {
      totalFlights: flights.length,
      assignedFlights: assignments.length,
      unassignedFlights: conflicts.length,
      conflicts,
      assignments,
    };
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  /**
   * Builds initial aircraft availability map.
   * All aircraft start as available at time = epoch (0).
   */
  private buildAircraftAvailabilityMap(aircraftList: Aircraft[]) {
    const availability = new Map<string, Date>();

    for (const aircraft of aircraftList) {
      availability.set(aircraft._id.toString(), new Date(0));
    }

    return availability;
  }

  /**
   * Determines current location of each aircraft.
   * If aircraft has a LANDED flight → destination of latest one.
   * Else → baseAirport.
   */
  private async buildAircraftLocationMap(aircraftList: Aircraft[]) {
    const locationMap = new Map<string, string>();

    for (const aircraft of aircraftList) {
      const lastLandedFlight = await this.flightModel
        .findOne({
          aircraftId: aircraft._id.toString(),
          status: FlightStatus.LANDED,
        })
        .sort({ arrivalTime: -1 });

      locationMap.set(
        aircraft._id.toString(),
        lastLandedFlight
          ? lastLandedFlight.destination
          : aircraft.baseAirport,
      );
    }

    return locationMap;
  }

  /**
   * Builds gate availability map.
   * Key format: AIRPORT:GATE_ID
   */
  private buildGateAvailabilityMap(gates: Gate[]) {
    const gateAvailability = new Map<string, Date>();

    for (const gate of gates) {
      gateAvailability.set(
        `${gate.airport}:${gate._id.toString()}`,
        new Date(0),
      );
    }

    return gateAvailability;
  }

  /**
   * Attempts to assign an aircraft to a flight.
   * Checks:
   * - aircraft is at flight origin
   * - aircraft is available before departure
   * Updates:
   * - aircraft availability
   * - aircraft location
   */
  private assignAircraftToFlight(
    flight: FlightDocument,
    aircraftList: Aircraft[],
    availability: Map<string, Date>,
    locationMap: Map<string, string>,
  ): string | null {

    for (const aircraft of aircraftList) {
      const aircraftId = aircraft._id.toString();

      if (locationMap.get(aircraftId) !== flight.origin) continue;
      if (availability.get(aircraftId)! > flight.departureTime) continue;

      const turnaroundMs = (aircraft.turnaroundMin ?? 45) * 60 * 1000;

      availability.set(
        aircraftId,
        new Date(flight.arrivalTime.getTime() + turnaroundMs),
      );

      locationMap.set(aircraftId, flight.destination);

      return aircraftId;
    }

    return null;
  }

  /**
   * Attempts to assign a gate at the flight's origin airport.
   * Gate is occupied from (departure - buffer) → departure.
   */
  private assignGateToFlight(
    flight: FlightDocument,
    gates: Gate[],
    gateAvailability: Map<string, Date>,
    bufferMs: number,
  ): string | null {

    const gateStartTime = new Date(
      flight.departureTime.getTime() - bufferMs,
    );

    for (const gate of gates) {
      if (gate.airport !== flight.origin) continue;

      const key = `${gate.airport}:${gate._id.toString()}`;

      if (gateAvailability.get(key)! > gateStartTime) continue;

      gateAvailability.set(key, flight.departureTime);
      return gate._id.toString();
    }

    return null;
  }
}
