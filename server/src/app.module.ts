import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AdaptersModule } from './adapters/adapters.module';
import { BadgesModule } from './modules/badges/badges.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PetsModule } from './modules/pets/pets.module';
import { RadarModule } from './modules/radar/radar.module';
import { WalksModule } from './modules/walks/walks.module';
import { MomentsModule } from './modules/moments/moments.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PlacesModule } from './modules/places/places.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { EventsModule } from './modules/events/events.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SosModule } from './modules/sos/sos.module';
import { AdsModule } from './modules/ads/ads.module';
import { PartnersModule } from './modules/partners/partners.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JobsModule } from './jobs/jobs.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    DatabaseModule,
    AdaptersModule,
    BadgesModule,
    ReferralsModule,
    AuthModule,
    UsersModule,
    PetsModule,
    RadarModule,
    WalksModule,
    MomentsModule,
    ChatModule,
    AppointmentsModule,
    PlacesModule,
    ClubsModule,
    EventsModule,
    NotificationsModule,
    PaymentsModule,
    SosModule,
    AdsModule,
    PartnersModule,
    AdminModule,
    ReportsModule,
    JobsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
