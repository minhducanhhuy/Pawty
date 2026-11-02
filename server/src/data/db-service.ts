import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { cloudinaryService } from '../services/cloudinary.service';

export const prisma = new PrismaClient();

export type CanonicalTinderIntent = 'playdate' | 'dating' | 'community';

const INTENT_TO_LABEL: Record<CanonicalTinderIntent, string> = {
  playdate: 'Cùng dắt thú cưng đi dạo',
  dating: 'Hẹn hò cho người yêu thú',
  community: 'Giao lưu hội nuôi thú cưng',
};

export function normalizeTinderIntent(raw?: string | null): CanonicalTinderIntent {
  if (!raw) return 'playdate';
  const lowered = raw.trim().toLowerCase();
  if (lowered === 'dating' || lowered.includes('hẹn hò')) return 'dating';
  if (lowered === 'community' || lowered.includes('giao lưu') || lowered.includes('cộng đồng')) {
    return 'community';
  }
  return 'playdate';
}

export function getTinderIntentLabel(intent: CanonicalTinderIntent): string {
  return INTENT_TO_LABEL[intent] || INTENT_TO_LABEL.playdate;
}

export function cleanDisplayName(name?: string | null): string {
  if (!name) return 'Cư dân Pawty';
  return (
    name
      .replace(/\s*\(@[^)]*\)?/g, '')
      .replace(/@\w+/g, '')
      .replace(/\s*@.*$/, '')
      .replace(/\s*\([^)]*\)$/g, '')
      .trim() || 'Cư dân Pawty'
  );
}

function formatUserHandle(user: { username?: string | null; displayName?: string | null }): string {
  if (user.username && user.username.trim()) {
    const clean = user.username.trim().replace(/^@/, '');
    return `@${clean}`;
  }
  const fallback = (user.displayName || 'user')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '');
  return `@${fallback || 'user'}`;
}

function parseSafeWeightKg(rawWeight: unknown): number {
  if (typeof rawWeight === 'number' && Number.isFinite(rawWeight)) {
    return Math.min(999, Math.max(0.2, rawWeight));
  }
  if (typeof rawWeight === 'string') {
    const nums = rawWeight.match(/\d+(\.\d+)?/g);
    if (nums && nums.length >= 2) {
      const avg = ( parseFloat(nums[0]) + parseFloat(nums[1]) ) / 2;
      return Math.min(999, Math.max(0.2, Number(avg.toFixed(1))));
    }
    if (nums && nums.length === 1) {
      return Math.min(999, Math.max(0.2, parseFloat(nums[0])));
    }
  }
  return 5;
}

