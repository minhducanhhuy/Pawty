import { PrismaClient } from '@prisma/client';
import type { SocialPost, SosAlert, Species } from '@pawty/types';

export const prisma = new PrismaClient();

export class DatabaseService {
  public async getBootstrapData() {
    const [users, pets, circleMembers, tasks, posts, partners, bookings, sosAlerts] =
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
        prisma.partner.findMany(),
        prisma.booking.findMany(),
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
      walkAppointments: [],
      partners,
      places: [],
      bookings,
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

  // --- SOS Alerts ---
  public async getSosAlerts() {
    return prisma.sosAlert.findMany({
      include: { matchedPosts: true, trajectories: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createSosAlert(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultPet = await prisma.pet.findFirst();
    return prisma.sosAlert.create({
      data: {
        userId: data.userId || defaultUser?.id || '',
        petId: data.petId || defaultPet?.id || '',
        lastSeenLocation: data.lastSeenLocation || 'Khu vực nội khu',
        radiusKm: data.radiusKm || 3,
        description: data.description || 'Thất lạc thú cưng',
        rewardText: data.rewardText || '1.000.000đ',
        status: 'active',
        visualSignatures: data.visualSignatures || null,
        sightings: [],
      },
      include: { matchedPosts: true, trajectories: true },
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

  // --- Partners & Bookings ---
  public async getPartners() {
    return prisma.partner.findMany();
  }

  public async getBookings() {
    return prisma.booking.findMany({
      include: { partner: true, pet: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createBooking(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultPet = await prisma.pet.findFirst();
    const defaultPartner = await prisma.partner.findFirst();
    return prisma.booking.create({
      data: {
        userId: data.userId || defaultUser?.id || '',
        petId: data.petId || defaultPet?.id || '',
        partnerId: data.partnerId || defaultPartner?.id || '',
        serviceName: data.serviceName || 'Dịch vụ thú cưng',
        servicePrice: Number(data.servicePrice || 200000),
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
        status: 'confirmed',
      },
    });
  }
}

export const dbService = new DatabaseService();

