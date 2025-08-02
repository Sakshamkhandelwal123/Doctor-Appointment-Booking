import { DataSource } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { User } from '../../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const initialSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const doctorRepository = dataSource.getRepository(Doctor);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = userRepository.create({
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });
  await userRepository.save(adminUser);

  // Create sample doctors
  const doctors = [
    {
      name: 'Dr. John Smith',
      specialization: 'Cardiologist',
      qualification: 'MD, FACC',
      description: 'Experienced cardiologist with 15 years of practice',
      workStartTime: '09:00',
      workEndTime: '17:00',
      slotDurationMinutes: 30,
    },
    {
      name: 'Dr. Sarah Johnson',
      specialization: 'Pediatrician',
      qualification: 'MD, FAAP',
      description: 'Specialized in child healthcare with 10 years experience',
      workStartTime: '08:00',
      workEndTime: '16:00',
      slotDurationMinutes: 45,
    },
  ];

  for (const doctorData of doctors) {
    const doctor = doctorRepository.create(doctorData);
    await doctorRepository.save(doctor);
  }
};