function formatClockTime(dateInput: Date | string): string {
  const d = new Date(dateInput);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function calculatePetAgeFromBirthDate(birthDateStr?: string | null): string {
  if (!birthDateStr || !birthDateStr.trim()) return 'Chưa rõ';
  const parts = birthDateStr.split(/[\/\-\.]/);
  if (parts.length < 3) return 'Chưa rõ';
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Chưa rõ';

  const birth = new Date(year, month, day);
  const now = new Date();
  if (birth > now) return 'Chưa rõ';

  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.4375);
  const diffYears = Math.floor(diffDays / 365.25);

  if (diffMonths < 1) {
    const weeks = Math.max(1, Math.floor(diffDays / 7));
    return `${weeks} tuần tuổi`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} tháng tuổi`;
  }
  const remainingMonths = diffMonths % 12;
  if (remainingMonths >= 3 && remainingMonths <= 9) {
    return `${diffYears}.5 tuổi`;
  }
  return `${diffYears} tuổi`;
}

export class DatabaseService {
  // --- Metadata & Follow Graph Helpers ---
  public async getUserMetaMap(userIds?: string[]): Promise<Record<string, Record<string, any>>> {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        eventType: 'user_profile_meta',
        ...(userIds && userIds.length > 0 ? { userId: { in: userIds } } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    const map: Record<string, Record<string, any>> = {};
    for (const ev of events) {
      if (ev.userId && ev.eventData && typeof ev.eventData === 'object') {
        map[ev.userId] = {
          ...(map[ev.userId] || {}),
          ...(ev.eventData as Record<string, any>),
        };
      }
    }
    return map;
  }

  public async upsertUserMeta(userId: string, patch: Record<string, any>) {
    const existing = await prisma.analyticsEvent.findFirst({
      where: { userId, eventType: 'user_profile_meta' },
      orderBy: { createdAt: 'desc' },
    });

    const merged = {
      ...(existing?.eventData && typeof existing.eventData === 'object'
        ? (existing.eventData as Record<string, any>)
        : {}),
      ...patch,
    };

    if (existing) {
      await prisma.analyticsEvent.update({
        where: { id: existing.id },
        data: { eventData: merged },
      });
    } else {
      await prisma.analyticsEvent.create({
        data: {
          userId,
          eventType: 'user_profile_meta',
          eventData: merged,
        },
      });
    }
    return merged;
  }

  private async getFollowSnapshot() {
    const rows = await prisma.analyticsEvent.findMany({
      where: { eventType: 'user_follow' },
    });

    const followersByUser = new Map<string, Set<string>>();
    const followingByUser = new Map<string, Set<string>>();

    for (const r of rows) {
      const followerId = r.userId;
      const targetUserId =
        r.eventData && typeof r.eventData === 'object'
          ? String((r.eventData as any).targetUserId || '')
          : '';
      if (!followerId || !targetUserId || followerId === targetUserId) continue;

      if (!followersByUser.has(targetUserId)) followersByUser.set(targetUserId, new Set());
      followersByUser.get(targetUserId)!.add(followerId);

      if (!followingByUser.has(followerId)) followingByUser.set(followerId, new Set());
      followingByUser.get(followerId)!.add(targetUserId);
    }

    return { followersByUser, followingByUser };
  }

  private formatPetOutput(p: any) {
    const metaRecord = Array.isArray(p.careRecords)
      ? p.careRecords.find((c: any) => c.recordType === 'pet_profile_meta')
      : undefined;
    const meta: Record<string, any> =
      metaRecord?.dataJson && typeof metaRecord.dataJson === 'object'
        ? (metaRecord.dataJson as Record<string, any>)
        : {};

    const behaviors = Array.isArray(p.behaviors) ? p.behaviors : [];
    const goodHabitsFromDb = behaviors
      .filter((b: any) => b.category === 'good')
      .map((b: any) => b.label);
    const cautionHabitsFromDb = behaviors
      .filter((b: any) => b.category === 'caution')
      .map((b: any) => b.label);

    const vaccinations = Array.isArray(p.vaccinations) ? p.vaccinations : [];
    const mappedVaccines =
      Array.isArray(meta.vaccineRecords) && meta.vaccineRecords.length > 0
        ? meta.vaccineRecords
        : vaccinations.map((v: any) => ({
            id: v.id,
            name: v.vaccineName,
            date: v.dateGiven ? new Date(v.dateGiven).toLocaleDateString('vi-VN') : '',
            clinic: v.vetName || 'Phòng khám Thú Y',
            nextDueDate: v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('vi-VN') : '',
          }));

    const rawSpecies = String(p.species || 'Chó');
    const normalizedSpecies: 'Chó' | 'Mèo' | 'Khác' =
      rawSpecies === 'cat' || rawSpecies === 'Mèo'
        ? 'Mèo'
        : rawSpecies === 'other' || rawSpecies === 'Khác'
        ? 'Khác'
        : 'Chó';

    const avatarUrl =
      p.avatarUrl ||
      (Array.isArray(meta.galleryUrls) && meta.galleryUrls[0]) ||
      '';

    const galleryUrls =
      Array.isArray(meta.galleryUrls) && meta.galleryUrls.length > 0
        ? meta.galleryUrls
        : avatarUrl
        ? [avatarUrl]
        : [];

    const weightVal =
      p.weightKg !== null && p.weightKg !== undefined
        ? Number(p.weightKg)
        : meta.weightKg !== undefined && meta.weightKg !== null
        ? Number(meta.weightKg)
        : undefined;

    const birthDate =
      meta.birthDate ||
      (p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('vi-VN') : '');

    const ageLabel =
      meta.ageLabel ||
      (birthDate ? calculatePetAgeFromBirthDate(birthDate) : 'Chưa rõ');

    return {
      id: p.id,
      ownerId: p.ownerId,
      householdId: p.householdId,
      name: p.name,
      species: normalizedSpecies,
      customSpecies: meta.customSpecies || undefined,
      breed: p.breed || 'Chưa rõ',
      gender: (p.gender === 'Cái' || p.gender === 'female' ? 'Cái' : 'Đực') as 'Đực' | 'Cái',
      birthDate,
      ageLabel,
      weightKg: weightVal,
      weightLabel: meta.weightLabel || (weightVal !== undefined ? `${weightVal} kg` : 'Chưa rõ'),
      furColor: meta.furColor || '',
      avatarUrl,
      coverPhotoUrl: p.coverPhotoUrl || avatarUrl,
      galleryUrls,
      likesCount: Number(meta.likesCount || p.followerCount || 0),
      isSterilized: Boolean(p.isNeutered ?? meta.isSterilized ?? false),
      isVaccinatedAndRabies:
        Boolean(meta.isVaccinatedAndRabies) ||
        p.vaccinationStatus === 'verified' ||
        mappedVaccines.length > 0,
      vaccinationStatus: p.vaccinationStatus || 'pending',
      bio: meta.bio || p.medicalNotes || '',
      favoriteFood: meta.favoriteFood || '',
      dewormingHistory: meta.dewormingHistory || '',
      medicalHistory: meta.medicalHistory || p.allergies || '',
      goodHabits:
        goodHabitsFromDb.length > 0
          ? goodHabitsFromDb
          : Array.isArray(meta.goodHabits)
          ? meta.goodHabits
          : [],
      cautionHabits:
        cautionHabitsFromDb.length > 0
          ? cautionHabitsFromDb
          : Array.isArray(meta.cautionHabits)
          ? meta.cautionHabits
          : [],
      weightHistory: Array.isArray(meta.weightHistory)
        ? meta.weightHistory
        : weightVal !== undefined
        ? [{ month: 'Hiện tại', weightKg: weightVal }]
        : [],
      vaccineRecords: mappedVaccines,
      vaccinations,
      behaviors,
    };
  }

  private enrichUserOutput(
    user: any,
    meta: Record<string, any> = {},
    followersCount = 0,
    followingCount = 0
  ) {
    if (!user) return null;
    const intent = normalizeTinderIntent(meta.tinderSetup?.intent || user.primaryNeed);
    const lookingFor = getTinderIntentLabel(intent);
    const defaultTinderSetup = {
      displayName: user.displayName || 'Cư dân Pawty',
      age: meta.age ? Number(meta.age) : undefined,
      gender: meta.gender || undefined,
      intent,
      lookingFor,
      bio: user.bio || '',
      datingPetId: '',
      photoUrls: user.avatarUrl ? [user.avatarUrl] : [],
      photos: user.avatarUrl ? [user.avatarUrl] : [],
      zodiac: meta.zodiac || undefined,
      smoking: meta.smoking || undefined,
      workout: meta.workout || undefined,
      drinking: meta.drinking || undefined,
      chatStyle: meta.chatStyle || undefined,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
    };

    const tinderSetup = meta.tinderSetup
      ? {
          ...defaultTinderSetup,
          ...meta.tinderSetup,
          displayName: meta.tinderSetup.displayName || defaultTinderSetup.displayName,
          bio: meta.tinderSetup.bio || defaultTinderSetup.bio,
          datingPetId: meta.tinderSetup.datingPetId || '',
          photos:
            Array.isArray(meta.tinderSetup.photos) && meta.tinderSetup.photos.length > 0
              ? meta.tinderSetup.photos
              : Array.isArray(meta.tinderSetup.photoUrls) && meta.tinderSetup.photoUrls.length > 0
              ? meta.tinderSetup.photoUrls
              : defaultTinderSetup.photos,
          photoUrls:
            Array.isArray(meta.tinderSetup.photoUrls) && meta.tinderSetup.photoUrls.length > 0
              ? meta.tinderSetup.photoUrls
              : Array.isArray(meta.tinderSetup.photos) && meta.tinderSetup.photos.length > 0
              ? meta.tinderSetup.photos
              : defaultTinderSetup.photoUrls,
          intent: normalizeTinderIntent(meta.tinderSetup.intent || meta.tinderSetup.lookingFor || user.primaryNeed),
          lookingFor: getTinderIntentLabel(
            normalizeTinderIntent(meta.tinderSetup.intent || meta.tinderSetup.lookingFor || user.primaryNeed)
          ),
        }
      : defaultTinderSetup;

    return {
      ...user,
      displayName: cleanDisplayName(user.displayName),
      handle: formatUserHandle(user),
      coverUrl: meta.coverUrl || '',
      gender: meta.gender || undefined,
      age: meta.age ? Number(meta.age) : undefined,
      birthDate: meta.birthDate || undefined,
      zodiac: meta.zodiac || undefined,
      mbti: meta.mbti || undefined,
      occupation: meta.occupation || undefined,
      education: meta.education || undefined,
      noteBubble: meta.noteBubble ?? '',
      privacySettings: meta.privacySettings || {
        profileVisibility: 'public',
        postsVisibility: 'public',
        petsVisibility: 'public',
        tinderVisibility: true,
        allowDirectMessageFromAnyone: true,
      },
      tinderSetup,
      followersCount,
      followingCount,
      pets: Array.isArray(user.pets) ? user.pets.map((p: any) => this.formatPetOutput(p)) : [],
    };
  }

  // --- Bootstrap ---
  public async getBootstrapData(currentUserId?: string) {
    const rawPrimaryUser = await this.getPrimaryUserRaw(currentUserId);
    if (currentUserId && !rawPrimaryUser) {
      return {
        user: null,
        pets: [],
        posts: [],
        sosAlerts: [],
        candidates: [],
        likesYou: [],
        chats: [],
        notifications: [],
        publicProfiles: {},
        suggestedPeople: [],
        trendingSuggestions: [],
        tasks: [],
        circleMembers: [],
        reports: [],
        metrics: { totalUsers: 0, totalPets: 0, totalPosts: 0, activeSos: 0 },
      };
    }

    const resolvedUserId = rawPrimaryUser?.id || 'user-test1';

    const [
      userMetaMap,
      followSnap,
      pets,
      posts,
      sosAlerts,
      candidates,
      likesYou,
      chats,
      notifications,
      publicProfiles,
      tasks,
      circleMembers,
      reports,
      otherUsers,
      totalUsers,
      totalPets,
    ] = await Promise.all([
      this.getUserMetaMap(),
      this.getFollowSnapshot(),
      this.getUserPets(resolvedUserId),
      this.getPosts(resolvedUserId),
      this.getSosAlerts(),
      this.getTinderCandidates(resolvedUserId),
      this.getLikesYouCandidates(resolvedUserId),
      this.getChats(resolvedUserId),
      this.getNotifications(resolvedUserId),
      this.getAllPublicProfiles(resolvedUserId),
      this.getTasks(),
      prisma.circleMember.findMany({ include: { user: true } }),
      prisma.report.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.user.findMany({
        where: { id: { not: resolvedUserId } },
        include: { pets: true },
        take: 15,
      }),
      prisma.user.count(),
      prisma.pet.count(),
    ]);

    const enrichedUser = this.enrichUserOutput(
      rawPrimaryUser,
      userMetaMap[resolvedUserId] || {},
      followSnap.followersByUser.get(resolvedUserId)?.size || 0,
      followSnap.followingByUser.get(resolvedUserId)?.size || 0
    );

    const hashtagCounts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.hashtags || []) {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      }
    }
    const trendingSuggestions = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8);

    const suggestedPeople = otherUsers.map((u) => {
      const handle = formatUserHandle(u);
      const uMeta = userMetaMap[u.id] || {};
      const petSummary =
        u.pets.length > 0
          ? u.pets.map((p) => `${p.name} (${p.breed || p.species})`).join(', ')
          : 'Thành viên cộng đồng Pawty';
      return {
        id: u.id,
        name: u.displayName,
        handle,
        nickname: uMeta.occupation || 'Cư dân Pawty',
        avatarUrl: u.avatarUrl || '',
        petSummary,
        mutualText: u.neighborhood || u.district || 'Gần khu vực của bạn',
        isPrivate: uMeta.privacySettings?.profileVisibility === 'private',
      };
    });

    return {
      user: enrichedUser,
      pets,
      posts,
      sosAlerts,
      candidates,
      likesYou,
      chats,
      notifications,
      publicProfiles,
      suggestedPeople,
      trendingSuggestions,
      tasks,
      circleMembers,
      reports,
      metrics: {
        totalUsers,
        totalPets,
        totalPosts: posts.length,
        activeSos: sosAlerts.filter((s: any) => s.status === 'active').length,
      },
    };
  }

  // --- Relationship Resolver ---
  private computeFriendshipState(
    currentUserId: string,
    otherUserId: string,
    allMatches: Array<{ userAId: string; userBId: string; status: string }>
  ): {
    isFriend: boolean;
    friendStatus: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted';
    isMatchedOnTinder: boolean;
  } {
    const ab = allMatches.find((m) => m.userAId === currentUserId && m.userBId === otherUserId);
    const ba = allMatches.find((m) => m.userAId === otherUserId && m.userBId === currentUserId);

    if (ab?.status === 'matched' || ba?.status === 'matched') {
      return { isFriend: true, friendStatus: 'accepted', isMatchedOnTinder: true };
    }
    if (ab?.status === 'friend_pending') {
      return { isFriend: false, friendStatus: 'pending_outgoing', isMatchedOnTinder: false };
    }
    if (ba?.status === 'friend_pending') {
      return { isFriend: false, friendStatus: 'pending_incoming', isMatchedOnTinder: false };
    }
    return { isFriend: false, friendStatus: 'none', isMatchedOnTinder: false };
  }

  private buildPublicProfileObject(
    u: any,
    currentUserId: string,
    meta: Record<string, any>,
    allMatches: Array<{ userAId: string; userBId: string; status: string }>,
    followSnap: {
      followersByUser: Map<string, Set<string>>;
      followingByUser: Map<string, Set<string>>;
    }
  ) {
    const handle = formatUserHandle(u);
    const cleanHandle = handle.replace(/^@/, '');
    const friendship = this.computeFriendshipState(currentUserId, u.id, allMatches);
    const isFollowing = Boolean(followSnap.followingByUser.get(currentUserId)?.has(u.id));
    const followersCount = followSnap.followersByUser.get(u.id)?.size || 0;
    const followingCount = followSnap.followingByUser.get(u.id)?.size || 0;
    const friendsCount = allMatches.filter(
      (m) => (m.userAId === u.id || m.userBId === u.id) && m.status === 'matched'
    ).length;

    const formattedPets = (u.pets || []).map((p: any) => this.formatPetOutput(p));

    const formattedPosts = (u.posts || []).map((p: any) => {
      const mArr = Array.isArray(p.media) ? (p.media as any[]) : [];
      const mediaUrls = mArr
        .map((m: any) => (typeof m === 'string' ? m : m?.url))
        .filter(Boolean);
      return {
        id: p.id,
        authorId: u.id,
        authorName: cleanDisplayName(u.displayName || cleanHandle),
        authorHandle: handle,
        authorNickname: cleanDisplayName(meta.occupation || 'Cư dân Pawty'),
        authorAvatar: u.avatarUrl || '',
        location: p.locationName || u.neighborhood || 'TP. Hồ Chí Minh',
        createdAt: formatClockTime(p.createdAt),
        content: p.textContent || '',
        mediaUrls,
        mediaType: 'image' as const,
        tags: p.hashtags || [],
        likes: p.pawCount || (p.reactions ? p.reactions.length : 0),
        isLiked: Array.isArray(p.reactions)
          ? p.reactions.some((r: any) => r.userId === currentUserId)
          : false,
        isSaved: false,
        shares: p.shareCount || 0,
        comments: Array.isArray(p.comments)
          ? p.comments.map((c: any) => ({
              id: c.id,
              authorName: c.author?.displayName || 'Cư dân Pawty',
              authorHandle: formatUserHandle(c.author || {}),
              authorAvatar: c.author?.avatarUrl || '',
              text: c.textContent,
              parentId: c.parentId || null,
              createdAt: formatClockTime(c.createdAt),
            }))
          : [],
      };
    });

    const totalLikesCount = formattedPosts.reduce(
      (sum: number, item: any) => sum + Number(item.likes || 0),
      0
    );

    const galleryUrls = formattedPosts.flatMap((p: any) => p.mediaUrls);

    return {
      id: u.id,
      handle,
      name: cleanDisplayName(u.displayName || cleanHandle),
      nickname: cleanDisplayName(meta.occupation || 'Cư dân Pawty'),
      avatarUrl: u.avatarUrl || '',
      coverUrl: meta.coverUrl || '',
      gender: meta.gender || undefined,
      age: meta.age ? Number(meta.age) : undefined,
      birthDate: meta.birthDate || undefined,
      zodiac: meta.zodiac || undefined,
      mbti: meta.mbti || undefined,
      occupation: meta.occupation || undefined,
      education: meta.education || undefined,
      noteBubble: meta.noteBubble || '',
      bio: u.bio || 'Yêu thương thú cưng và gắn kết cộng đồng cư dân Pawty.',
      area: u.neighborhood || u.district || 'Vinhomes Grand Park, TP. Thủ Đức',
      isPrivate: meta.privacySettings?.profileVisibility === 'private',
      isFriend: friendship.isFriend,
      friendStatus: friendship.friendStatus,
      isFollowing,
      isMatchedOnTinder: friendship.isMatchedOnTinder,
      followersCount,
      followingCount,
      friendsCount,
      likesCount: totalLikesCount,
      pets: formattedPets,
      posts: formattedPosts,
      galleryUrls: galleryUrls.length > 0 ? galleryUrls : u.avatarUrl ? [u.avatarUrl] : [],
    };
  }

  public async getAllPublicProfiles(currentUserId = 'user-test1'): Promise<Record<string, any>> {
    const [users, allMatches, userMetaMap, followSnap] = await Promise.all([
      prisma.user.findMany({
        include: {
          pets: {
            include: {
              vaccinations: true,
              behaviors: true,
              careRecords: true,
            },
          },
          posts: {
            include: {
              reactions: true,
              comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.match.findMany(),
      this.getUserMetaMap(),
      this.getFollowSnapshot(),
    ]);

    const profilesMap: Record<string, any> = {};

    for (const u of users) {
      const profile = this.buildPublicProfileObject(
        u,
        currentUserId,
        userMetaMap[u.id] || {},
        allMatches,
        followSnap
      );
      const cleanHandle = profile.handle.replace(/^@/, '');
      profilesMap[profile.handle] = profile;
      profilesMap[cleanHandle] = profile;
      profilesMap[u.id] = profile;
      profilesMap[`@${cleanHandle.replace(/_/g, '')}`] = profile;
    }

    return profilesMap;
  }

  public async getPublicUserProfileByHandle(handle: string, currentUserId = 'user-test1') {
    const cleanHandle = handle.trim().replace(/^@/, '').toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: handle.trim() },
          { id: cleanHandle },
          { username: { equals: cleanHandle, mode: 'insensitive' } },
          { username: { equals: cleanHandle.replace(/_/g, ''), mode: 'insensitive' } },
        ],
      },
      include: {
        pets: {
          include: {
            vaccinations: true,
            behaviors: true,
            careRecords: true,
          },
        },
        posts: {
          include: {
            reactions: true,
            comments: {
              include: { author: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return null;

    const [allMatches, userMetaMap, followSnap] = await Promise.all([
      prisma.match.findMany({
        where: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      }),
      this.getUserMetaMap([user.id]),
      this.getFollowSnapshot(),
    ]);

    return this.buildPublicProfileObject(
      user,
      currentUserId,
      userMetaMap[user.id] || {},
      allMatches,
      followSnap
    );
  }

  public async resolveUserByHandleOrId(identifier: string) {
    const raw = identifier.trim();
    const clean = raw.replace(/^@/, '');
    return prisma.user.findFirst({
      where: {
        OR: [
          { id: raw },
          { username: { equals: clean, mode: 'insensitive' } },
          { phone: clean },
          { displayName: { equals: clean, mode: 'insensitive' } },
        ],
      },
    });
  }

  // --- Users ---
  private async getPrimaryUserRaw(userId?: string) {
    if (userId) {
      return prisma.user.findUnique({
        where: { id: userId },
        include: { pets: { include: { vaccinations: true, behaviors: true, careRecords: true } } },
      });
    }
    return prisma.user.findFirst({
      include: { pets: { include: { vaccinations: true, behaviors: true, careRecords: true } } },
    });
  }

  public async getPrimaryUser(userId?: string) {
    const raw = await this.getPrimaryUserRaw(userId);
    if (!raw) return null;
    const [metaMap, followSnap] = await Promise.all([
      this.getUserMetaMap([raw.id]),
      this.getFollowSnapshot(),
    ]);
    return this.enrichUserOutput(
      raw,
      metaMap[raw.id] || {},
      followSnap.followersByUser.get(raw.id)?.size || 0,
      followSnap.followingByUser.get(raw.id)?.size || 0
    );
  }

  public async findUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  public async findUserByIdentifier(identifier: string) {
    const clean = identifier.trim().replace(/^@/, '');
    return prisma.user.findFirst({
      where: {
        OR: [
          { phone: clean },
          { username: { equals: clean, mode: 'insensitive' } },
          { id: clean },
          { id: `user-${clean}` },
        ],
      },
      include: { pets: { include: { vaccinations: true, behaviors: true, careRecords: true } } },
    });
  }

  public async authenticateUser(identifier: string, password?: string) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) return null;
    if (user.password && password !== undefined) {
      if (user.password !== password) {
        return null;
      }
    }
    const [metaMap, followSnap] = await Promise.all([
      this.getUserMetaMap([user.id]),
      this.getFollowSnapshot(),
    ]);
    return this.enrichUserOutput(
      user,
      metaMap[user.id] || {},
      followSnap.followersByUser.get(user.id)?.size || 0,
      followSnap.followingByUser.get(user.id)?.size || 0
    );
  }

  public async createUser(
    dataOrPhone:
      | string
      | {
          phone: string;
          username?: string;
          password?: string;
          displayName?: string;
          district?: string;
          neighborhood?: string;
        },
    displayName?: string
  ) {
    if (typeof dataOrPhone === 'string') {
      const created = await prisma.user.create({
        data: {
          phone: dataOrPhone.slice(0, 15),
          displayName: (displayName || `Người dùng ${dataOrPhone.slice(-4)}`).slice(0, 50),
          district: 'TP. Thủ Đức',
          neighborhood: 'Vinhomes Grand Park, TP. Thủ Đức',
          primaryNeed: 'playdate',
          role: 'user',
          status: 'active',
        },
      });
      await prisma.household.create({
        data: {
          name: `Nhà của ${created.displayName}`,
          ownerId: created.id,
        },
      });
      return this.getPrimaryUser(created.id);
    }

    const created = await prisma.user.create({
      data: {
        phone: dataOrPhone.phone.slice(0, 15),
        username: dataOrPhone.username ? dataOrPhone.username.slice(0, 50) : undefined,
        password: dataOrPhone.password || '123456',
        displayName: (dataOrPhone.displayName || `Người dùng ${dataOrPhone.phone.slice(-4)}`).slice(
          0,
          50
        ),
        district: (dataOrPhone.district || 'TP. Thủ Đức').slice(0, 100),
        neighborhood: (dataOrPhone.neighborhood || 'Vinhomes Grand Park, TP. Thủ Đức').slice(
          0,
          200
        ),
        primaryNeed: 'playdate',
        role: 'user',
        status: 'active',
      },
    });

    await prisma.household.create({
      data: {
        name: `Nhà của ${created.displayName}`,
        ownerId: created.id,
      },
    });

    return this.getPrimaryUser(created.id);
  }

  public async updateUser(id: string, data: Record<string, any>) {
    const dbUpdate: Record<string, any> = {};

    if (typeof data.displayName === 'string' && data.displayName.trim()) {
      dbUpdate.displayName = data.displayName.trim().slice(0, 50);
    } else if (typeof data.name === 'string' && data.name.trim()) {
      dbUpdate.displayName = data.name.trim().slice(0, 50);
    }

    if (typeof data.avatarUrl === 'string') {
      dbUpdate.avatarUrl = await cloudinaryService.uploadImage(data.avatarUrl, 'pawty/avatars');
    }

    if (typeof data.bio === 'string') {
      dbUpdate.bio = data.bio.slice(0, 200);
    }

    if (typeof data.district === 'string') {
      dbUpdate.district = data.district.slice(0, 100);
    }

    if (typeof data.neighborhood === 'string') {
      dbUpdate.neighborhood = data.neighborhood.slice(0, 200);
    } else if (typeof data.area === 'string') {
      dbUpdate.neighborhood = data.area.slice(0, 200);
    }

    if (data.primaryNeed || data.tinderSetup?.intent || data.tinderSetup?.lookingFor) {
      dbUpdate.primaryNeed = normalizeTinderIntent(
        data.primaryNeed || data.tinderSetup?.intent || data.tinderSetup?.lookingFor
      );
    }

    if (typeof data.showLocation === 'boolean') {
      dbUpdate.showLocation = data.showLocation;
    }
    if (typeof data.showPhone === 'boolean') {
      dbUpdate.showPhone = data.showPhone;
    }
    if (typeof data.allowMessages === 'string') {
      dbUpdate.allowMessages = data.allowMessages.slice(0, 20);
    }

    if (Object.keys(dbUpdate).length > 0) {
      await prisma.user.update({
        where: { id },
        data: dbUpdate,
      });
    }

    const metaKeys = [
      'coverUrl',
      'gender',
      'age',
      'birthDate',
      'zodiac',
      'mbti',
      'occupation',
      'education',
      'noteBubble',
      'privacySettings',
      'tinderSetup',
    ];
    const metaPatch: Record<string, any> = {};
    for (const k of metaKeys) {
      if (data[k] !== undefined) {
        metaPatch[k] = data[k];
      }
    }
    if (metaPatch.coverUrl && typeof metaPatch.coverUrl === 'string') {
      metaPatch.coverUrl = await cloudinaryService.uploadImage(metaPatch.coverUrl, 'pawty/covers');
    }
    const rawTinderPhotos =
      metaPatch.tinderSetup?.photos || metaPatch.tinderSetup?.photoUrls;
    if (Array.isArray(rawTinderPhotos) && rawTinderPhotos.length > 0) {
      const uploadedTinderPhotos = await cloudinaryService.uploadMultipleImages(
        rawTinderPhotos,
        'pawty/tinder'
      );
      metaPatch.tinderSetup.photos = uploadedTinderPhotos;
      metaPatch.tinderSetup.photoUrls = uploadedTinderPhotos;
    }
    if (metaPatch.tinderSetup) {
      const normalizedIntent = normalizeTinderIntent(
        metaPatch.tinderSetup.intent || metaPatch.tinderSetup.lookingFor || dbUpdate.primaryNeed
      );
      metaPatch.tinderSetup = {
        ...metaPatch.tinderSetup,
        intent: normalizedIntent,
        lookingFor: getTinderIntentLabel(normalizedIntent),
      };
    }

    if (Object.keys(metaPatch).length > 0) {
      await this.upsertUserMeta(id, metaPatch);
    }

    return this.getPrimaryUser(id);
  }

  // --- Pets ---
  public async getUserPets(ownerId = 'user-test1') {
    const list = await prisma.pet.findMany({
      where: { ownerId },
      include: { vaccinations: true, behaviors: true, careRecords: true },
      orderBy: { createdAt: 'asc' },
    });
    return list.map((p) => this.formatPetOutput(p));
  }

  public async getPets() {
    const list = await prisma.pet.findMany({
      include: { vaccinations: true, behaviors: true, careRecords: true },
      orderBy: { createdAt: 'asc' },
    });
    return list.map((p) => this.formatPetOutput(p));
  }

  public async createPet(data: any) {
    const ownerId = data.ownerId || data.userId;
    if (!ownerId) {
      throw new Error('Thiếu thông tin chủ nuôi (ownerId) khi tạo hồ sơ thú cưng.');
    }

    let household = await prisma.household.findFirst({ where: { ownerId } });
    if (!household) {
      household = await prisma.household.create({
        data: {
          name: 'Tổ ấm thú cưng',
          ownerId,
        },
      });
    }

    const weightVal = data.weightKg != null && data.weightKg !== ''
      ? parseSafeWeightKg(data.weightKg ?? data.weightLabel)
      : null;
    let avatarUrl =
      data.avatarUrl ||
      (Array.isArray(data.galleryUrls) && data.galleryUrls[0]) ||
      '';
    if (avatarUrl && avatarUrl.startsWith('data:')) {
      avatarUrl = await cloudinaryService.uploadImage(avatarUrl, 'pawty/pets');
    }

    let galleryUrls =
      Array.isArray(data.galleryUrls) && data.galleryUrls.length > 0
        ? data.galleryUrls
        : (avatarUrl ? [avatarUrl] : []);
    if (Array.isArray(galleryUrls) && galleryUrls.length > 0) {
      galleryUrls = await cloudinaryService.uploadMultipleImages(galleryUrls, 'pawty/pets');
    }

    const speciesRaw = String(data.species || 'Chó').slice(0, 20);
    const genderRaw = String(data.gender || 'Đực').slice(0, 10);
    const vaccinationStatus =
      data.isVaccinatedAndRabies === true
        ? 'verified'
        : (data.vaccinationStatus || 'pending');

    const createdPet = await prisma.pet.create({
      data: {
        name: String(data.name || 'Boss').trim().slice(0, 50),
        species: speciesRaw,
        breed: String(data.breed || 'Chưa rõ').slice(0, 100),
        gender: genderRaw,
        householdId: data.householdId || household.id,
        ownerId,
        avatarUrl: avatarUrl || '',
        coverPhotoUrl: data.coverPhotoUrl || avatarUrl || '',
        weightKg: weightVal,
        isNeutered: Boolean(data.isSterilized ?? data.isNeutered ?? false),
        allergies: data.medicalHistory ? String(data.medicalHistory) : undefined,
        medicalNotes: data.bio ? String(data.bio) : undefined,
        vaccinationStatus,
        isPublic: true,
      },
    });

    const goodHabits: string[] = Array.isArray(data.goodHabits) ? data.goodHabits : [];
    const cautionHabits: string[] = Array.isArray(data.cautionHabits) ? data.cautionHabits : [];
    const behaviorRows = [
      ...goodHabits.map((label) => ({
        petId: createdPet.id,
        category: 'good',
        label: String(label).slice(0, 100),
      })),
      ...cautionHabits.map((label) => ({
        petId: createdPet.id,
        category: 'caution',
        label: String(label).slice(0, 100),
      })),
    ];
    if (behaviorRows.length > 0) {
      await prisma.petBehavior.createMany({ data: behaviorRows });
    }

    const vaccineRecords = Array.isArray(data.vaccineRecords) ? data.vaccineRecords : [];
    for (const vac of vaccineRecords) {
      await prisma.vaccination.create({
        data: {
          petId: createdPet.id,
          vaccineName: String(vac.name || vac.vaccineName || 'Vắc-xin phòng bệnh').slice(0, 100),
          dateGiven: new Date(),
          vetName: String(vac.clinic || vac.vetName || 'Phòng khám Thú Y').slice(0, 100),
          verified: true,
        },
      });
    }

    await prisma.careRecord.create({
      data: {
        petId: createdPet.id,
        recordedBy: ownerId,
        recordType: 'pet_profile_meta',
        title: 'Hồ sơ chi tiết thú cưng',
        isPrivate: false,
        dataJson: {
          customSpecies: data.customSpecies || undefined,
          birthDate: data.birthDate || '',
          ageLabel: data.ageLabel || (data.birthDate ? calculatePetAgeFromBirthDate(data.birthDate) : 'Chưa rõ'),
          weightKg: weightVal,
          weightLabel: weightVal !== null ? `${weightVal} kg` : 'Chưa rõ',
          furColor: data.furColor || '',
          bio: data.bio ? String(data.bio).slice(0, 160) : '',
          favoriteFood: data.favoriteFood || '',
          dewormingHistory: data.dewormingHistory || '',
          medicalHistory: data.medicalHistory || '',
          isSterilized: Boolean(data.isSterilized ?? false),
          isVaccinatedAndRabies: Boolean(data.isVaccinatedAndRabies ?? false),
          goodHabits,
          cautionHabits,
          galleryUrls,
          likesCount: 0,
          weightHistory:
            Array.isArray(data.weightHistory) && data.weightHistory.length > 0
              ? data.weightHistory
              : weightVal !== null
              ? [{ month: 'Hiện tại', weightKg: weightVal }]
              : [],
          vaccineRecords,
        },
      },
    });

    const fullPet = await prisma.pet.findUnique({
      where: { id: createdPet.id },
      include: { vaccinations: true, behaviors: true, careRecords: true },
    });
    return this.formatPetOutput(fullPet);
  }

  public async updatePet(petId: string, data: Record<string, any>) {
    const existingPet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { vaccinations: true, behaviors: true, careRecords: true },
    });
    if (!existingPet) {
      throw new Error('Không tìm thấy hồ sơ thú cưng trong cơ sở dữ liệu.');
    }

    const formattedCurrent = this.formatPetOutput(existingPet);
    const weightVal =
      data.weightKg !== undefined || data.weightLabel !== undefined
        ? parseSafeWeightKg(data.weightKg ?? data.weightLabel)
        : formattedCurrent.weightKg;

    const nextGalleryUrls = Array.isArray(data.galleryUrls)
      ? await cloudinaryService.uploadMultipleImages(data.galleryUrls, 'pawty/pets')
      : formattedCurrent.galleryUrls;
    const rawNextAvatar = data.avatarUrl || nextGalleryUrls[0] || existingPet.avatarUrl || formattedCurrent.avatarUrl;
    const nextAvatarUrl = rawNextAvatar
      ? await cloudinaryService.uploadImage(rawNextAvatar, 'pawty/pets')
      : rawNextAvatar;

    await prisma.pet.update({
      where: { id: petId },
      data: {
        name: data.name ? String(data.name).trim().slice(0, 50) : existingPet.name,
        species: data.species ? String(data.species).slice(0, 20) : existingPet.species,
        breed: data.breed !== undefined ? String(data.breed).slice(0, 100) : existingPet.breed,
        gender: data.gender ? String(data.gender).slice(0, 10) : existingPet.gender,
        weightKg: weightVal,
        avatarUrl: nextAvatarUrl,
        coverPhotoUrl: data.coverPhotoUrl || nextAvatarUrl,
        isNeutered:
          data.isSterilized !== undefined
            ? Boolean(data.isSterilized)
            : existingPet.isNeutered,
        allergies:
          data.medicalHistory !== undefined
            ? String(data.medicalHistory)
            : existingPet.allergies,
        medicalNotes:
          data.bio !== undefined ? String(data.bio).slice(0, 160) : existingPet.medicalNotes,
        vaccinationStatus:
          data.isVaccinatedAndRabies !== undefined
            ? data.isVaccinatedAndRabies
              ? 'verified'
              : 'pending'
            : existingPet.vaccinationStatus,
      },
    });

    const nextGoodHabits = Array.isArray(data.goodHabits)
      ? data.goodHabits
      : formattedCurrent.goodHabits;
    const nextCautionHabits = Array.isArray(data.cautionHabits)
      ? data.cautionHabits
      : formattedCurrent.cautionHabits;

    if (data.goodHabits !== undefined || data.cautionHabits !== undefined) {
      await prisma.petBehavior.deleteMany({ where: { petId } });
      const behaviorRows = [
        ...nextGoodHabits.map((label: string) => ({
          petId,
          category: 'good',
          label: String(label).slice(0, 100),
        })),
        ...nextCautionHabits.map((label: string) => ({
          petId,
          category: 'caution',
          label: String(label).slice(0, 100),
        })),
      ];
      if (behaviorRows.length > 0) {
        await prisma.petBehavior.createMany({ data: behaviorRows });
      }
    }

    const nextVaccineRecords = Array.isArray(data.vaccineRecords)
      ? data.vaccineRecords
      : formattedCurrent.vaccineRecords;

    const existingMetaRecord = existingPet.careRecords.find(
      (c) => c.recordType === 'pet_profile_meta'
    );
    const mergedMeta = {
      customSpecies:
        data.customSpecies !== undefined ? data.customSpecies : formattedCurrent.customSpecies,
      birthDate: data.birthDate !== undefined ? data.birthDate : formattedCurrent.birthDate,
      ageLabel: data.ageLabel !== undefined ? data.ageLabel : formattedCurrent.ageLabel,
      weightKg: weightVal,
      weightLabel:
        data.weightLabel !== undefined ? data.weightLabel : `${weightVal} kg`,
      furColor: data.furColor !== undefined ? data.furColor : formattedCurrent.furColor,
      bio: data.bio !== undefined ? String(data.bio).slice(0, 160) : formattedCurrent.bio,
      favoriteFood:
        data.favoriteFood !== undefined ? data.favoriteFood : formattedCurrent.favoriteFood,
      dewormingHistory:
        data.dewormingHistory !== undefined
          ? data.dewormingHistory
          : formattedCurrent.dewormingHistory,
      medicalHistory:
        data.medicalHistory !== undefined
          ? data.medicalHistory
          : formattedCurrent.medicalHistory,
      isSterilized:
        data.isSterilized !== undefined
          ? Boolean(data.isSterilized)
          : formattedCurrent.isSterilized,
      isVaccinatedAndRabies:
        data.isVaccinatedAndRabies !== undefined
          ? Boolean(data.isVaccinatedAndRabies)
          : formattedCurrent.isVaccinatedAndRabies,
      goodHabits: nextGoodHabits,
      cautionHabits: nextCautionHabits,
      galleryUrls: nextGalleryUrls,
      likesCount:
        data.likesCount !== undefined ? Number(data.likesCount) : formattedCurrent.likesCount,
      weightHistory: Array.isArray(data.weightHistory)
        ? data.weightHistory
        : formattedCurrent.weightHistory,
      vaccineRecords: nextVaccineRecords,
    };

    if (existingMetaRecord) {
      await prisma.careRecord.update({
        where: { id: existingMetaRecord.id },
        data: { dataJson: mergedMeta },
      });
    } else {
      await prisma.careRecord.create({
        data: {
          petId,
          recordedBy: existingPet.ownerId,
          recordType: 'pet_profile_meta',
          title: 'Hồ sơ chi tiết thú cưng',
          isPrivate: false,
          dataJson: mergedMeta,
        },
      });
    }

    const updated = await prisma.pet.findUnique({
      where: { id: petId },
      include: { vaccinations: true, behaviors: true, careRecords: true },
    });
    return this.formatPetOutput(updated);
  }

  public async deletePet(petId: string) {
    await prisma.careRecord.deleteMany({ where: { petId } });
    await prisma.careTask.deleteMany({ where: { petId } });
    await prisma.sosAlert.deleteMany({ where: { petId } });
    await prisma.petBehavior.deleteMany({ where: { petId } });
    await prisma.vaccination.deleteMany({ where: { petId } });
    await prisma.pet.delete({ where: { id: petId } });
    return { success: true };
  }

  public async addVaccination(petId: string, data: any) {
    return prisma.vaccination.create({
      data: {
        petId,
        vaccineName: String(data.vaccineName || data.name || 'Vắc-xin phòng bệnh').slice(0, 100),
        dateGiven: data.dateGiven ? new Date(data.dateGiven) : new Date(),
        nextDueDate: data.nextDueDate
          ? new Date(data.nextDueDate)
          : new Date(Date.now() + 365 * 86400000),
        vetName: String(data.clinicName || data.vetName || 'Phòng khám Thú Y').slice(0, 100),
        verified: true,
      },
    });
  }

  // --- Tasks ---
  public async getTasks() {
    return prisma.careTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createTask(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultPet = await prisma.pet.findFirst();
    const defaultHousehold = await prisma.household.findFirst();
    if (!defaultUser || !defaultPet || !defaultHousehold) {
      throw new Error('Cần tạo hồ sơ thú cưng trước khi tạo lịch nhắc chăm sóc.');
    }
    return prisma.careTask.create({
      data: {
        householdId: data.householdId || defaultHousehold.id,
        petId: data.petId || defaultPet.id,
        createdBy: data.createdBy || defaultUser.id,
        assignedTo: data.assignedTo || defaultUser.id,
        title: String(data.title || 'Công việc chăm sóc').slice(0, 200),
        description: data.dueTime ? `Giờ hẹn: ${data.dueTime}` : data.description,
        category: data.taskType || data.category || 'other',
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        status: 'pending',
      },
    });
  }

  public async completeTask(id: string, completedBy: string, note?: string) {
    return prisma.careTask.update({
      where: { id },
      data: {
        status: 'done',
        completedAt: new Date(),
        completedBy,
        completionNote: note,
      },
    });
  }

  // --- Posts, Reactions & Comments ---
  public async getPosts(_currentUserId?: string) {
    return prisma.post.findMany({
      include: {
        author: true,
        reactions: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createPost(data: any) {
    const authorId = data.authorId || data.userId;
    const author = authorId
      ? await prisma.user.findUnique({ where: { id: authorId } })
      : await prisma.user.findFirst();

    if (!author) {
      throw new Error('Không tìm thấy tài khoản người đăng bài trong cơ sở dữ liệu.');
    }

    const rawMediaUrls = Array.isArray(data.mediaUrls) ? data.mediaUrls.filter(Boolean) : [];
    const mediaUrls = await cloudinaryService.uploadMultipleImages(rawMediaUrls, 'pawty/posts');
    const hashtags = Array.isArray(data.hashtags)
      ? data.hashtags
      : Array.isArray(data.tags)
      ? data.tags
      : [];

    const created = await prisma.post.create({
      data: {
        authorId: author.id,
        contentType: String(data.contentType || 'moment').slice(0, 20),
        textContent: String(data.textContent ?? data.content ?? data.text ?? ''),
        media: mediaUrls.map((url: string, idx: number) => ({
          id: `m-${idx}`,
          type: url.startsWith('data:video') || /\.(mp4|mov|webm)(\?|$)/i.test(url) ? 'video' : 'image',
          url,
        })),
        hashtags,
        locationName: String(
          data.locationDistrict || data.locationName || author.neighborhood || 'TP. Hồ Chí Minh'
        ).slice(0, 200),
        hasHealthDisclaimer: Boolean(data.hasHealthDisclaimer),
        visibility: 'public',
      },
      include: {
        author: true,
        reactions: true,
        comments: { include: { author: true } },
      },
    });

    // Thông báo tới những người đang theo dõi tác giả
    const followSnap = await this.getFollowSnapshot();
    const followerIds = Array.from(followSnap.followersByUser.get(author.id) || []);
    if (followerIds.length > 0) {
      const senderHandle = formatUserHandle(author);
      await prisma.notification.createMany({
        data: followerIds.map((fid) => ({
          userId: fid,
          type: 'new_post',
          title: `${author.displayName} vừa đăng bài viết mới`,
          body: (created.textContent || 'Đã chia sẻ khoảnh khắc thú cưng mới trên Khám phá.').slice(
            0,
            140
          ),
          data: {
            category: 'follow',
            senderId: author.id,
            senderHandle,
            senderName: author.displayName,
            senderAvatar: author.avatarUrl,
            postId: created.id,
          },
        })),
      });
    }

    return created;
  }

  public async deletePost(postId: string, userId?: string) {
    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) return { success: true };
    if (userId && existing.authorId !== userId) {
      throw new Error('Bạn không có quyền xóa bài viết của người khác.');
    }
    await prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }

  public async togglePostReaction(postId: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Không tìm thấy bài viết.');

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      const count = await prisma.reaction.count({ where: { postId } });
      await prisma.post.update({ where: { id: postId }, data: { pawCount: count } });
      return { isLiked: false, likes: count };
    }

    await prisma.reaction.create({
      data: {
        userId,
        postId,
        reactionType: 'paw',
      },
    });
    const count = await prisma.reaction.count({ where: { postId } });
    await prisma.post.update({ where: { id: postId }, data: { pawCount: count } });

    if (post.authorId !== userId) {
      const actor = await prisma.user.findUnique({ where: { id: userId } });
      if (actor) {
        await this.createNotification({
          userId: post.authorId,
          type: 'post_reaction',
          title: `${actor.displayName} đã thả Paw bài viết của bạn`,
          body: (post.textContent || 'Khoảnh khắc thú cưng của bạn vừa nhận thêm lượt yêu thích.').slice(
            0,
            120
          ),
          data: {
            category: 'follow',
            senderId: actor.id,
            senderHandle: formatUserHandle(actor),
            senderName: actor.displayName,
            senderAvatar: actor.avatarUrl,
            postId: post.id,
          },
        });
      }
    }

    return { isLiked: true, likes: count };
  }

  public async addPostComment(postId: string, authorId: string, textContent: string, parentId?: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Không tìm thấy bài viết.');

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        textContent: textContent.trim(),
        parentId: parentId || null,
      },
      include: { author: true },
    });

    const commentCount = await prisma.comment.count({ where: { postId } });
    await prisma.post.update({ where: { id: postId }, data: { commentCount } });

    if (post.authorId !== authorId && comment.author) {
      await this.createNotification({
        userId: post.authorId,
        type: 'post_comment',
        title: `${comment.author.displayName} đã bình luận bài viết của bạn`,
        body: textContent.trim().slice(0, 140),
        data: {
          category: 'follow',
          senderId: comment.author.id,
          senderHandle: formatUserHandle(comment.author),
          senderName: comment.author.displayName,
          senderAvatar: comment.author.avatarUrl,
          postId: post.id,
        },
      });
    }

    return {
      id: comment.id,
      authorName: comment.author?.displayName || 'Cư dân Pawty',
      authorHandle: formatUserHandle(comment.author || {}),
      authorAvatar: comment.author?.avatarUrl || '',
      text: comment.textContent,
      createdAt: formatClockTime(comment.createdAt),
    };
  }

  // --- Social Graph: Friends, Unfriend & Follow ---
  public async sendFriendRequest(fromUserId: string, targetIdentifier: string) {
    const [sender, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: fromUserId } }),
      this.resolveUserByHandleOrId(targetIdentifier),
    ]);

    if (!sender || !target) {
      throw new Error('Không tìm thấy người dùng để gửi lời mời kết bạn.');
    }
    if (sender.id === target.id) {
      throw new Error('Không thể tự kết bạn với chính mình.');
    }

    const reverse = await prisma.match.findUnique({
      where: {
        userAId_userBId: {
          userAId: target.id,
          userBId: sender.id,
        },
      },
    });

    // Nếu đối phương đã gửi lời mời trước đó -> Tự động thành bạn bè luôn
    if (reverse && (reverse.status === 'friend_pending' || reverse.status === 'pending')) {
      return this.respondFriendRequest(sender.id, target.id, 'accept');
    }

    await prisma.match.upsert({
      where: {
        userAId_userBId: {
          userAId: sender.id,
          userBId: target.id,
        },
      },
      update: { status: 'friend_pending' },
      create: {
        userAId: sender.id,
        userBId: target.id,
        status: 'friend_pending',
      },
    });

    const senderHandle = formatUserHandle(sender);
    await this.createNotification({
      userId: target.id,
      type: 'friend_request',
      title: `${sender.displayName} đã gửi lời mời kết bạn`,
      body: 'Chấp nhận để trở thành bạn bè và nhắn tin cùng nhau trên Pawty.',
      data: {
        category: 'friend',
        status: 'pending',
        senderId: sender.id,
        senderHandle,
        senderName: sender.displayName,
        senderAvatar: sender.avatarUrl,
      },
    });

    return {
      success: true,
      friendStatus: 'pending_outgoing' as const,
      targetId: target.id,
      targetHandle: formatUserHandle(target),
    };
  }

  public async respondFriendRequest(
    userId: string,
    requesterIdentifier: string,
    action: 'accept' | 'decline',
    notificationId?: string
  ) {
    const [accepter, requester] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      this.resolveUserByHandleOrId(requesterIdentifier),
    ]);

    if (!accepter || !requester) {
      throw new Error('Không tìm thấy thông tin người dùng đối phương.');
    }

    // Cập nhật trạng thái của thông báo lời mời kết bạn
    const pendingNotifs = await prisma.notification.findMany({
      where: {
        userId: accepter.id,
        type: 'friend_request',
      },
    });
    for (const n of pendingNotifs) {
      const nData = (n.data && typeof n.data === 'object' ? n.data : {}) as Record<string, any>;
      if (
        n.id === notificationId ||
        nData.senderId === requester.id ||
        nData.senderHandle === formatUserHandle(requester)
      ) {
        await prisma.notification.update({
          where: { id: n.id },
          data: {
            isRead: true,
            data: {
              ...nData,
              status: action === 'accept' ? 'accepted' : 'declined',
            },
          },
        });
      }
    }

    if (action === 'decline') {
      await prisma.match.updateMany({
        where: {
          userAId: requester.id,
          userBId: accepter.id,
        },
        data: { status: 'declined' },
      });
      return { success: true, friendStatus: 'none' as const };
    }

    // Accept -> Upsert cả 2 chiều sang 'matched'
    await prisma.match.upsert({
      where: {
        userAId_userBId: {
          userAId: requester.id,
          userBId: accepter.id,
        },
      },
      update: { status: 'matched' },
      create: {
        userAId: requester.id,
        userBId: accepter.id,
        status: 'matched',
      },
    });

    await prisma.match.upsert({
      where: {
        userAId_userBId: {
          userAId: accepter.id,
          userBId: requester.id,
        },
      },
      update: { status: 'matched' },
      create: {
        userAId: accepter.id,
        userBId: requester.id,
        status: 'matched',
      },
    });

    const conv = await this.ensureDirectConversation(
      accepter.id,
      requester.id,
      'Hai bạn đã trở thành bạn bè! Hãy gửi lời chào đầu tiên.'
    );

    await this.createNotification({
      userId: requester.id,
      type: 'friend_accepted',
      title: `${accepter.displayName} đã chấp nhận lời mời kết bạn`,
      body: 'Hai bạn giờ đã có thể nhắn tin và hẹn dắt thú cưng đi dạo cùng nhau!',
      data: {
        category: 'friend',
        status: 'accepted',
        senderId: accepter.id,
        senderHandle: formatUserHandle(accepter),
        senderName: accepter.displayName,
        senderAvatar: accepter.avatarUrl,
        conversationId: conv.id,
      },
    });

    return {
      success: true,
      friendStatus: 'accepted' as const,
      conversationId: conv.id,
    };
  }

  public async unfriendUsers(userId: string, targetIdentifier: string) {
    const target = await this.resolveUserByHandleOrId(targetIdentifier);
    if (!target) {
      throw new Error('Không tìm thấy tài khoản cần hủy kết bạn.');
    }

    await prisma.match.updateMany({
      where: {
        OR: [
          { userAId: userId, userBId: target.id },
          { userAId: target.id, userBId: userId },
        ],
      },
      data: { status: 'unfriended' },
    });

    // Nếu chưa từng có bản ghi Match nhưng có phòng chat cũ, tạo dấu vết unfriended để chặn chat
    const existingCount = await prisma.match.count({
      where: {
        OR: [
          { userAId: userId, userBId: target.id },
          { userAId: target.id, userBId: userId },
        ],
      },
    });
    if (existingCount === 0) {
      await prisma.match.create({
        data: {
          userAId: userId,
          userBId: target.id,
          status: 'unfriended',
        },
      });
    }

    return {
      success: true,
      targetId: target.id,
      targetHandle: formatUserHandle(target),
      friendStatus: 'none' as const,
    };
  }

  /**
   * Bỏ tương hợp (Hủy Match) triệt để:
   * 1. Xóa sạch 100% tin nhắn giữa hai người trong PostgreSQL
   * 2. Xóa cuộc trò chuyện khỏi bảng conversations
   * 3. Đánh dấu status = 'unmatched' vĩnh viễn cả 2 chiều để không bao giờ xuất hiện lại trong Tinder/Tìm kiếm
   */
  public async unmatchUsers(userId: string, targetIdentifier: string) {
    const target = await this.resolveUserByHandleOrId(targetIdentifier);
    if (!target) {
      throw new Error('Không tìm thấy tài khoản cần hủy tương hợp.');
    }

    // 1. Tìm các cuộc trò chuyện giữa 2 người
    const convs = await prisma.conversation.findMany({
      where: {
        participantIds: { hasEvery: [userId, target.id] },
      },
    });

    for (const conv of convs) {
      // 2. Xóa sạch 100% tin nhắn giữa hai người
      await prisma.message.deleteMany({
        where: { conversationId: conv.id },
      });
      // 3. Xóa cuộc trò chuyện
      await prisma.conversation.delete({
        where: { id: conv.id },
      });
    }

    // 4. Xóa các match cũ và ghi nhận trạng thái 'unmatched' vĩnh viễn cho cả 2 chiều
    await prisma.match.deleteMany({
      where: {
        OR: [
          { userAId: userId, userBId: target.id },
          { userAId: target.id, userBId: userId },
        ],
      },
    });

    await prisma.match.createMany({
      data: [
        { userAId: userId, userBId: target.id, status: 'unmatched' },
        { userAId: target.id, userBId: userId, status: 'unmatched' },
      ],
      skipDuplicates: true,
    });

    return {
      success: true,
      message: 'Đã hủy tương hợp, xóa toàn bộ tin nhắn và ẩn người dùng khỏi kết quả tìm kiếm.',
      targetId: target.id,
      targetHandle: formatUserHandle(target),
    };
  }

  public async toggleFollow(followerId: string, targetIdentifier: string) {
    const [follower, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      this.resolveUserByHandleOrId(targetIdentifier),
    ]);
    if (!follower || !target) {
      throw new Error('Không tìm thấy người dùng để theo dõi.');
    }
    if (follower.id === target.id) {
      throw new Error('Không thể tự theo dõi chính mình.');
    }

    const existingEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId: follower.id,
        eventType: 'user_follow',
      },
    });
    const matchedRow = existingEvents.find(
      (ev) =>
        ev.eventData &&
        typeof ev.eventData === 'object' &&
        (ev.eventData as any).targetUserId === target.id
    );

    if (matchedRow) {
      await prisma.analyticsEvent.delete({ where: { id: matchedRow.id } });
      return { success: true, isFollowing: false, targetId: target.id };
    }

    await prisma.analyticsEvent.create({
      data: {
        userId: follower.id,
        eventType: 'user_follow',
        eventData: { targetUserId: target.id },
      },
    });

    await this.createNotification({
      userId: target.id,
      type: 'follow',
      title: `${follower.displayName} đã bắt đầu theo dõi bạn`,
      body: 'Hãy ghé thăm trang cá nhân để xem hồ sơ thú cưng của họ.',
      data: {
        category: 'follow',
        senderId: follower.id,
        senderHandle: formatUserHandle(follower),
        senderName: follower.displayName,
        senderAvatar: follower.avatarUrl,
      },
    });

    return { success: true, isFollowing: true, targetId: target.id };
  }

  // --- User & Pet Sync Helper ---
  public async findOrCreateUserAndPet(params: {
    phone?: string;
    displayName?: string;
    petName?: string;
    species?: string;
    breed?: string;
    avatarUrl?: string;
  }) {
    const rawPhone = params.phone || '0909123456';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '0909123456';

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { phone: rawPhone }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone.slice(0, 15),
          displayName: (params.displayName || 'Chủ nuôi Pawty').slice(0, 50),
          bio: 'Thành viên cộng đồng Pawty',
          district: 'Hồ Chí Minh',
          neighborhood: 'Khu đô thị',
        },
      });
    }

    let household = await prisma.household.findFirst({
      where: { ownerId: user.id },
    });
    if (!household) {
      household = await prisma.household.create({
        data: {
          name: `Nhà của ${user.displayName}`,
          ownerId: user.id,
        },
      });
    }

    const petName = (params.petName || 'Boss').trim().slice(0, 50);
    let pet = await prisma.pet.findFirst({
      where: {
        ownerId: user.id,
        name: petName,
      },
    });

    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: petName,
          species: (params.species || 'Chó').slice(0, 20),
          breed: (params.breed || 'Chưa rõ').slice(0, 100),
          ownerId: user.id,
          householdId: household.id,
          avatarUrl: params.avatarUrl,
        },
      });
    }

    return { user, pet };
  }

  // --- SOS Alerts (100% Free + AI Photo Description Only) ---
  public async getSosAlerts() {
    return prisma.sosAlert.findMany({
      include: {
        user: true,
        pet: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createSosAlert(data: any) {
    if (data.imageUrl && typeof data.imageUrl === 'string') {
      data.imageUrl = await cloudinaryService.uploadImage(data.imageUrl, 'pawty/sos');
    }
    if (data.photoUrl && typeof data.photoUrl === 'string') {
      data.photoUrl = await cloudinaryService.uploadImage(data.photoUrl, 'pawty/sos');
    }
    let userId = data.userId;
    let petId = data.petId;

    if (userId && !petId) {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (existingUser) {
        let household = await prisma.household.findFirst({ where: { ownerId: userId } });
        if (!household) {
          household = await prisma.household.create({
            data: { name: `Nhà của ${existingUser.displayName}`, ownerId: userId },
          });
        }
        const pName = String(data.petName || 'Boss').trim().slice(0, 50);
        let pet = await prisma.pet.findFirst({ where: { ownerId: userId, name: pName } });
        if (!pet) {
          pet = await prisma.pet.create({
            data: {
              name: pName,
              species: String(data.species || 'Chó').slice(0, 20),
              breed: String(data.breed || 'Chưa rõ').slice(0, 100),
              ownerId: userId,
              householdId: household.id,
              avatarUrl: data.imageUrl,
            },
          });
        }
        petId = pet.id;
      }
    }

    if (!userId || !petId) {
      const synced = await this.findOrCreateUserAndPet({
        phone: data.userPhone || data.contactPhone || data.ownerPhone,
        displayName: data.userName || data.ownerName,
        petName: data.petName,
        species: data.species,
        breed: data.breed,
        avatarUrl: data.imageUrl,
      });
      userId = synced.user.id;
      petId = synced.pet.id;
    }

    const createdSos = await prisma.sosAlert.create({
      data: {
        userId,
        petId,
        lastSeenLocation: String(data.lastSeenLocation || 'Khu vực lân cận').slice(0, 255),
        radiusKm: Number(data.radiusKm || 5),
        description: String(data.description || 'Thất lạc thú cưng, mong cộng đồng hỗ trợ tìm kiếm.'),
        rewardText: String(data.rewardText || data.rewardAmount || 'Hậu tạ chân thành').slice(
          0,
          255
        ),
        feePaidVnd: 0,
        status: 'active',
        visualSignatures: {
          imageUrl: data.imageUrl || null,
          ownerPhone: data.ownerPhone || data.contactPhone || null,
          ownerName: data.ownerName || null,
          petName: data.petName || null,
          species: data.species || null,
          breed: data.breed || null,
        },
        sightings: [],
      },
      include: {
        user: true,
        pet: true,
      },
    });

    // Gửi thông báo SOS miễn phí tới toàn bộ cộng đồng
    const communityUsers = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true },
    });
    if (communityUsers.length > 0) {
      await prisma.notification.createMany({
        data: communityUsers.map((cu) => ({
          userId: cu.id,
          type: 'sos_alert',
          title: `🚨 Khẩn cấp: Tìm bé ${createdSos.pet?.name || data.petName || 'thú cưng'} bị lạc`,
          body: `Khu vực: ${createdSos.lastSeenLocation}. Nhấn để xem ảnh và hỗ trợ chủ nuôi!`,
          data: {
            category: 'sos',
            sosAlertId: createdSos.id,
            senderId: userId,
            senderName: createdSos.user?.displayName || 'Chủ nuôi Pawty',
            senderHandle: createdSos.user ? formatUserHandle(createdSos.user) : undefined,
          },
        })),
      });
    }

    return createdSos;
  }

  public async addSosSighting(
    sosId: string,
    payload: { reporterName: string; phone: string; note: string; reporterId?: string }
  ) {
    const sos = await prisma.sosAlert.findUnique({
      where: { id: sosId },
      include: { pet: true },
    });
    if (!sos) throw new Error('Không tìm thấy tin báo SOS.');

    const currentSightings = Array.isArray(sos.sightings) ? (sos.sightings as any[]) : [];
    const newItem = {
      id: `sight-${Date.now()}`,
      reporterName: payload.reporterName || 'Cư dân hỗ trợ',
      phone: payload.phone,
      note: payload.note,
      time: formatClockTime(new Date()),
    };
    const updatedSightings = [newItem, ...currentSightings];

    const updatedSos = await prisma.sosAlert.update({
      where: { id: sosId },
      data: { sightings: updatedSightings },
      include: { user: true, pet: true },
    });

    if (sos.userId !== payload.reporterId) {
      await this.createNotification({
        userId: sos.userId,
        type: 'sos_sighting',
        title: `📍 Có manh mối mới về bé ${sos.pet?.name || 'thú cưng'}!`,
        body: `${newItem.reporterName} (${newItem.phone}): ${newItem.note}`.slice(0, 160),
        data: {
          category: 'sos',
          sosAlertId: sos.id,
          senderId: payload.reporterId,
          senderName: newItem.reporterName,
        },
      });
    }

    return { sighting: newItem, sos: updatedSos };
  }

  public async markSosResolved(sosId: string) {
    const updated = await prisma.sosAlert.update({
      where: { id: sosId },
      data: { status: 'resolved' },
      include: { user: true, pet: true },
    });
    return updated;
  }

  // --- Tinder Candidates, Likes You & Matching ---
  private buildTinderCandidateOutput(
    u: any,
    meta: Record<string, any>,
    hasLikedMe: boolean,
    indexSeed = 0
  ) {
    const candidatePets = (u.pets || []).map((p: any) => {
      const formatted = this.formatPetOutput(p);
      return {
        id: formatted.id,
        name: formatted.name,
        species: formatted.species,
        breed: formatted.breed,
        ageLabel: formatted.ageLabel,
        weightKg: formatted.weightKg,
        imageUrl: formatted.avatarUrl,
        isVaccinatedAndRabies: formatted.isVaccinatedAndRabies,
      };
    });

    const tSetup = meta.tinderSetup || {};
    if (tSetup.datingPetId && Array.isArray(candidatePets)) {
      candidatePets.sort((a: any, b: any) =>
        a.id === tSetup.datingPetId ? -1 : b.id === tSetup.datingPetId ? 1 : 0
      );
    }
    const intent = normalizeTinderIntent(tSetup.intent || tSetup.lookingFor || u.primaryNeed);
    const intentLabel = getTinderIntentLabel(intent);

    const deterministicDistances = [0.8, 1.5, 2.4, 3.8, 5.2, 8.6, 12.0];
    const distanceKm = deterministicDistances[indexSeed % deterministicDistances.length];

    const resolvedGender = (tSetup.gender ||
      meta.gender ||
      (indexSeed % 2 === 1 ? 'Nam' : 'Nữ')) as 'Nam' | 'Nữ' | 'Khác';

    const customPhotos = (
      Array.isArray(tSetup.photos) && tSetup.photos.length > 0
        ? tSetup.photos
        : Array.isArray(tSetup.photoUrls)
        ? tSetup.photoUrls
        : []
    ).filter(Boolean);

    const defaultOwnerPhoto = u.avatarUrl || '';
    const photoUrls = customPhotos.length > 0 ? customPhotos : (defaultOwnerPhoto ? [defaultOwnerPhoto] : []);

    const rawName = tSetup.displayName || u.displayName || 'Bạn mới';
    const cleanOwnerName = cleanDisplayName(rawName);
    const rawNick = tSetup.displayName || meta.occupation || '';
    const cleanNick = cleanDisplayName(rawNick);
    const finalNickname = cleanNick.toLowerCase() === cleanOwnerName.toLowerCase() ? '' : cleanNick;

    return {
      id: u.id,
      ownerName: cleanOwnerName,
      ownerHandle: formatUserHandle(u),
      ownerAge: Number(tSetup.age || meta.age || 24),
      gender: resolvedGender,
      ownerNickname: finalNickname,
      avatarUrl: photoUrls[0] || u.avatarUrl || '',
      photoUrls,
      distanceKm,
      area: u.neighborhood || u.district || 'TP. Hồ Chí Minh',
      intent,
      intentLabel,
      lookingFor: intentLabel,
      bio:
        tSetup.bio ||
        u.bio ||
        'Yêu thích thú cưng và mong muốn tìm bạn cùng dắt dạo công viên.',
      lifestyle: {
        smoking: tSetup.smoking || 'Không hút thuốc',
        workout: tSetup.workout || 'Dắt thú đi bộ mỗi chiều',
        drinking: tSetup.drinking || 'Thỉnh thoảng giao lưu',
        petSummary:
          candidatePets.map((p: any) => `${p.name} (${p.breed})`).join(', ') || 'Yêu thú cưng',
        zodiac: tSetup.zodiac || meta.zodiac || 'Sư Tử',
        chatStyle: tSetup.chatStyle || 'Thân thiện, phản hồi nhanh',
      },
      pets: candidatePets,
      tags:
        Array.isArray(tSetup.tags) && tSetup.tags.length > 0
          ? tSetup.tags
          : ['#ThânThiện', '#ĐãTiêmPhòng', '#HộiYêuBoss'],
      hasLikedMe,
    };
  }

  public async getTinderCandidates(
    currentUserId = 'user-test1',
    intentFilter?: string,
    genderFilter?: string
  ) {
    const [incomingLikes, alreadySwipedOrMatched, userMetaMap] = await Promise.all([
      prisma.match.findMany({
        where: {
          userBId: currentUserId,
          status: { in: ['pending', 'friend_pending'] },
        },
        select: { userAId: true },
      }),
      // Loại trừ tất cả những người mà currentUserId đã quẹt (userAId === currentUserId: pending, rejected, matched, v.v.)
      // và những người đã match thành công với currentUserId (userBId === currentUserId và status: matched)
      prisma.match.findMany({
        where: {
          OR: [
            { userAId: currentUserId },
            { userBId: currentUserId, status: 'matched' },
          ],
        },
        select: { userAId: true, userBId: true },
      }),
      this.getUserMetaMap(),
    ]);

    const excludedUserIds = new Set<string>();
    alreadySwipedOrMatched.forEach((m) => {
      if (m.userAId === currentUserId) {
        // currentUserId đã quẹt m.userBId -> loại trừ khỏi cọc thẻ
        excludedUserIds.add(m.userBId);
      }
      if (m.userBId === currentUserId) {
        // m.userAId đã match với currentUserId -> loại trừ khỏi cọc thẻ
        excludedUserIds.add(m.userAId);
      }
    });

    const usersWhoLikedMe = new Set(
      incomingLikes.map((m) => m.userAId).filter((id) => !excludedUserIds.has(id))
    );

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId, notIn: Array.from(excludedUserIds) },
      },
      include: {
        pets: {
          include: { vaccinations: true, behaviors: true, careRecords: true },
        },
      },
    });

    const candidates = users
      .map((u, idx) =>
        this.buildTinderCandidateOutput(u, userMetaMap[u.id] || {}, usersWhoLikedMe.has(u.id), idx)
      )
      .filter((candidate) => {
        const uMeta = userMetaMap[candidate.id] || {};
        if (uMeta.privacySettings?.tinderVisibility === false) return false;
        if (intentFilter && intentFilter !== 'all') {
          if (normalizeTinderIntent(candidate.intent) !== normalizeTinderIntent(intentFilter)) {
            return false;
          }
        }
        if (genderFilter && genderFilter !== 'all' && genderFilter !== 'Mọi người') {
          const isTargetFemale =
            genderFilter === 'female' ||
            genderFilter === 'Nữ' ||
            genderFilter === 'nu' ||
            genderFilter === 'N?';
          const isTargetMale =
            genderFilter === 'male' || genderFilter === 'Nam' || genderFilter === 'nam';
          if (isTargetFemale && candidate.gender !== 'Nữ') return false;
          if (isTargetMale && candidate.gender !== 'Nam') return false;
        }
        return true;
      });

    return candidates;
  }

  public async getLikesYouCandidates(currentUserId = 'user-test1') {
    const [incomingRows, myRows, unmatchedMatches, userMetaMap] = await Promise.all([
      prisma.match.findMany({
        where: {
          userBId: currentUserId,
          status: { in: ['pending', 'friend_pending'] },
        },
      }),
      prisma.match.findMany({
        where: {
          userAId: currentUserId,
          status: { in: ['matched', 'rejected', 'unmatched'] },
        },
        select: { userBId: true },
      }),
      prisma.match.findMany({
        where: {
          OR: [
            { userAId: currentUserId, status: 'unmatched' },
            { userBId: currentUserId, status: 'unmatched' },
          ],
        },
        select: { userAId: true, userBId: true },
      }),
      this.getUserMetaMap(),
    ]);

    const unmatchedIds = new Set<string>();
    unmatchedMatches.forEach((m) => {
      if (m.userAId !== currentUserId) unmatchedIds.add(m.userAId);
      if (m.userBId !== currentUserId) unmatchedIds.add(m.userBId);
    });

    const excludedIds = new Set([...myRows.map((r) => r.userBId), ...Array.from(unmatchedIds)]);
    const likerIds = Array.from(
      new Set(incomingRows.map((r) => r.userAId).filter((id) => !excludedIds.has(id)))
    );

    if (likerIds.length === 0) return [];

    const users = await prisma.user.findMany({
      where: { id: { in: likerIds } },
      include: {
        pets: {
          include: { vaccinations: true, behaviors: true, careRecords: true },
        },
      },
    });

    return users.map((u, idx) =>
      this.buildTinderCandidateOutput(u, userMetaMap[u.id] || {}, true, idx)
    );
  }

  private async ensureDirectConversation(
    userAId: string,
    userBId: string,
    defaultGreeting: string,
    convType: 'dating' | 'direct' = 'direct'
  ) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: { hasEvery: [userAId, userBId] },
        type: convType,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: convType,
          participantIds: [userAId, userBId],
          lastMessageText: defaultGreeting,
          lastMessageAt: new Date(),
        },
      });
    }
    return conversation;
  }

  public async recordSwipe(userId: string, targetUserId: string, direction: 'left' | 'right') {
    const status = direction === 'right' ? 'pending' : 'rejected';

    const match = await prisma.match.upsert({
      where: {
        userAId_userBId: {
          userAId: userId,
          userBId: targetUserId,
        },
      },
      update: { status },
      create: {
        userAId: userId,
        userBId: targetUserId,
        status,
      },
    });

    if (direction === 'right') {
      const reverseMatch = await prisma.match.findUnique({
        where: {
          userAId_userBId: {
            userAId: targetUserId,
            userBId: userId,
          },
        },
      });

      if (
        reverseMatch &&
        ['pending', 'friend_pending', 'matched'].includes(reverseMatch.status)
      ) {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: 'matched' },
        });
        await prisma.match.update({
          where: { id: reverseMatch.id },
          data: { status: 'matched' },
        });

        const conversation = await this.ensureDirectConversation(
          userId,
          targetUserId,
          'Bạn và đối phương vừa tương hợp! Hãy gửi lời chào đầu tiên.',
          'dating'
        );

        const [userA, userB] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId } }),
          prisma.user.findUnique({ where: { id: targetUserId } }),
        ]);

        if (userA && userB) {
          await Promise.all([
            this.createNotification({
              userId: userA.id,
              type: 'match',
              title: `🎉 Tương hợp mới với ${userB.displayName}!`,
              body: 'Hai bạn đã thích nhau trên Kết nối. Nhấn để bắt đầu trò chuyện ngay!',
              data: {
                category: 'friend',
                status: 'matched',
                senderId: userB.id,
                senderHandle: formatUserHandle(userB),
                senderName: userB.displayName,
                senderAvatar: userB.avatarUrl,
                conversationId: conversation.id,
              },
            }),
            this.createNotification({
              userId: userB.id,
              type: 'match',
              title: `🎉 Tương hợp mới với ${userA.displayName}!`,
              body: 'Hai bạn đã thích nhau trên Kết nối. Nhấn để bắt đầu trò chuyện ngay!',
              data: {
                category: 'friend',
                status: 'matched',
                senderId: userA.id,
                senderHandle: formatUserHandle(userA),
                senderName: userA.displayName,
                senderAvatar: userA.avatarUrl,
                conversationId: conversation.id,
              },
            }),
          ]);
        }

        return {
          isMatch: true,
          match,
          conversationId: conversation.id,
        };
      }
    }

    return { isMatch: false, match };
  }

  public async rewindSwipe(userId: string, targetUserId: string) {
    await prisma.match.deleteMany({
      where: {
        userAId: userId,
        userBId: targetUserId,
      },
    });

    const reverseMatch = await prisma.match.findUnique({
      where: {
        userAId_userBId: {
          userAId: targetUserId,
          userBId: userId,
        },
      },
    });

    if (reverseMatch && reverseMatch.status === 'matched') {
      await prisma.match.update({
        where: { id: reverseMatch.id },
        data: { status: 'pending' },
      });
    }

    return { success: true, message: 'Hoàn tác thành công' };
  }

  // --- Chats & Messages ---
  public async canUsersMessageEachOther(userAId: string, userBId: string): Promise<boolean> {
    if (!userAId || !userBId || userAId === userBId) return true;
    const rows = await prisma.match.findMany({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });

    // Nếu đã bỏ match thì chặn vĩnh viễn không cho nhắn tin lại
    if (rows.some((r) => r.status === 'unmatched')) {
      return false;
    }
    // Mạng xã hội theo kiểu Pinterest / Facebook: nhắn tin mở trực tiếp không cần kết bạn
    return true;
  }

  public async getChats(userId = 'user-test1') {
    const [conversations, allMatches, userMetaMap] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          participantIds: { has: userId },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.match.findMany({
        where: {
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      }),
      this.getUserMetaMap(),
    ]);

    const result = [];
    for (const conv of conversations) {
      const partnerId = conv.participantIds.find((id) => id !== userId) || conv.participantIds[0];
      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        include: { pets: true },
      });

      const chatType: 'dating' | 'social' = conv.type === 'dating' ? 'dating' : 'social';
      const rawPartnerName = chatType === 'dating' ? (userMetaMap[partnerId]?.tinderSetup?.displayName || partner?.displayName || 'Bạn mới') : (partner?.displayName || 'Bạn mới');
      const partnerName = cleanDisplayName(rawPartnerName);
      const partnerHandle = partner ? formatUserHandle(partner) : '@user';
      const petSummary =
        partner?.pets && partner.pets.length > 0
          ? partner.pets.map((p) => `${p.name} (${p.breed || p.species})`).join(', ')
          : 'Thành viên cộng đồng Pawty';

      const pairMatches = allMatches.filter(
        (m) =>
          (m.userAId === userId && m.userBId === partnerId) ||
          (m.userAId === partnerId && m.userBId === userId)
      );

      // Nếu đã bỏ match thì cuộc trò chuyện đã bị xóa và không bao giờ xuất hiện lại
      if (pairMatches.some((m) => m.status === 'unmatched')) {
        continue;
      }

      // Phân định rõ ràng chatType dựa vào type thực tế lưu trong Conversation:
      // conv.type === 'dating' -> Hẹn hò (bắt nguồn từ Tinder Match)
      // conv.type === 'direct' -> Mạng xã hội (tự do)
      const isMatched = pairMatches.some((m) => m.status === 'matched');
      const canMessage = true; // Mạng xã hội nhắn tin trực tiếp tự do

      let candidateProfile: any = null;
      if (partner) {
        candidateProfile = this.buildTinderCandidateOutput(
          partner,
          userMetaMap[partnerId] || {},
          false,
          0
        );
      }

      // Tách biệt avatar theo đúng phân hệ:
      // - Hồ sơ hẹn hò: dùng ảnh thẻ hẹn hò (photoUrls[0] hoặc tinderSetup.photos[0])
      // - Hồ sơ mạng xã hội: dùng ảnh đại diện người dùng (partner.avatarUrl)
      let partnerAvatar = partner?.avatarUrl || '';
      if (chatType === 'dating') {
        const datingPhotos =
          userMetaMap[partnerId]?.tinderSetup?.photos ||
          userMetaMap[partnerId]?.tinderSetup?.photoUrls;
        if (Array.isArray(datingPhotos) && datingPhotos.length > 0 && datingPhotos[0]) {
          partnerAvatar = datingPhotos[0];
        } else if (
          candidateProfile &&
          Array.isArray(candidateProfile.photoUrls) &&
          candidateProfile.photoUrls.length > 0
        ) {
          partnerAvatar = candidateProfile.photoUrls[0];
        }
      }

      const messagesFormatted = conv.messages.map((m) => ({
        id: m.id,
        sender: (m.senderId === userId ? 'me' : 'them') as 'me' | 'them',
        text: m.text,
        mediaUrl: m.mediaUrl || undefined,
        time: formatClockTime(m.createdAt),
        isRead: m.isRead,
        createdAt: m.createdAt,
      }));

      result.push({
        id: conv.id,
        partnerId,
        partnerName,
        partnerHandle,
        partnerNickname: cleanDisplayName(userMetaMap[partnerId]?.occupation || partnerName),
        partnerAvatar,
        petSummary,
        distanceLabel: partner?.neighborhood || 'Gần khu vực của bạn',
        isOnline: true,
        canMessage,
        isFriend: isMatched,
        unreadCount: conv.messages.filter((m) => m.senderId !== userId && !m.isRead).length,
        matchSource: (chatType === 'dating' ? 'tinder_match' : 'friend') as
          | 'friend'
          | 'tinder_match'
          | 'service',
        chatType,
        candidateProfile,
        messages: messagesFormatted,
      });
    }

    return result;
  }

  public async openOrCreateDirectChat(
    userId: string,
    partnerIdentifier: string,
    chatType: 'social' | 'dating' = 'social'
  ) {
    const partner = await this.resolveUserByHandleOrId(partnerIdentifier);
    if (!partner) {
      throw new Error('Không tìm thấy người dùng để mở cuộc trò chuyện.');
    }
    const canMsg = await this.canUsersMessageEachOther(userId, partner.id);
    const targetConvType = chatType === 'dating' ? 'dating' : 'direct';
    let conv = await prisma.conversation.findFirst({
      where: {
        participantIds: { hasEvery: [userId, partner.id] },
        type: targetConvType,
      },
    });
    if (!conv && canMsg) {
      conv = await prisma.conversation.create({
        data: {
          type: targetConvType,
          participantIds: [userId, partner.id],
          lastMessageText:
            chatType === 'dating'
              ? 'Hai bạn đã tương hợp trên Kết nối!'
              : 'Bắt đầu cuộc trò chuyện mới',
          lastMessageAt: new Date(),
        },
      });
    }
    return {
      conversationId: conv?.id || null,
      canMessage: canMsg,
      partnerId: partner.id,
      partnerHandle: formatUserHandle(partner),
    };
  }

  public async getChatMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async markConversationAsRead(conversationId: string, userId = 'user-test1') {
    let conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      conv = await prisma.conversation.findFirst({
        where: {
          participantIds: { hasEvery: [userId, conversationId] },
        },
      });
    }

    if (!conv) {
      return { success: false, message: 'Conversation not found' };
    }

    await prisma.message.updateMany({
      where: {
        conversationId: conv.id,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }

  public async sendChatMessage(
    conversationId: string,
    senderId: string,
    text: string,
    mediaUrl?: string
  ) {
    let conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      const targetUser = await this.resolveUserByHandleOrId(conversationId);
      const partnerId = targetUser?.id || conversationId;
      conv = await prisma.conversation.findFirst({
        where: {
          participantIds: { hasEvery: [senderId, partnerId] },
        },
      });

      if (!conv) {
        const canCreate = await this.canUsersMessageEachOther(senderId, partnerId);
        if (!canCreate) {
          const err = new Error(
            'Hai bạn đã hủy kết bạn nên không thể tiếp tục nhắn tin cho nhau.'
          );
          (err as any).code = 'UNFRIENDED_CANNOT_MESSAGE';
          throw err;
        }
        conv = await prisma.conversation.create({
          data: {
            type: 'direct',
            participantIds: [senderId, partnerId],
            lastMessageText: text || '[Hình ảnh]',
            lastMessageAt: new Date(),
          },
        });
      }
    }

    const partnerId = conv.participantIds.find((id) => id !== senderId);
    if (partnerId) {
      const allowed = await this.canUsersMessageEachOther(senderId, partnerId);
      if (!allowed) {
        const err = new Error(
          'Hai bạn đã hủy kết bạn nên không thể tiếp tục nhắn tin cho nhau.'
        );
        (err as any).code = 'UNFRIENDED_CANNOT_MESSAGE';
        throw err;
      }
    }

    let safeMediaUrl = mediaUrl;
    if (safeMediaUrl && typeof safeMediaUrl === 'string') {
      safeMediaUrl = await cloudinaryService.uploadImage(safeMediaUrl, 'pawty/chat');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId,
        text,
        mediaUrl: safeMediaUrl,
        isRead: false,
      },
    });

    await prisma.conversation.update({
      where: { id: conv.id },
      data: {
        lastMessageText: text || '[Hình ảnh]',
        lastMessageAt: new Date(),
      },
    });

    return {
      ...message,
      time: formatClockTime(message.createdAt),
    };
  }

  public async clearConversationMessages(conversationId: string, _userId?: string) {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) {
      return { success: true, deletedCount: 0 };
    }
    const deleted = await prisma.message.deleteMany({
      where: { conversationId: conv.id },
    });
    await prisma.conversation.update({
      where: { id: conv.id },
      data: {
        lastMessageText: '',
        lastMessageAt: new Date(),
      },
    });
    return { success: true, deletedCount: deleted.count };
  }

  // --- Notifications ---
  public async createNotification(params: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, any>;
  }) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type.slice(0, 30),
        title: params.title.slice(0, 200),
        body: params.body || '',
        data: params.data || {},
        isRead: false,
      },
    });
  }

  public async getNotifications(userId = 'user-test1') {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((n) => {
      const payload =
        n.data && typeof n.data === 'object' ? (n.data as Record<string, any>) : {};
      let category: 'friend' | 'follow' | 'sos' | 'system' = payload.category || 'system';
      if (!payload.category) {
        if (['friend_request', 'friend_accepted', 'match'].includes(n.type)) {
          category = 'friend';
        } else if (['follow', 'post_reaction', 'post_comment', 'new_post'].includes(n.type)) {
          category = 'follow';
        } else if (['sos_alert', 'sos_sighting', 'sos'].includes(n.type)) {
          category = 'sos';
        }
      }

      return {
        id: n.id,
        title: n.title,
        body: n.body || '',
        time: formatClockTime(n.createdAt),
        createdAt: n.createdAt,
        isRead: n.isRead,
        type: n.type || 'system',
        category,
        actionPayload: payload,
      };
    });
  }

  public async markNotificationRead(id: string) {
    await prisma.notification.updateMany({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  }

  public async markAllNotificationsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  public async deleteNotification(id: string) {
    await prisma.notification.deleteMany({ where: { id } });
    return { success: true };
  }

  public async clearAllNotifications(userId: string) {
    await prisma.notification.deleteMany({ where: { userId } });
    return { success: true };
  }
}

export const dbService = new DatabaseService();
