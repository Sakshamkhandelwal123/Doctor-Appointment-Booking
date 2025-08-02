import { Controller, Get, Param, Query, ParseUUIDPipe, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { FindDoctorsDto } from './dto/find-doctors.dto';
import { Doctor } from './entities/doctor.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimeSlot } from '../common/interfaces/time-slot.interface';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  private readonly logger = new Logger(DoctorsController.name);

  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all doctors with pagination and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated list of doctors',
    type: Doctor,
    isArray: true
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'specialization', required: false, type: String, description: 'Filter by specialization' })
  async findAll(@Query() findDoctorsDto: FindDoctorsDto) {
    this.logger.debug(`Finding doctors with filters: ${JSON.stringify(findDoctorsDto)}`);
    return this.doctorsService.findAll(findDoctorsDto.specialization, findDoctorsDto.page, findDoctorsDto.limit);
  }

  @Get(':id/available-slots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available slots for a doctor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns available time slots in both UTC and IST',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          utc: { type: 'string', format: 'date-time', example: '2024-03-20T03:30:00.000Z' },
          ist: { type: 'string', format: 'date-time', example: '2024-03-20T09:00:00.000Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  @ApiQuery({ 
    name: 'date', 
    required: true, 
    type: String, 
    description: 'Date in YYYY-MM-DD format',
    example: '2024-03-20'
  })
  async getAvailableTimeSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date: string,
  ): Promise<TimeSlot[]> {
    this.logger.debug(`Getting available slots for doctor ${id} on date ${date}`);
    return this.doctorsService.getAvailableTimeSlots(id, new Date(date));
  }
}