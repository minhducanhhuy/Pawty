import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataStoreService } from '../database/data-store.service';
import { PushAdapterService } from '../adapters/push.adapter';
import { WalksService } from '../modules/walks/walks.service';
import { BUSINESS_RULES } from '../config/business-rules';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly dataStore: DataStoreService,
    private readonly pushAdapter: PushAdapterService,
    private readonly walksService: WalksService,
  ) {}

  // Runs every minute: 15-min appointment reminder, 1h event reminder, Walk/Boost expiry, unban check
  @Cron(CronExpression.EVERY_MINUTE)
  async handleMinuteJobs() {
    await this.checkAppointmentReminders();
    await this.checkEventReminders();
    this.checkWalkAndBoostExpiries();
    this.checkSwipeUnbans();
  }

  // Runs daily at 08:00: Vaccine & health reminders at 30/7/1/0 days before due date
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkVaccineAndHealthReminders() {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const offsets = BUSINESS_RULES.vaccine.reminderOffsetsDays; // [30, 7, 1, 0]

    for (const reminder of this.dataStore.reminders) {
      if (reminder.isDone) continue;
      const dueMs = new Date(reminder.dueDate).getTime();
      const diffDays = Math.round((dueMs - todayStart) / (24 * 60 * 60 * 1000));

      if (
        offsets.includes(diffDays) &&
        reminder.lastNotifiedOffset !== diffDays
      ) {
        const pet = this.dataStore.pets.find((p) => p.id === reminder.petId);
        if (pet) {
          reminder.lastNotifiedOffset = diffDays;
          await this.pushAdapter.sendPush(pet.userId, {
            type: 'reminder',
            title:
              diffDays === 0
                ? `💉 Hôm nay đến hạn: ${reminder.title}`
                : `⏰ Nhắc lịch trước ${diffDays} ngày: ${reminder.title}`,
            body: `Đừng quên lịch chăm sóc sức khoẻ cho ${pet.name} vào ngày ${reminder.dueDate} nhé Sen!`,
            payload: { reminderId: reminder.id, petId: pet.id, diffDays },
          });
        }
      }
    }
    this.dataStore.save();
  }

  // Runs daily at midnight: reset daily swipe & super like quotas + check VIP expiry
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  resetDailyQuotas() {
    const now = new Date();
    for (const user of this.dataStore.users) {
      user.dailySwipesCount = 0;
      user.superLikesToday = 0;
      if (user.vipExpiresAt && new Date(user.vipExpiresAt) <= now) {
        user.vipTier = 'free';
        user.isVip = false;
        user.vipExpiresAt = null;
      }
    }
    this.dataStore.save();
    this.logger.log('Daily swipe and Super Like quotas reset completed.');
  }

  // Runs every Monday at 00:00: reset weekly flake counters and replenish weekly free VIP boosts
  @Cron('0 0 * * 1')
  handleWeeklyResets() {
    for (const user of this.dataStore.users) {
      if (!user.isBannedSwiping) {
        user.flakeReportsCount = 0;
      }
    }
    this.dataStore.weeklyFreeBoostsUsed.clear();
    this.dataStore.save();
    this.logger.log('Weekly flake counters and free VIP boosts reset completed.');
  }

  public async checkAppointmentReminders() {
    const nowMs = Date.now();
    const windowMs =
      BUSINESS_RULES.antiFlake.reminderBeforeMinutes * 60 * 1000;

    for (const apt of this.dataStore.appointments) {
      if (apt.status !== 'confirmed' || apt.reminderSentAt) continue;
      const scheduledMs = new Date(apt.scheduledTime).getTime();
      const diffMs = scheduledMs - nowMs;

      if (diffMs > 0 && diffMs <= windowMs) {
        apt.reminderSentAt = new Date().toISOString();
        const senderPet = this.dataStore.pets.find(
          (p) => p.id === apt.senderPetId,
        );
        const receiverPet = this.dataStore.pets.find(
          (p) => p.id === apt.receiverPetId,
        );

        if (senderPet) {
          await this.pushAdapter.sendPush(senderPet.userId, {
            type: 'appointment',
            title: '⏰ Còn 15 phút nữa tới giờ hẹn dắt dạo!',
            body: `Chuẩn bị dây dắt cho ${senderPet.name} ra ${apt.placeName} gặp ${receiverPet?.name || 'bạn mới'} nhé!`,
            payload: { appointmentId: apt.id, roomId: apt.roomId },
          });
        }
        if (receiverPet) {
          await this.pushAdapter.sendPush(receiverPet.userId, {
            type: 'appointment',
            title: '⏰ Còn 15 phút nữa tới giờ hẹn dắt dạo!',
            body: `Chuẩn bị dây dắt cho ${receiverPet.name} ra ${apt.placeName} gặp ${senderPet?.name || 'bạn mới'} nhé!`,
            payload: { appointmentId: apt.id, roomId: apt.roomId },
          });
        }
      }
    }
  }

  public async checkEventReminders() {
    const nowMs = Date.now();
    const windowMs =
      BUSINESS_RULES.community.eventReminderBeforeMinutes * 60 * 1000;

    for (const evt of this.dataStore.events) {
      if (evt.reminderSent) continue;
      const startsMs = new Date(evt.startsAt).getTime();
      const diffMs = startsMs - nowMs;

      if (diffMs > 0 && diffMs <= windowMs) {
        evt.reminderSent = true;
        const goingUserIds = this.dataStore.eventRsvps
          .filter((r) => r.eventId === evt.id && r.status === 'going')
          .map((r) => r.userId);

        for (const uid of goingUserIds) {
          await this.pushAdapter.sendPush(uid, {
            type: 'event',
            title: `🎉 Sự kiện "${evt.title}" sắp diễn ra sau 1 giờ!`,
            body: `Địa điểm: ${evt.placeName}. Hẹn gặp bạn và Boss nhé!`,
            payload: { eventId: evt.id },
          });
        }
      }
    }
  }

  public checkWalkAndBoostExpiries() {
    const now = new Date();
    for (const user of this.dataStore.users) {
      if (
        user.isWalkingNow &&
        user.walkingUntil &&
        new Date(user.walkingUntil) <= now
      ) {
        user.isWalkingNow = false;
        user.walkingUntil = null;
        this.dataStore.activeWalkSessions.delete(user.id);
        this.walksService.notifyWalkingNowChanged(user.id, false);
      }
      if (user.boostExpiresAt && new Date(user.boostExpiresAt) <= now) {
        user.boostExpiresAt = null;
      }
    }

    this.dataStore.liveLocations = this.dataStore.liveLocations.filter(
      (l) => new Date(l.expiresAt) > now,
    );
  }

  public checkSwipeUnbans() {
    const now = new Date();
    for (const user of this.dataStore.users) {
      if (
        user.isBannedSwiping &&
        user.banUntil &&
        new Date(user.banUntil) <= now
      ) {
        user.isBannedSwiping = false;
        user.banUntil = null;
        user.flakeReportsCount = 0;
      }
    }
  }
}
