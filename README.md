# Doctor Appointment Booking System

A NestJS-based backend system for managing doctor appointments with features like authentication, real-time slot management, and comprehensive API documentation.

## Features

- 👨‍⚕️ Doctor Management & Slot Availability
- 📅 Appointment Scheduling
- 🔐 JWT Authentication
- 📚 Swagger API Documentation
- 📄 Pagination & Filtering
- 🎯 Input Validation
- 🌍 UTC & IST Time Handling

## Tech Stack

- NestJS (TypeScript)
- PostgreSQL with TypeORM
- JWT Authentication
- Swagger/OpenAPI
- Class Validator & Transformer

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm/yarn

## Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd doctor-appointment-booking
   npm install
   ```

2. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=doctor_appointment_db

   # JWT Configuration
   JWT_SECRET=your-secret-key

   # Optional
   PORT=3000
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb doctor_appointment_db
   
   # Start the application (tables will be auto-created)
   npm run start:dev
   
   # Seed initial data (optional)
   npm run seed
   ```

## API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT token)

#### Doctors
- `GET /doctors` - List all doctors (with pagination & filtering)
  - Query params: `page`, `limit`, `specialization`
- `GET /doctors/:id/available-slots` - Get available slots for a doctor
  - Query params: `date` (YYYY-MM-DD)
  - Returns both UTC and IST times

#### Appointments
- `POST /appointments` - Book an appointment (requires authentication)
  - Validates slot availability
  - Prevents double booking
  - Handles timezone conversion

### Time Slots Format

Available slots are returned in both UTC and IST:
```json
[
  {
    "utc": "2024-03-20T03:30:00.000Z",
    "ist": "2024-03-20T09:00:00.000Z"
  }
]
```

## Business Rules

- ✅ No double-booking for doctors
- ✅ No overlapping appointments
- ✅ Working hours validation (9:00 AM to 5:00 PM IST)
- ✅ Proper timezone handling (UTC ↔ IST)
- ✅ 30-minute slot duration
- ✅ Authentication required for booking

## Development

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid time slots
- Double bookings
- Authentication failures
- Resource not found
- Validation errors
