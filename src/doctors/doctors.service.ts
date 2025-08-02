import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { Appointment } from '../appointments/entities/appointment.entity';

interface TimeSlot {
  utc: string;
  ist: string;
}

@Injectable()
export class DoctorsService {
  private readonly TIMEZONE_OFFSET_HOURS = 5;
  private readonly TIMEZONE_OFFSET_MINUTES = 30;

  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  private convertTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private convertISTtoUTC(hours: number, minutes: number): { hours: number; minutes: number } {
    let totalMinutes = hours * 60 + minutes;
    totalMinutes -= this.TIMEZONE_OFFSET_HOURS * 60 + this.TIMEZONE_OFFSET_MINUTES;
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    return {
      hours: Math.floor(totalMinutes / 60) % 24,
      minutes: totalMinutes % 60
    };
  }

  private convertToIST(date: Date): Date {
    return new Date(date.getTime() + (this.TIMEZONE_OFFSET_HOURS * 60 + this.TIMEZONE_OFFSET_MINUTES) * 60000);
  }

  async findAll(specialization?: string, page: number = 1, limit: number = 10) {
    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor');
    
    if (specialization) {
      queryBuilder.where('doctor.specialization = :specialization', { specialization });
    }

    const total = await queryBuilder.getCount();
    const doctors = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  private isSlotBooked(
    slotStart: Date,
    slotEnd: Date,
    appointments: Appointment[]
  ): boolean {
    const slotStartTime = slotStart.getTime();
    const slotEndTime = slotEnd.getTime();

    return appointments.some(appointment => {
      const appointmentStartTime = appointment.startTime.getTime();
      const appointmentEndTime = appointment.endTime.getTime();

      const isOverlapping = (
        (slotStartTime >= appointmentStartTime && slotStartTime < appointmentEndTime) ||
        (slotEndTime > appointmentStartTime && slotEndTime <= appointmentEndTime) ||
        (slotStartTime <= appointmentStartTime && slotEndTime >= appointmentEndTime)
      );

      if (isOverlapping) {
        console.log('Slot overlap found:', {
          slot: {
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            startIST: this.convertToIST(slotStart).toISOString(),
            endIST: this.convertToIST(slotEnd).toISOString()
          },
          appointment: {
            start: appointment.startTime.toISOString(),
            end: appointment.endTime.toISOString(),
            startIST: this.convertToIST(appointment.startTime).toISOString(),
            endIST: this.convertToIST(appointment.endTime).toISOString()
          }
        });
      }

      return isOverlapping;
    });
  }

  async getAvailableTimeSlots(doctorId: string, date: Date): Promise<TimeSlot[]> {
    const doctor = await this.findOne(doctorId);
    
    // Create date range for UTC query
    const startOfDayUTC = new Date(date);
    startOfDayUTC.setUTCHours(0, 0, 0, 0);

    const endOfDayUTC = new Date(date);
    endOfDayUTC.setUTCHours(23, 59, 59, 999);

    // Get all appointments for the doctor on the requested date
    const appointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        status: 'scheduled',
        startTime: Between(startOfDayUTC, endOfDayUTC),
      },
      order: { startTime: 'ASC' },
    });

    console.log('Date range:', {
      requestedDate: date.toISOString(),
      startOfDayUTC: startOfDayUTC.toISOString(),
      endOfDayUTC: endOfDayUTC.toISOString(),
      appointmentsFound: appointments.length
    });

    console.log('Booked appointments:', appointments.map(apt => ({
      startUTC: apt.startTime.toISOString(),
      endUTC: apt.endTime.toISOString(),
      startIST: this.convertToIST(apt.startTime).toISOString(),
      endIST: this.convertToIST(apt.endTime).toISOString()
    })));

    // Convert doctor's work hours to minutes
    const [workStartHour, workStartMinute] = doctor.workStartTime.split(':').map(Number);
    const [workEndHour, workEndMinute] = doctor.workEndTime.split(':').map(Number);

    const workStartMinutes = workStartHour * 60 + workStartMinute;
    const workEndMinutes = workEndHour * 60 + workEndMinute;

    const slots: TimeSlot[] = [];

    // Generate slots in IST first
    for (let minutes = workStartMinutes; minutes < workEndMinutes; minutes += doctor.slotDurationMinutes) {
      const istHour = Math.floor(minutes / 60);
      const istMinute = minutes % 60;

      // Convert IST to UTC
      const utc = this.convertISTtoUTC(istHour, istMinute);

      const slotStartUTC = new Date(date);
      slotStartUTC.setUTCHours(utc.hours, utc.minutes, 0, 0);
      const slotEndUTC = new Date(slotStartUTC.getTime() + doctor.slotDurationMinutes * 60000);

      console.log('Generating slot:', {
        ist: `${istHour}:${istMinute}`,
        utc: `${utc.hours}:${utc.minutes}`,
        slotStartUTC: slotStartUTC.toISOString(),
        slotEndUTC: slotEndUTC.toISOString()
      });

      if (!this.isSlotBooked(slotStartUTC, slotEndUTC, appointments)) {
        slots.push({
          utc: slotStartUTC.toISOString(),
          ist: this.convertToIST(slotStartUTC).toISOString()
        });
      }
    }

    console.log('Generated slots:', slots);

    return slots;
  }
}