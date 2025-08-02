import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { Doctor } from './entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Appointment])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
