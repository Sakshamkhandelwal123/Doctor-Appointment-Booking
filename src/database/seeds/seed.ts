import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config/database.config';
import { initialSeed } from './initial.seed';

const dataSource = new DataSource(databaseConfig);

async function main() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    await initialSeed(dataSource);
    console.log('Seeding completed');

    await dataSource.destroy();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main();
