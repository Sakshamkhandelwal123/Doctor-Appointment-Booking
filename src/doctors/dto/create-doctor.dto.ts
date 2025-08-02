import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({
    example: 'Dr. John Smith',
    description: 'The name of the doctor',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Cardiologist',
    description: "Doctor's specialization",
  })
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @ApiProperty({ example: 'MD, FACC', description: "Doctor's qualifications" })
  @IsString()
  qualification: string;

  @ApiProperty({
    example: 'Experienced cardiologist with 15 years of practice',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '09:00',
    description: 'Work start time in HH:MM format',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Work start time must be in HH:MM format',
  })
  workStartTime: string;

  @ApiProperty({
    example: '17:00',
    description: 'Work end time in HH:MM format',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Work end time must be in HH:MM format',
  })
  workEndTime: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of each appointment slot in minutes',
  })
  @IsInt()
  @Min(15)
  @Max(120)
  slotDurationMinutes: number;
}
