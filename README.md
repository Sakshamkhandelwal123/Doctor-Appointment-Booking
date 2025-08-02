# Doctor Appointment Booking System

A NestJS-based backend system for managing doctor appointments with features like authentication, real-time slot management, and comprehensive API documentation.

## Features

- 👨‍⚕️ Doctor Management
- 📅 Appointment Scheduling
- 🔐 JWT Authentication
- 👥 Role-based Access Control
- 📚 Swagger API Documentation
- 📄 Pagination & Filtering
- 🎯 Input Validation
- 🌱 Database Seeding

## Tech Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger/OpenAPI

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm/yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd doctor-appointment-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=doctor_appointment_db
   JWT_SECRET=your-secret-key
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb doctor_appointment_db
   
   # Run the application (this will create tables due to synchronize: true)
   npm run start:dev
   
   # Seed the database with initial data
   npm run seed
   ```

5. **Start the Application**
   ```bash
   npm run start:dev
   ```

## API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api
```

## API Endpoints

### Auth
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login

### Doctors
- GET `/doctors` - List all doctors (with pagination & filtering)
- GET `/doctors/:id` - Get doctor details
- POST `/doctors` - Add new doctor
- GET `/doctors/:id/available-slots` - Get available slots for a doctor

### Appointments
- POST `/appointments` - Book an appointment
- GET `/appointments` - List all appointments
- GET `/appointments/:id` - Get appointment details
- PATCH `/appointments/:id/cancel` - Cancel an appointment

## Default Users

After running the seed script, you can use:
```
Admin User:
Email: admin@example.com
Password: admin123
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
