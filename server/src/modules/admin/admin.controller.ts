import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { PushAdapterService } from '../../adapters/push.adapter';
import { BadgesService } from '../badges/badges.service';
import { ReferralsService } from '../referrals/referrals.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import {
  AdStatusType,
  PartnerStatusType,
  ReportStatusType,
  UserRecord,
  UserRoleType,
} from '../../database/types';
import { VipTierType } from '../../config/business-rules';

@Controller('admin')
@Roles('admin', 'moderator')
export class AdminController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly pushAdapter: PushAdapterService,
    private readonly badgesService: BadgesService,
    private readonly referralsService: ReferralsService,
  ) {}

  @Get('kpi')
  getKpiDashboard() {
    const now = new Date();
    const todayPrefix = now.toISOString().slice(0, 10);

    const activeUsers = this.dataStore.users.filter((u) => !u.isDeleted);
    const totalUsers = activeUsers.length;
    const dau = Math.max(1, Math.round(totalUsers * 0.65));
    const mau = totalUsers;

    const newPetsToday = this.dataStore.pets.filter((p) =>
      p.createdAt.startsWith(todayPrefix),
    ).length;

    const matchesToday = this.dataStore.matches.filter(
      (m) => m.status === 'matched' && !m.isUndone,
    ).length;

    const appointmentsCreated = this.dataStore.appointments.length;
    const appointmentsCompleted = this.dataStore.appointments.filter(
      (a) => a.status === 'completed',
    ).length;
    const flakeCount = this.dataStore.appointments.filter(
      (a) => a.status === 'reported_flake',
    ).length;
    const flakeRate =
      appointmentsCreated > 0
        ? Number(((flakeCount / appointmentsCreated) * 100).toFixed(1))
        : 0;

    const paidTxs = this.dataStore.transactions.filter(
      (t) => t.status === 'paid',
    );
    const sosRevenue = paidTxs
      .filter((t) => t.type === 'sos')
      .reduce((acc, t) => acc + t.amountVnd, 0);
    const vipRevenue = paidTxs
      .filter(
        (t) =>
          t.type === 'vip_month' ||
          t.type === 'vip_year' ||
          t.type === 'vip_plus_month',
      )
      .reduce((acc, t) => acc + t.amountVnd, 0);
    const iapRevenue = paidTxs
      .filter(
        (t) =>
          t.type === 'boost' ||
          t.type === 'boost_pack' ||
          t.type === 'super_like_pack',
      )
      .reduce((acc, t) => acc + t.amountVnd, 0);
    const adsRevenue =
      paidTxs
        .filter((t) => t.type === 'partner_topup')
        .reduce((acc, t) => acc + t.amountVnd, 0) +
      this.dataStore.nativeAds.reduce(
        (acc, ad) =>
          acc +
          (ad.clicks + ad.vouchersIssued) *
            BUSINESS_RULES.adsAndVouchers.cpcCostVnd,
        0,
      );

    const openReportsCount = this.dataStore.reports.filter(
      (r) => r.status === 'open',
    ).length;
    const pendingVaccinesCount = this.dataStore.pets.filter(
      (p) => p.vaccineStatus === 'pending',
    ).length;
    const pendingPartnersCount = this.dataStore.partners.filter(
      (p) => p.status === 'pending',
    ).length;

    const series14Days = Array.from({ length: 14 }, (_, idx) => {
      const day = new Date(
        now.getTime() - (13 - idx) * 24 * 60 * 60 * 1000,
      );
      const dateStr = day.toISOString().slice(0, 10);
      return {
        date: dateStr,
        dau: Math.max(3, Math.min(totalUsers, 5 + (idx % 6))),
        matches: 2 + (idx % 5),
        completedWalks: 1 + (idx % 4),
        revenueVnd: (idx + 1) * 39000,
      };
    });

    return {
      dau,
      mau,
      totalUsers,
      totalPets: this.dataStore.pets.length,
      newPetsToday,
      matchesToday,
      appointmentsCreated,
      appointmentsCompleted,
      northStarCompletedWalksThisWeek: appointmentsCompleted,
      flakeRate,
      revenueBySource: {
        sos: sosRevenue,
        vip: vipRevenue,
        iap: iapRevenue,
        ads: adsRevenue,
        total: sosRevenue + vipRevenue + iapRevenue + adsRevenue,
      },
      openReportsCount,
      pendingVaccinesCount,
      pendingPartnersCount,
      series14Days,
    };
  }

  @Get('users')
  getUsers(
    @Query('q') q?: string,
    @Query('role') role?: UserRoleType,
    @Query('vipTier') vipTier?: VipTierType,
    @Query('isBanned') isBanned?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const qLower = q?.trim().toLowerCase();
    const list = this.dataStore.users.filter((u) => {
      if (role && u.role !== role) return false;
      if (vipTier && u.vipTier !== vipTier) return false;
      if (isBanned === 'true' && !u.isBannedSwiping) return false;
      if (isBanned === 'false' && u.isBannedSwiping) return false;
      if (qLower) {
        const hay = `${u.fullName} ${u.nickname || ''} ${u.phone} ${u.email || ''} ${u.condoComplex}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      return true;
    });

    return this.dataStore.paginate(list, page, limit);
  }

  @Patch('users/:id')
  updateUserByAdmin(
    @CurrentUser() actor: UserRecord,
    @Param('id') id: string,
    @Body()
    body: {
      isBannedSwiping?: boolean;
      banUntil?: string | null;
      role?: UserRoleType;
      vipTier?: VipTierType;
      vipDays?: number;
      isVerified?: boolean;
    },
  ) {
    const target = this.dataStore.users.find((u) => u.id === id);
    if (!target) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy người dùng.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.role !== undefined && body.role !== target.role) {
      if (actor.role !== 'admin') {
        throw new DomainException(
          'FORBIDDEN',
          'Chỉ Quản trị viên tối cao (admin) mới có quyền thay đổi vai trò (role).',
          HttpStatus.FORBIDDEN,
        );
      }
      target.role = body.role;
    }

    if (typeof body.isBannedSwiping === 'boolean') {
      target.isBannedSwiping = body.isBannedSwiping;
      if (!body.isBannedSwiping) {
        target.banUntil = null;
        target.flakeReportsCount = 0;
      } else if (body.banUntil) {
        target.banUntil = body.banUntil;
      } else {
        target.banUntil = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }
    }

    if (body.vipTier !== undefined) {
      target.vipTier = body.vipTier;
      target.isVip = body.vipTier !== 'free';
      if (body.vipTier === 'free') {
        target.vipExpiresAt = null;
      } else {
        this.referralsService.extendVipDays(target, body.vipDays || 30);
      }
    } else if (typeof body.vipDays === 'number' && body.vipDays > 0) {
      this.referralsService.extendVipDays(target, body.vipDays);
    }

    if (typeof body.isVerified === 'boolean') {
      target.isVerified = body.isVerified;
    }

    target.updatedAt = new Date().toISOString();
    this.dataStore.logAudit(actor.id, 'ADMIN_USER_UPDATED', 'user', target.id, {
      changes: body,
    });

    return target;
  }

  @Get('vaccine-queue')
  getVaccineQueue(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filterStatus = status || 'pending';
    const list = this.dataStore.pets.filter((p) =>
      filterStatus === 'all' ? true : p.vaccineStatus === filterStatus,
    );
    return this.dataStore.paginate(list, page, limit);
  }

  @Post('pets/:id/vaccine-decision')
  @HttpCode(HttpStatus.OK)
  async decideVaccineProof(
    @CurrentUser() actor: UserRecord,
    @Param('id') petId: string,
    @Body()
    body: {
      decision: 'verified' | 'rejected';
      nextDueDate?: string;
      reason?: string;
    },
  ) {
    const pet = this.dataStore.pets.find((p) => p.id === petId);
    if (!pet) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy hồ sơ Boss.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (body?.decision !== 'verified' && body?.decision !== 'rejected') {
      throw new DomainException(
        'BAD_REQUEST',
        'Quyết định duyệt sổ tiêm phải là verified hoặc rejected.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.decision === 'verified') {
      const defaultDue = new Date(
        Date.now() +
          BUSINESS_RULES.vaccine.defaultValidityDays * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .slice(0, 10);
      const nextDueDate = body.nextDueDate || pet.vaccineNextDueDate || defaultDue;

      pet.vaccineStatus = 'verified';
      pet.isSafePet = true;
      pet.vaccineNextDueDate = nextDueDate;
      pet.vaccineRejectReason = null;

      this.dataStore.reminders.push({
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        petId: pet.id,
        kind: 'vaccine',
        title: `Tái chủng định kỳ cho ${pet.name}`,
        dueDate: nextDueDate,
        isDone: false,
        lastNotifiedOffset: null,
      });

      this.dataStore.logAudit(
        actor.id,
        'VACCINE_VERIFIED',
        'pet',
        pet.id,
        { nextDueDate },
      );

      await this.badgesService.checkAndAwardBadges(pet.userId);
      await this.pushAdapter.sendPush(pet.userId, {
        type: 'reminder',
        title: `🛡️ Sổ tiêm của ${pet.name} đã được duyệt Safe Pet!`,
        body: `Chúc mừng! ${pet.name} đã nhận huy hiệu Safe Pet chuẩn xanh. Hạn tái chủng kế tiếp: ${nextDueDate}.`,
        payload: { petId: pet.id, vaccineStatus: 'verified' },
      });
    } else {
      const reason =
        body.reason || 'Ảnh chụp sổ tiêm chưa rõ ngày tiêm hoặc con dấu phòng khám.';
      pet.vaccineStatus = 'rejected';
      pet.isSafePet = false;
      pet.vaccineRejectReason = reason;

      this.dataStore.logAudit(
        actor.id,
        'VACCINE_REJECTED',
        'pet',
        pet.id,
        { reason },
      );

      await this.pushAdapter.sendPush(pet.userId, {
        type: 'system',
        title: `⚠️ Sổ tiêm của ${pet.name} cần bổ sung lại`,
        body: `Lý do: ${reason}. Vui lòng chụp lại sổ tiêm rõ nét hơn nhé!`,
        payload: { petId: pet.id, vaccineStatus: 'rejected', reason },
      });
    }

    this.dataStore.save();
    return pet;
  }

  @Get('reports')
  getReports(
    @Query('status') status?: ReportStatusType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const list = this.dataStore.reports.filter((r) =>
      status ? r.status === status : true,
    );
    return this.dataStore.paginate(list, page, limit);
  }

  @Patch('reports/:id')
  async resolveReport(
    @CurrentUser() actor: UserRecord,
    @Param('id') id: string,
    @Body()
    body: {
      status: ReportStatusType;
      action?: 'warn' | 'hide_content' | 'ban_user';
    },
  ) {
    const report = this.dataStore.reports.find((r) => r.id === id);
    if (!report) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy báo cáo vi phạm.',
        HttpStatus.NOT_FOUND,
      );
    }

    report.status = body.status || 'resolved';
    report.resolvedBy = actor.id;

    let targetOwnerId: string | undefined;
    if (report.targetType === 'user') {
      targetOwnerId = report.targetId;
    } else if (report.targetType === 'pet') {
      const pet = this.dataStore.pets.find((p) => p.id === report.targetId);
      targetOwnerId = pet?.userId;
      if (body.action === 'hide_content' && pet) pet.isHidden = true;
    } else if (report.targetType === 'moment') {
      const moment = this.dataStore.moments.find(
        (m) => m.id === report.targetId,
      );
      const pet = moment
        ? this.dataStore.pets.find((p) => p.id === moment.petId)
        : undefined;
      targetOwnerId = pet?.userId;
      if (body.action === 'hide_content' && moment) moment.isHidden = true;
    } else if (report.targetType === 'club') {
      const club = this.dataStore.clubs.find((c) => c.id === report.targetId);
      targetOwnerId = club?.ownerUserId;
      if (body.action === 'hide_content' && club) club.isHidden = true;
    }

    if (body.action === 'ban_user' && targetOwnerId) {
      const targetUser = this.dataStore.users.find(
        (u) => u.id === targetOwnerId,
      );
      if (targetUser) {
        targetUser.isBannedSwiping = true;
        targetUser.banUntil = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }
    }

    if (body.action === 'warn' && targetOwnerId) {
      await this.pushAdapter.sendPush(targetOwnerId, {
        type: 'system',
        title: '⚠️ Nhắc nhở tiêu chuẩn cộng đồng Pawty',
        body: 'Nội dung của bạn vừa được ghi nhận nhắc nhở từ Ban quản trị. Hãy cùng giữ môi trường văn minh nhé!',
        payload: { reportId: report.id },
      });
    }

    this.dataStore.logAudit(
      actor.id,
      'REPORT_RESOLVED',
      report.targetType,
      report.targetId,
      { reportId: report.id, status: report.status, action: body.action },
    );

    return report;
  }

  @Get('transactions')
  getTransactions(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const list = this.dataStore.transactions.filter((t) => {
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      return true;
    });
    return this.dataStore.paginate(list, page, limit);
  }

  @Get('partners')
  getPartners(
    @Query('status') status?: PartnerStatusType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const list = this.dataStore.partners
      .filter((p) => (status ? p.status === status : true))
      .map(({ passwordHash: _pw, ...rest }) => rest);
    return this.dataStore.paginate(list, page, limit);
  }

  @Patch('partners/:id')
  updatePartnerStatus(
    @CurrentUser() actor: UserRecord,
    @Param('id') id: string,
    @Body() body: { status: PartnerStatusType },
  ) {
    const partner = this.dataStore.partners.find((p) => p.id === id);
    if (!partner) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy đối tác.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.status) {
      partner.status = body.status;
    }

    this.dataStore.logAudit(
      actor.id,
      `PARTNER_${partner.status.toUpperCase()}`,
      'partner',
      partner.id,
      { businessName: partner.businessName },
    );

    const { passwordHash: _pw, ...rest } = partner;
    return rest;
  }

  @Get('ads')
  getAds(
    @Query('status') status?: AdStatusType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const list = this.dataStore.nativeAds.filter((a) =>
      status ? a.status === status : true,
    );
    return this.dataStore.paginate(list, page, limit);
  }

  @Patch('ads/:id')
  updateAdStatus(
    @CurrentUser() actor: UserRecord,
    @Param('id') id: string,
    @Body() body: { status: AdStatusType },
  ) {
    const ad = this.dataStore.nativeAds.find((a) => a.id === id);
    if (!ad) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy chiến dịch quảng cáo.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.status) {
      ad.status = body.status;
    }

    this.dataStore.logAudit(
      actor.id,
      `AD_${ad.status.toUpperCase()}`,
      'native_ad',
      ad.id,
      { title: ad.title },
    );

    return ad;
  }

  @Get('sos')
  getAdminSosList() {
    return this.dataStore.sosAlerts;
  }

  @Get('audit-logs')
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dataStore.paginate(this.dataStore.auditLogs, page, limit);
  }
}
