import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Doctor } from '../doctors/entities/doctor.entity';

@Injectable()
export class AppointmentsService {
  private readonly TIMEZONE_OFFSET_HOURS = 5;
  private readonly TIMEZONE_OFFSET_MINUTES = 30;

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  private convertTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private convertUTCToLocal(date: Date): Date {
    const localDate = new Date(date);
    localDate.setHours(date.getUTCHours() + this.TIMEZONE_OFFSET_HOURS);
    localDate.setMinutes(date.getUTCMinutes() + this.TIMEZONE_OFFSET_MINUTES);
    return localDate;
  }

  private formatTime(hours: number, minutes: number): string {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: createAppointmentDto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Parse the start time and calculate end time in UTC
    const startTimeUTC = new Date(createAppointmentDto.startTime);
    const endTimeUTC = new Date(startTimeUTC.getTime() + doctor.slotDurationMinutes * 60000);

    // Convert UTC to local time (IST) for validation
    const startTimeLocal = this.convertUTCToLocal(startTimeUTC);
    const endTimeLocal = this.convertUTCToLocal(endTimeUTC);

    // Get hours and minutes in local time
    const appointmentStartHour = startTimeLocal.getHours();
    const appointmentStartMinute = startTimeLocal.getMinutes();
    const appointmentEndHour = endTimeLocal.getHours();
    const appointmentEndMinute = endTimeLocal.getMinutes();

    // Format times for display
    const appointmentStartFormatted = this.formatTime(appointmentStartHour, appointmentStartMinute);
    const appointmentEndFormatted = this.formatTime(appointmentEndHour, appointmentEndMinute);

    // Convert all times to minutes for comparison
    const appointmentStartInMinutes = appointmentStartHour * 60 + appointmentStartMinute;
    const appointmentEndInMinutes = appointmentEndHour * 60 + appointmentEndMinute;
    const workStartInMinutes = this.convertTimeToMinutes(doctor.workStartTime);
    const workEndInMinutes = this.convertTimeToMinutes(doctor.workEndTime);

    console.log('Time validation:', {
      utcStartTime: startTimeUTC.toISOString(),
      utcEndTime: endTimeUTC.toISOString(),
      localStartTime: appointmentStartFormatted,
      localEndTime: appointmentEndFormatted,
      workStartTime: doctor.workStartTime,
      workEndTime: doctor.workEndTime,
      appointmentStartInMinutes,
      appointmentEndInMinutes,
      workStartInMinutes,
      workEndInMinutes
    });

    // Check if the appointment times are within working hours
    if (appointmentStartInMinutes < workStartInMinutes) {
      throw new BadRequestException(
        `Appointment would start at ${appointmentStartFormatted} IST, ` +
        `which is before working hours (${doctor.workStartTime})`
      );
    }

    if (appointmentEndInMinutes > workEndInMinutes) {
      throw new BadRequestException(
        `Appointment would end at ${appointmentEndFormatted} IST, ` +
        `which is after closing time (${doctor.workEndTime}). ` +
        `Please book a slot that ends at or before ${doctor.workEndTime}.`
      );
    }

    // Check for existing appointment in the exact same time slot
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorId: doctor.id,
        status: 'scheduled',
        startTime: startTimeUTC,
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Validate slot alignment
    const minutesSinceWorkStart = appointmentStartInMinutes - workStartInMinutes;
    if (minutesSinceWorkStart % doctor.slotDurationMinutes !== 0) {
      throw new BadRequestException(
        `Invalid slot time. Appointments must start at ${doctor.slotDurationMinutes}-minute intervals from ${doctor.workStartTime}`
      );
    }

    // Check for patient's existing appointment at the same time
    const patientConflict = await this.appointmentRepository.findOne({
      where: {
        patientEmail: createAppointmentDto.patientEmail,
        status: 'scheduled',
        startTime: startTimeUTC,
      },
    });

    if (patientConflict) {
      throw new BadRequestException('You already have an appointment scheduled at this time');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      status: 'scheduled',
    });

    return await this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ['doctor'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    if (appointment.status === 'cancelled') {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.startTime <= new Date()) {
      throw new BadRequestException('Cannot cancel past or ongoing appointments');
    }

    appointment.status = 'cancelled';
    return await this.appointmentRepository.save(appointment);
  }
}