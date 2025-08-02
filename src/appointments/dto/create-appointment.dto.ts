import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: "Doctor's UUID",
  })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the patient' })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({
    example: 'patient@example.com',
    description: 'Email of the patient',
  })
  @IsEmail()
  @IsNotEmpty()
  patientEmail: string;

  @ApiProperty({
    example: '2024-03-20T10:00:00Z',
    description: 'Appointment start time',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    required: false,
    example: 'First time visit',
    description: 'Additional notes for the appointment',
  })
  @IsString()
  notes?: string;
}
