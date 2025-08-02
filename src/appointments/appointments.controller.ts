import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Book an appointment' })
  @ApiResponse({ 
    status: 201, 
    description: 'Appointment booked successfully',
    type: Appointment
  })
  @ApiResponse({ status: 400, description: 'Invalid appointment time or slot already booked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    this.logger.debug(`Creating appointment: ${JSON.stringify(createAppointmentDto)}`);
    return this.appointmentsService.create(createAppointmentDto);
  }
}