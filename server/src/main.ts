import http from 'http';
import { URL } from 'url';
import { ModerationService } from './modules/moderation/moderation.service';
import { PawRankAndSpatialService } from './modules/social/pawrank.service';
import { PetTracingService } from './modules/sos/pet-tracing.service';
import { dbService, prisma } from './data/db-service';

const moderationService = new ModerationService();
const spatialService = new PawRankAndSpatialService();
const petTracingService = new PetTracingService();

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

async function parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    const parsedUrl = new URL(req.url || '/', 'http://localhost:3000');
    const pathname = parsedUrl.pathname;
    const method = req.method || 'GET';

    // 0. Health & Full Ecosystem Bootstrap (PostgreSQL 16 + PostGIS)
    if (pathname === '/api/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'ok',
        service: 'Pawty API Gateway (PostgreSQL 16 + Prisma + PostGIS)',
        layers: ['Care', 'Circle', 'Local', 'Services', 'Pro'],
        database: 'PostgreSQL 16 (pawty) @ 127.0.0.1:5432',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (pathname === '/api/bootstrap' && method === 'GET') {
      const data = await dbService.getBootstrapData();
      sendJson(res, 200, data);
      return;
    }

    // 1. Auth Endpoints
    if (pathname === '/api/auth/send-otp' && method === 'POST') {
      const body = await parseJsonBody(req);
      sendJson(res, 200, {
        success: true,
        otp_demo: '1234',
        message: `Đã gửi mã OTP 4 số tới ${String(body.phone || '0912345678')}`,
      });
      return;
    }

    if (pathname === '/api/auth/verify-otp' && method === 'POST') {
      const body = await parseJsonBody(req);
      const phone = String(body.phone || '0912345678');
      let user = await dbService.findUserByPhone(phone);
      let isNew = false;
      if (!user) {
        isNew = true;
        user = await dbService.createUser(phone);
      }
      sendJson(res, 200, {
        token: 'jwt-pawty-access-token',
        refresh_token: 'jwt-pawty-refresh-token',
        user,
        is_new: isNew,
      });
      return;
    }

    if (pathname === '/api/auth/refresh' && method === 'POST') {
      sendJson(res, 200, { token: `jwt-pawty-access-${Date.now()}` });
      return;
    }

    if (pathname === '/api/auth/logout' && method === 'DELETE') {
      sendJson(res, 200, { success: true });
      return;
    }

    // 2. Users & Privacy Endpoints (Luật BVDLCN 91/2025/QH15)
    if (pathname === '/api/users/me' && method === 'GET') {
      const user = await dbService.getPrimaryUser();
      sendJson(res, 200, { user });
      return;
    }

    if (pathname === '/api/users/me' && method === 'PUT') {
      const body = await parseJsonBody(req);
      const primaryUser = await dbService.getPrimaryUser();
      if (!primaryUser) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const updatedUser = await dbService.updateUser(primaryUser.id, body);
      sendJson(res, 200, { user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/location' && method === 'PUT') {
      const body = await parseJsonBody(req);
      const primaryUser = await dbService.getPrimaryUser();
      if (!primaryUser) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const updatedUser = await dbService.updateUser(primaryUser.id, {
        district: body.district ? String(body.district) : primaryUser.district,
        neighborhood: body.neighborhood ? String(body.neighborhood) : primaryUser.neighborhood,
      });
      sendJson(res, 200, { user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/privacy' && method === 'PUT') {
      const body = await parseJsonBody(req);
      const primaryUser = await dbService.getPrimaryUser();
      if (!primaryUser) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const updatedUser = await dbService.updateUser(primaryUser.id, {
        showLocation: body.showLocation !== undefined ? Boolean(body.showLocation) : primaryUser.showLocation,
        showPhone: body.showPhone !== undefined ? Boolean(body.showPhone) : primaryUser.showPhone,
        allowMessages: body.allowMessages ? String(body.allowMessages) : primaryUser.allowMessages,
      });
      sendJson(res, 200, { user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/data-export' && method === 'POST') {
      const data = await dbService.getBootstrapData();
      sendJson(res, 200, {
        compliance: 'Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15',
        exportedAt: new Date().toISOString(),
        data,
      });
      return;
    }

    if (pathname === '/api/users/me' && method === 'DELETE') {
      sendJson(res, 200, {
        success: true,
        message: 'Yêu cầu xóa tài khoản đã được ghi nhận theo Luật BVDLCN 91/2025/QH15.',
      });
      return;
    }

    // 3. Pets & Vaccinations
    if (pathname === '/api/pets' && method === 'GET') {
      const pets = await dbService.getPets();
      sendJson(res, 200, { pets });
      return;
    }

    if (pathname === '/api/pets' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newPet = await dbService.createPet(body);
      sendJson(res, 201, { pet: newPet });
      return;
    }

    const petVacMatch = pathname.match(/^\/api\/pets\/([^/]+)\/vaccinations$/);
    if (petVacMatch && method === 'POST') {
      const petId = petVacMatch[1];
      const body = await parseJsonBody(req);
      const vaccination = await dbService.addVaccination(petId, body);
      sendJson(res, 201, { vaccination });
      return;
    }

    // 4. Circle Members & Care Tasks
    if (pathname === '/api/circle/members' && method === 'GET') {
      const members = await prisma.circleMember.findMany();
      sendJson(res, 200, { members });
      return;
    }

    if (pathname === '/api/tasks' && method === 'GET') {
      const tasks = await dbService.getTasks();
      sendJson(res, 200, { tasks });
      return;
    }

    if (pathname === '/api/tasks' && method === 'POST') {
      const body = await parseJsonBody(req);
      const task = await dbService.createTask(body);
      sendJson(res, 201, { task });
      return;
    }

    const taskCompleteMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);
    if (taskCompleteMatch && method === 'POST') {
      const taskId = taskCompleteMatch[1];
      const body = await parseJsonBody(req);
      const primaryUser = await dbService.getPrimaryUser();
      const task = await dbService.completeTask(
        taskId,
        String(body.completedBy || primaryUser?.id || 'user-mai'),
        body.note ? String(body.note) : undefined
      );
      sendJson(res, 200, { task });
      return;
    }

    // 5. Social Feed Posts & AI Sighting Scanner
    if (
      (pathname === '/api/posts/feed' || pathname === '/api/posts/explore' || pathname === '/api/posts') &&
      method === 'GET'
    ) {
      const posts = await dbService.getPosts();
      sendJson(res, 200, { posts });
      return;
    }

    if (pathname === '/api/posts' && method === 'POST') {
      const body = await parseJsonBody(req);
      const textContent = String(body.text || body.textContent || '');
      const contentType = (body.contentType || body.content_type || 'moment') as 'moment' | 'question' | 'tip';
      const decision = moderationService.moderatePost({
        textContent,
        contentType,
      });

      if (decision.status === 'rejected') {
        sendJson(res, 400, {
          allowed: false,
          reason: decision.reason,
        });
        return;
      }

      const newPost = await dbService.createPost({
        textContent,
        contentType,
        hasHealthDisclaimer: decision.hasHealthDisclaimer,
        mediaUrls:
          Array.isArray(body.mediaUrls) && body.mediaUrls.length > 0
            ? body.mediaUrls
            : ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80'],
        hashtags: Array.isArray(body.hashtags) ? body.hashtags : ['#PawtyLocal', '#KhoảnhKhắcBoss'],
        locationDistrict: body.locationDistrict || 'TP. Thủ Đức (Quận 9)',
      });

      // AI Multimodal Sighting Scanner (Google Gemini 2.5 Flash)
      try {
        const socialPostFormat = {
          id: newPost.id,
          authorId: newPost.authorId,
          textContent: newPost.textContent || '',
          media: (newPost.media as any[]) || [],
          locationName: newPost.locationName || 'Vinhomes Grand Park',
          locationCoords: { lat: 10.8428, lng: 106.8286 },
          createdAt: newPost.createdAt.toISOString(),
          likesCount: newPost.pawCount,
          commentsCount: newPost.commentCount,
          sharesCount: newPost.shareCount,
          pawRankScore: 99,
        };

        const activeSos = await prisma.sosAlert.findMany({
          where: { status: 'active' },
          include: { matchedPosts: true, trajectories: true },
        });

        const matches = await petTracingService.scanPostForSosMatchesAsync(
          socialPostFormat as any,
          activeSos as any
        );

        if (matches.length > 0) {
          console.log(
            `[Pawty AI Scanner] Phát hiện ${matches.length} manh mối nghi vấn trong PostgreSQL từ bài đăng ${newPost.id}!`
          );
          for (const m of matches) {
            await prisma.petSightingMatch.create({
              data: {
                id: m.id,
                sosAlertId: m.sosAlertId,
                postId: newPost.id,
                matchScore: m.matchScore,
                visualSimilarity: m.visualSimilarity,
                textSimilarity: m.textSimilarity,
                kinematicPlausibility: m.kinematicPlausibility,
                detectedLocationName: m.detectedLocationName,
                detectedCoords: m.detectedCoords as any,
                status: 'pending_review',
              },
            });

            // Tự động tính toán & cập nhật lộ trình di chuyển thời gian thực vào PostgreSQL
            const targetSos = await prisma.sosAlert.findUnique({
              where: { id: m.sosAlertId },
              include: { matchedPosts: true },
            });
            if (targetSos) {
              const trajectory = petTracingService.buildTrajectory(targetSos as any);
              await prisma.sightingTrajectory.upsert({
                where: { id: `traj-${targetSos.id}` },
                create: {
                  id: `traj-${targetSos.id}`,
                  sosAlertId: targetSos.id,
                  points: trajectory.trajectoryPoints as any,
                  totalDistanceMeters: trajectory.totalDistanceMeters,
                },
                update: {
                  points: trajectory.trajectoryPoints as any,
                  totalDistanceMeters: trajectory.totalDistanceMeters,
                },
              });
            }
          }
        }
      } catch (scanErr: any) {
        console.warn('[Pawty AI Scanner] Quét bài đăng thất bại:', scanErr.message);
      }

      sendJson(res, 201, { post: newPost });
      return;
    }

    // 6. SOS Alerts & Trajectory Tracing
    if (pathname === '/api/sos' && method === 'GET') {
      const sosAlerts = await dbService.getSosAlerts();
      sendJson(res, 200, { sosAlerts });
      return;
    }

    if (pathname === '/api/sos' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newSos = await dbService.createSosAlert(body);
      sendJson(res, 201, { sos: newSos });
      return;
    }

    const sosTrajectoryMatch = pathname.match(/^\/api\/sos\/([^/]+)\/trajectory$/);
    if (sosTrajectoryMatch && method === 'GET') {
      const sosId = sosTrajectoryMatch[1];
      const trajectory = await dbService.getSosTrajectory(sosId);
      if (!trajectory) {
        const sos = await prisma.sosAlert.findUnique({
          where: { id: sosId },
          include: { matchedPosts: true },
        });
        if (!sos) {
          sendJson(res, 404, { error: 'SOS alert not found' });
          return;
        }
        const built = petTracingService.buildTrajectory(sos as any);
        sendJson(res, 200, { trajectory: built });
        return;
      }
      sendJson(res, 200, { trajectory });
      return;
    }

    const sosMatchDecision = pathname.match(/^\/api\/sos\/([^/]+)\/match-decision$/);
    if (sosMatchDecision && method === 'POST') {
      const sosId = sosMatchDecision[1];
      const body = await parseJsonBody(req);
      const { matchId, decision } = body;
      await dbService.updateMatchDecision(String(matchId), String(decision));
      const sos = await prisma.sosAlert.findUnique({
        where: { id: sosId },
        include: { matchedPosts: true, trajectories: true },
      });
      sendJson(res, 200, { success: true, sos });
      return;
    }

    if (pathname === '/api/ai/trace-pet' && method === 'POST') {
      const body = await parseJsonBody(req);
      const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : undefined;
      const text = typeof body.text === 'string' ? body.text : '';
      const visualSignatures = await petTracingService.extractVisualSignatureWithAI(imageUrl, text);
      const detectedLocation = petTracingService.geocodeLocationFromText(text, body.coords as any);
      sendJson(res, 200, {
        visualSignatures,
        detectedLocation,
      });
      return;
    }

    // 7. Partners & Bookings
    if (pathname === '/api/partners' && method === 'GET') {
      const partners = await dbService.getPartners();
      sendJson(res, 200, { partners });
      return;
    }

    if (pathname === '/api/bookings' && method === 'GET') {
      const bookings = await dbService.getBookings();
      sendJson(res, 200, { bookings });
      return;
    }

    if (pathname === '/api/bookings' && method === 'POST') {
      const body = await parseJsonBody(req);
      const booking = await dbService.createBooking(body);
      sendJson(res, 201, { booking });
      return;
    }

    // 8. Admin Metrics from PostgreSQL
    if (pathname === '/api/admin/metrics' && method === 'GET') {
      const [totalUsers, totalPets, totalPosts, totalBookings, activeSos] = await Promise.all([
        prisma.user.count(),
        prisma.pet.count(),
        prisma.post.count(),
        prisma.booking.count(),
        prisma.sosAlert.count({ where: { status: 'active' } }),
      ]);
      sendJson(res, 200, {
        metrics: {
          totalUsers,
          totalPets,
          totalPosts,
          totalBookings,
          activeSos,
        },
      });
      return;
    }

    sendJson(res, 404, { error: 'Endpoint not found', path: pathname });
  } catch (error) {
    console.error('[Pawty Server] Unhandled request error:', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

const PORT = Number(process.env.PORT || 3000);
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Pawty Server] API Gateway (PostgreSQL 16) running at http://0.0.0.0:${PORT}/api/health`);
  });
}

export { server };
