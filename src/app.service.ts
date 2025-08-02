import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello From Doctor Appointment Booking System!';
  }
}
