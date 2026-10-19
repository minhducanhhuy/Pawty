import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PetsModule } from './modules/pets/pets.module';
import { RadarModule } from './modules/radar/radar.module';
import { MomentsModule } from './modules/moments/moments.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    PetsModule,
    RadarModule,
    MomentsModule,
    AppointmentsModule,
    ChatModule,
    PaymentsModule,
  ],
})
export class AppModule {}
