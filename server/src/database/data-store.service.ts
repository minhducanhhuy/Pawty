import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  UserRecord,
  PetRecord,
  MatchRecord,
  ChatRoomRecord,
  ChatMessageRecord,
  WalkAppointmentRecord,
  PetMomentRecord,
  MomentLikeRecord,
  MomentCommentRecord,
  SosAlertRecord,
  TransactionRecord,
  BlockRecord,
  ReportRecord,
  NotificationRecord,
  ReminderRecord,
  BadgeRecord,
  UserBadgeRecord,
  WalkLogRecord,
  ClubRecord,
  ClubMemberRecord,
  EventRecord,
  EventRsvpRecord,
  PetFriendlyPlaceRecord,
  PlaceReviewRecord,
  PartnerRecord,
  NativeAdRecord,
  VoucherRecord,
  ReferralRecord,
  AuditLogRecord,
  LiveLocationRecord,
} from './types';
import { createInitialSeed } from './seed-data';

@Injectable()
export class DataStoreService implements OnModuleInit {
  private readonly logger = new Logger(DataStoreService.name);
  private readonly dbFilePath = path.resolve(process.cwd(), 'data', 'pawty-db.json');

  public users: UserRecord[] = [];
  public pets: PetRecord[] = [];
  public matches: MatchRecord[] = [];
  public chatRooms: ChatRoomRecord[] = [];
  public chatMessages: ChatMessageRecord[] = [];
  public appointments: WalkAppointmentRecord[] = [];
  public moments: PetMomentRecord[] = [];
  public momentLikes: MomentLikeRecord[] = [];
  public momentComments: MomentCommentRecord[] = [];
  public sosAlerts: SosAlertRecord[] = [];
  public transactions: TransactionRecord[] = [];
  public blocks: BlockRecord[] = [];
  public reports: ReportRecord[] = [];
  public notifications: NotificationRecord[] = [];
  public reminders: ReminderRecord[] = [];
  public badges: BadgeRecord[] = [];
  public userBadges: UserBadgeRecord[] = [];
  public walkLogs: WalkLogRecord[] = [];
  public clubs: ClubRecord[] = [];
  public clubMembers: ClubMemberRecord[] = [];
  public events: EventRecord[] = [];
  public eventRsvps: EventRsvpRecord[] = [];
  public places: PetFriendlyPlaceRecord[] = [];
  public placeReviews: PlaceReviewRecord[] = [];
  public partners: PartnerRecord[] = [];
  public nativeAds: NativeAdRecord[] = [];
  public vouchers: VoucherRecord[] = [];
  public referrals: ReferralRecord[] = [];
  public auditLogs: AuditLogRecord[] = [];
  public liveLocations: LiveLocationRecord[] = [];

  // Runtime tracking maps (in-memory)
  public adImpressionTimestamps = new Map<string, number>();
  public icebreakerTimestamps = new Map<string, number[]>();
  public activeWalkSessions = new Map<
    string,
    { petId: string; startedAt: string; points: Array<{ lat: number; lng: number; t?: number }> }
  >();
  public liveLocationLastUpdate = new Map<string, number>();
  public weeklyFreeBoostsUsed = new Map<string, number>();

  constructor() {
    this.resetToSeed();
  }

  onModuleInit() {
    if (process.env.DATA_PERSIST === 'true') {
      this.loadFromDisk();
    }
  }

  public resetToSeed(): void {
    const seed = createInitialSeed();
    this.users = seed.users;
    this.pets = seed.pets;
    this.matches = seed.matches;
    this.chatRooms = seed.chatRooms;
    this.chatMessages = seed.chatMessages;
    this.appointments = seed.appointments;
    this.moments = seed.moments;
    this.momentLikes = seed.momentLikes;
    this.momentComments = seed.momentComments;
    this.sosAlerts = seed.sosAlerts;
    this.transactions = seed.transactions;
    this.blocks = seed.blocks;
    this.reports = seed.reports;
    this.notifications = seed.notifications;
    this.reminders = seed.reminders;
    this.badges = seed.badges;
    this.userBadges = seed.userBadges;
    this.walkLogs = seed.walkLogs;
    this.clubs = seed.clubs;
    this.clubMembers = seed.clubMembers;
    this.events = seed.events;
    this.eventRsvps = seed.eventRsvps;
    this.places = seed.places;
    this.placeReviews = seed.placeReviews;
    this.partners = seed.partners;
    this.nativeAds = seed.nativeAds;
    this.vouchers = seed.vouchers;
    this.referrals = seed.referrals;
    this.auditLogs = seed.auditLogs;
    this.liveLocations = [];
    this.adImpressionTimestamps.clear();
    this.icebreakerTimestamps.clear();
    this.activeWalkSessions.clear();
    this.liveLocationLastUpdate.clear();
    this.weeklyFreeBoostsUsed.clear();
  }

  public loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.dbFilePath)) {
        this.save();
        return;
      }
      const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        Object.assign(this, parsed);
        this.logger.log(`Loaded persisted database from ${this.dbFilePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to load persisted DB: ${(error as Error).message}`);
    }
  }

  public save(): void {
    if (process.env.DATA_PERSIST !== 'true') {
      return;
    }
    try {
      const dir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const snapshot = {
        users: this.users,
        pets: this.pets,
        matches: this.matches,
        chatRooms: this.chatRooms,
        chatMessages: this.chatMessages,
        appointments: this.appointments,
        moments: this.moments,
        momentLikes: this.momentLikes,
        momentComments: this.momentComments,
        sosAlerts: this.sosAlerts,
        transactions: this.transactions,
        blocks: this.blocks,
        reports: this.reports,
        notifications: this.notifications,
        reminders: this.reminders,
        badges: this.badges,
        userBadges: this.userBadges,
        walkLogs: this.walkLogs,
        clubs: this.clubs,
        clubMembers: this.clubMembers,
        events: this.events,
        eventRsvps: this.eventRsvps,
        places: this.places,
        placeReviews: this.placeReviews,
        partners: this.partners,
        nativeAds: this.nativeAds,
        vouchers: this.vouchers,
        referrals: this.referrals,
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to persist DB to disk: ${(error as Error).message}`);
    }
  }

  // PostGIS Spatial Distance Simulation (Haversine formula on WGS84 sphere)
  public calculatePostGisDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  public isBlockedEitherWay(userAId: string, userBId: string): boolean {
    return this.blocks.some(
      (b) =>
        (b.blockerUserId === userAId && b.blockedUserId === userBId) ||
        (b.blockerUserId === userBId && b.blockedUserId === userAId),
    );
  }

  public getActivePetForUser(userId: string, requestedPetId?: string): PetRecord | undefined {
    const userPets = this.pets.filter((p) => p.userId === userId);
    if (requestedPetId) {
      const matched = userPets.find((p) => p.id === requestedPetId);
      if (matched) return matched;
    }
    return userPets.find((p) => p.isPrimary) || userPets[0];
  }

  public logAudit(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    meta: Record<string, any> = {},
  ): AuditLogRecord {
    const entry: AuditLogRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorId,
      action,
      targetType,
      targetId,
      meta,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  public paginate<T>(
    items: T[],
    pageParam?: number | string,
    limitParam?: number | string,
  ): { items: T[]; page: number; limit: number; total: number } {
    const page = Math.max(1, parseInt(String(pageParam || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(limitParam || 20), 10) || 20));
    const total = items.length;
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      page,
      limit,
      total,
    };
  }
}
