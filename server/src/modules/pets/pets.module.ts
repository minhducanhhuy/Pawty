import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { RemindersController } from './reminders.controller';

@Module({
  controllers: [PetsController, RemindersController],
})
export class PetsModule {}
