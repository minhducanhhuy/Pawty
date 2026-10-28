import { Module } from '@nestjs/common';
import { SystemAndReportsController } from './reports.controller';

@Module({
  controllers: [SystemAndReportsController],
})
export class ReportsModule {}
