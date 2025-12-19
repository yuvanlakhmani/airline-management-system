# ✈️  𝘼𝙞𝙧𝙡𝙞𝙣𝙚 𝙈𝙖𝙣𝙖𝙜𝙚𝙢𝙚𝙣𝙩 𝙎𝙮𝙨𝙩𝙚𝙢 

A production-grade Airline Operations Management System designed to model real-world airline scheduling, aircraft utilization, and airport operations.

This project focuses on **correct system design**, **data integrity**, and **operational realism**, rather than being a simple CRUD demo.

---

## 🚀 Features Implemented (Backend)

### Core Modules
- Airports (codes, cities, timezones)
- Gates (airport-specific, availability tracking)
- Aircraft (base airport, turnaround logic)
- Flights (status lifecycle, scheduling)
- Scheduler Engine
  - Automatic aircraft assignment
  - Gate allocation
  - Conflict detection with explanations
  - Simulation mode (no DB writes)

### Scheduling Capabilities
- Aircraft location tracking across flights
- Turnaround time enforcement
- Gate buffer handling
- Chronological scheduling
- Conflict explanations (why a flight couldn’t be scheduled)

### Engineering Quality
- NestJS modular architecture
- MongoDB with Mongoose schemas
- DTO-based validation
- Unit & service-level testing
- Seed scripts for realistic data
- Clean separation of concerns

---

## 🧠 System Design Philosophy

This project is designed to reflect **real airline operations**, including:
- Resource constraints (aircraft, gates)
- Time-based dependencies
- Operational conflicts
- Future extensibility for crew, maintenance, and pricing

The goal is correctness, clarity, and scalability.

---

## 🧪 Testing

```bash
npm run test
