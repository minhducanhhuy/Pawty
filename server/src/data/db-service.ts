import { PrismaClient } from '@prisma/client';
import type { SocialPost, SosAlert, Species } from '@pawty/types';

export const prisma = new PrismaClient();

export class DatabaseService {
  public async getBootstrapData() {
    const [users, pets, circleMembers, tasks, posts, sosAlerts] =
      await Promise.all([
        prisma.user.findMany(),
        prisma.pet.findMany({
          include: { vaccinations: true, behaviors: true },
        }),
        prisma.circleMember.findMany(),
        prisma.careTask.findMany(),
        prisma.post.findMany({
          include: { comments: true, reactions: true, sightingMatches: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.sosAlert.findMany({
          include: { matchedPosts: true, trajectories: true },
        }),
      ]);

    return {
      users,
      pets,
      circleMembers,
      circleActivities: [],
      tasks,
      posts,
      groups: [],
      radarCandidates: [],
      matches: [],
      places: [],
      sosAlerts,
      reports: [],
      metrics: {
        totalUsers: users.length,
        totalPets: pets.length,
        totalPosts: posts.length,
        activeSos: sosAlerts.filter((s) => s.status === 'active').length,
      },
    };
  }

  // --- Users ---
  public async getPrimaryUser() {
    return prisma.user.findFirst();
  }

  public async findUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  public async createUser(phone: string, displayName?: string) {
    return prisma.user.create({
      data: {
        phone,
        displayName: displayName || `Người dùng ${phone.slice(-4)}`,
        district: 'TP. Thủ Đức',
        neighborhood: 'Vinhomes Grand Park',
        role: 'user',
        status: 'active',
      },
    });
  }

  public async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // --- Pets ---
  public async getPets() {
    return prisma.pet.findMany({
      include: { vaccinations: true, behaviors: true },
    });
  }

  public async createPet(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultHousehold = await prisma.household.findFirst();
    return prisma.pet.create({
      data: {
        name: data.name || 'Boss',
        species: data.species || 'dog',
        breed: data.breed || 'Chưa rõ',
        gender: data.gender || 'male',
        householdId: data.householdId || defaultHousehold?.id || '',
        ownerId: data.ownerId || defaultUser?.id || '',
        avatarUrl: data.avatarUrl,
        vaccinationStatus: data.vaccinationStatus || 'unknown',
      },
      include: { vaccinations: true, behaviors: true },
    });
  }

  public async addVaccination(petId: string, data: any) {
    return prisma.vaccination.create({
      data: {
        petId,
        vaccineName: data.vaccineName || 'Vắc-xin phòng bệnh',
        dateGiven: data.dateGiven ? new Date(data.dateGiven) : new Date(),
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : new Date(Date.now() + 365 * 86400000),
        vetName: data.clinicName || data.vetName || 'Phòng khám Thú Y',
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
    return prisma.careTask.create({
      data: {
        householdId: data.householdId || defaultHousehold?.id || '',
        petId: data.petId || defaultPet?.id || '',
        createdBy: data.createdBy || defaultUser?.id || '',
        assignedTo: data.assignedTo || defaultUser?.id || '',
        title: data.title || 'Công việc chăm sóc',
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

  // --- Posts ---
  public async getPosts() {
    return prisma.post.findMany({
      include: { sightingMatches: true, reactions: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createPost(data: any) {
    const defaultUser = await prisma.user.findFirst();
    return prisma.post.create({
      data: {
        authorId: data.authorId || defaultUser?.id || '',
        contentType: data.contentType || 'moment',
        textContent: data.textContent,
        media: data.mediaUrls?.map((url: string, idx: number) => ({ id: `m-${idx}`, type: 'image', url })) || [],
        hashtags: data.hashtags || [],
        locationName: data.locationDistrict || 'Vinhomes Grand Park',
        hasHealthDisclaimer: Boolean(data.hasHealthDisclaimer),
        visibility: 'public',
      },
      include: { sightingMatches: true },
    });
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
          displayName: params.displayName || 'Chủ nuôi Pawty',
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

    const petName = (params.petName || 'Boss').trim();
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
          species: params.species || 'Chó',
          breed: params.breed || 'Chưa rõ',
          ownerId: user.id,
          householdId: household.id,
          avatarUrl: params.avatarUrl,
        },
      });
    }

    return { user, pet };
  }

  // --- SOS Alerts ---
  public async getSosAlerts() {
    return prisma.sosAlert.findMany({
      include: {
        user: true,
        pet: true,
        matchedPosts: true,
        trajectories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createSosAlert(data: any) {
    let userId = data.userId;
    let petId = data.petId;

    if (!userId || !petId) {
      const synced = await this.findOrCreateUserAndPet({
        phone: data.userPhone || data.contactPhone,
        displayName: data.userName || data.ownerName,
        petName: data.petName,
        species: data.species,
        breed: data.breed,
        avatarUrl: data.imageUrl,
      });
      userId = synced.user.id;
      petId = synced.pet.id;
    }

    return prisma.sosAlert.create({
      data: {
        id: data.id || `sos-${Date.now()}`,
        userId,
        petId,
        lastSeenLocation: data.lastSeenLocation || 'Khu vực nội khu',
        radiusKm: data.radiusKm || 3,
        description: data.description || 'Thất lạc thú cưng',
        rewardText: data.rewardText || data.rewardAmount || '1.000.000đ',
        status: data.status || 'active',
        visualSignatures: data.visualSignatures || null,
        sightings: [],
      },
      include: {
        user: true,
        pet: true,
        matchedPosts: true,
        trajectories: true,
      },
    });
  }

  public async getSosTrajectory(sosAlertId: string) {
    return prisma.sightingTrajectory.findFirst({
      where: { sosAlertId },
    });
  }

  public async updateMatchDecision(matchId: string, decision: string) {
    return prisma.petSightingMatch.update({
      where: { id: matchId },
      data: { status: decision },
    });
  }
}

export const dbService = new DatabaseService();
