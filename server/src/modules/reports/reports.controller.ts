import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { MediaAdapterService, MediaUploadKind } from '../../adapters/media.adapter';
import { getAdaptersHealthSummary } from '../../adapters/adapters.module';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES, getPublicConfig } from '../../config/business-rules';
import {
  ReportReasonType,
  ReportTargetType,
  UserRecord,
} from '../../database/types';

@Controller()
export class SystemAndReportsController {
  private readonly startedAt = Date.now();

  constructor(
    private readonly dataStore: DataStoreService,
    private readonly mediaAdapter: MediaAdapterService,
  ) {}

  @Public()
  @Get('config/public')
  getPublicBusinessConfig() {
    return getPublicConfig();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      version: '1.1.0',
      adapters: getAdaptersHealthSummary(),
    };
  }

  @Get('media/upload-signature')
  getUploadSignature(@Query('kind') kind?: string) {
    const validKind: MediaUploadKind =
      kind === 'moment' || kind === 'vaccine' ? kind : 'pet';
    return this.mediaAdapter.getUploadSignature(validKind);
  }

  @Post('reports')
  createReport(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      targetType: ReportTargetType;
      targetId: string;
      reason: ReportReasonType;
      detail?: string;
    },
  ) {
    if (!body?.targetType || !body?.targetId || !body?.reason) {
      throw new DomainException(
        'BAD_REQUEST',
        'Thiếu thông tin báo cáo vi phạm (targetType, targetId, reason).',
        HttpStatus.BAD_REQUEST,
      );
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.dataStore.reports.unshift({
      id: reportId,
      reporterUserId: user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      detail: body.detail || null,
      status: 'open',
      resolvedBy: null,
      createdAt: new Date().toISOString(),
    });

    const openReportsCount = this.dataStore.reports.filter(
      (r) =>
        r.targetType === body.targetType &&
        r.targetId === body.targetId &&
        r.status === 'open',
    ).length;

    // Tier 05 §4.7: Auto-hide content with >= 3 open reports
    if (openReportsCount >= BUSINESS_RULES.community.autoHideReportsThreshold) {
      if (body.targetType === 'moment') {
        const moment = this.dataStore.moments.find((m) => m.id === body.targetId);
        if (moment) moment.isHidden = true;
      } else if (body.targetType === 'pet') {
        const pet = this.dataStore.pets.find((p) => p.id === body.targetId);
        if (pet) pet.isHidden = true;
      } else if (body.targetType === 'club') {
        const club = this.dataStore.clubs.find((c) => c.id === body.targetId);
        if (club) club.isHidden = true;
      }
    }

    this.dataStore.save();
    return { reportId };
  }
}
