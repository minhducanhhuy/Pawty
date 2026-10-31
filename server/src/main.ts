import http from 'http';
import { URL } from 'url';
import { ModerationService } from './modules/moderation/moderation.service';
import { PawRankAndSpatialService } from './modules/social/pawrank.service';
import { PetTracingService } from './modules/sos/pet-tracing.service';
import { GeminiVisionService } from './modules/sos/gemini-vision.service';
import { dbService, prisma } from './data/db-service';

const moderationService = new ModerationService();
const spatialService = new PawRankAndSpatialService();
const petTracingService = new PetTracingService();
const geminiVisionService = new GeminiVisionService();

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
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const data = await dbService.getBootstrapData(userId);
      sendJson(res, 200, data);
      return;
    }

    // 1. Auth Endpoints
    // 1. Auth Endpoints: Đăng nhập bằng SĐT / Username + Password
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const identifier = String(body.identifier || body.phone || body.username || '').trim();
      const password = String(body.password || '').trim();

      if (!identifier) {
        sendJson(res, 400, {
          success: false,
          error: 'Vui lòng nhập Số điện thoại hoặc Tên đăng nhập.',
        });
        return;
      }

      const user = await dbService.authenticateUser(identifier, password);
      if (!user) {
        sendJson(res, 401, {
          success: false,
          error: 'Số điện thoại / tên đăng nhập hoặc mật khẩu không chính xác.',
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        token: 'jwt-pawty-access-token',
        refresh_token: 'jwt-pawty-refresh-token',
        user,
        message: `Chào mừng ${user.displayName} đăng nhập thành công.`,
      });
      return;
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseJsonBody(req);
      const phone = String(body.phone || '').trim();
      const username = body.username ? String(body.username).trim() : undefined;
      const password = String(body.password || 'password123').trim();
      const displayName = String(body.displayName || body.name || `Người dùng ${phone.slice(-4)}`).trim();

      if (!phone) {
        sendJson(res, 400, {
          success: false,
          error: 'Vui lòng cung cấp số điện thoại đăng ký.',
        });
        return;
      }

      // Kiểm tra trùng lặp
      const existing = await dbService.findUserByIdentifier(username || phone);
      if (existing) {
        sendJson(res, 409, {
          success: false,
          error: 'Số điện thoại hoặc tên đăng nhập này đã được sử dụng.',
        });
        return;
      }

      const user = await dbService.createUser({
        phone,
        username,
        password,
        displayName,
        district: String(body.district || 'TP. Thủ Đức'),
        neighborhood: String(body.neighborhood || 'Vinhomes Grand Park'),
      });

      // Tạo thú cưng nếu có thông tin đính kèm
      if (body.petName && typeof body.petName === 'string' && body.petName.trim()) {
        await dbService.createPet({
          ownerId: user.id,
          name: body.petName.trim(),
          species: String(body.petSpecies || 'Chó'),
          breed: String(body.petBreed || 'Golden Retriever'),
          weightKg: Number(body.petWeightKg || 10),
        });
      }

      sendJson(res, 201, {
        success: true,
        token: 'jwt-pawty-access-token',
        refresh_token: 'jwt-pawty-refresh-token',
        user,
        message: 'Đăng ký tài khoản thành công.',
      });
      return;
    }

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

    if (pathname === '/api/auth/register-or-sync' && method === 'POST') {
      const body = await parseJsonBody(req);
      const synced = await dbService.findOrCreateUserAndPet({
        phone: typeof body.phone === 'string' ? body.phone : undefined,
        displayName: typeof body.name === 'string' ? body.name : typeof body.displayName === 'string' ? body.displayName : undefined,
        petName: typeof body.petName === 'string' ? body.petName : undefined,
        species: typeof body.petSpecies === 'string' ? body.petSpecies : typeof body.species === 'string' ? body.species : undefined,
        breed: typeof body.petBreed === 'string' ? body.petBreed : typeof body.breed === 'string' ? body.breed : undefined,
      });
      sendJson(res, 200, { success: true, user: synced.user, pet: synced.pet });
      return;
    }

    // 2. Users & Privacy Endpoints (Luật BVDLCN 91/2025/QH15)
    if (pathname === '/api/users/me' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const user = await dbService.getPrimaryUser(userId);
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
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const pets = userId ? await dbService.getUserPets(userId) : await dbService.getPets();
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

        if (pathname === '/api/ai/describe-pet' && method === 'POST') {
      const body = await parseJsonBody(req);
      const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : undefined;
      const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : undefined;
      const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg';

      if (!imageUrl && !imageBase64) {
        sendJson(res, 400, { error: 'Vui lòng cung cấp imageUrl hoặc imageBase64 để AI phân tích' });
        return;
      }

      try {
        console.log('[Pawty Server] 🧠 Đang phân tích ảnh qua Gemini Vision...');
        const aiResult = await geminiVisionService.generateSosPetDescription(imageUrl, imageBase64, mimeType);
        if (!aiResult) {
          sendJson(res, 500, {
            success: false,
            error: 'Khóa GEMINI_API_KEY không khả dụng hoặc bị lỗi. Vui lòng kiểm tra server/.env!',
          });
          return;
        }
        console.log(`[Pawty Server] ✅ Phân tích thành công: ${aiResult.species} - ${aiResult.breed}`);
        sendJson(res, 200, {
          success: true,
          ...aiResult,
        });
        return;
      } catch (err: any) {
        const message = err && err.message ? err.message : String(err);
        console.error('[Pawty Server] ❌ Lỗi Gemini:', message);
        sendJson(res, 500, {
          success: false,
          error: message || 'Lỗi khi kết nối Google Gemini API',
        });
        return;
      }
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


    // 7. Tinder Candidates & Matches
    if (pathname === '/api/tinder/candidates' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-mai';
      const intent = parsedUrl.searchParams.get('intent') || undefined;
      const candidates = await dbService.getTinderCandidates(userId, intent);
      sendJson(res, 200, { candidates });
      return;
    }

    if (pathname === '/api/matches/swipe' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || 'user-mai');
      const candidateId = String(body.candidateId || body.targetUserId || '');
      const direction = (body.direction || 'right') as 'left' | 'right';
      if (!candidateId) {
        sendJson(res, 400, { error: 'candidateId is required' });
        return;
      }
      const result = await dbService.recordSwipe(userId, candidateId, direction);
      sendJson(res, 200, result);
      return;
    }

    if ((pathname === '/api/matches/rewind' || pathname === '/api/tinder/rewind') && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || 'user-mai');
      const candidateId = String(body.candidateId || body.targetUserId || '');
      if (!candidateId) {
        sendJson(res, 400, { error: 'candidateId is required' });
        return;
      }
      const result = await dbService.rewindSwipe(userId, candidateId);
      sendJson(res, 200, result);
      return;
    }

    // 8. Chats & Messages
    if (pathname === '/api/chats' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-mai';
      const chats = await dbService.getChats(userId);
      sendJson(res, 200, { chats });
      return;
    }

    const chatMsgMatch = pathname.match(/^\/api\/chats\/([^/]+)\/messages$/);
    if (chatMsgMatch && method === 'GET') {
      const conversationId = chatMsgMatch[1];
      const messages = await dbService.getChatMessages(conversationId);
      sendJson(res, 200, { messages });
      return;
    }

    if (chatMsgMatch && method === 'POST') {
      const conversationId = chatMsgMatch[1];
      const body = await parseJsonBody(req);
      const senderId = String(body.senderId || 'user-mai');
      const text = String(body.text || '');
      const mediaUrl = body.mediaUrl ? String(body.mediaUrl) : undefined;
      if (!text && !mediaUrl) {
        sendJson(res, 400, { error: 'Text or media is required' });
        return;
      }
      const message = await dbService.sendChatMessage(conversationId, senderId, text, mediaUrl);
      sendJson(res, 201, { message });
      return;
    }

    const chatReadMatch = pathname.match(/^\/api\/chats\/([^/]+)\/read$/);
    if (chatReadMatch && (method === 'POST' || method === 'PUT')) {
      const conversationId = chatReadMatch[1];
      const body = await parseJsonBody(req);
      const userId = String(body.userId || parsedUrl.searchParams.get('userId') || 'user-mai');
      const result = await dbService.markConversationAsRead(conversationId, userId);
      sendJson(res, 200, result);
      return;
    }

    // 9. Notifications
    if (pathname === '/api/notifications' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-mai';
      const notifications = await dbService.getNotifications(userId);
      sendJson(res, 200, { notifications });
      return;
    }

    // 10. Admin Metrics from PostgreSQL
    if (pathname === '/api/admin/metrics' && method === 'GET') {
      const [totalUsers, totalPets, totalPosts, activeSos] = await Promise.all([
        prisma.user.count(),
        prisma.pet.count(),
        prisma.post.count(),
        prisma.sosAlert.count({ where: { status: 'active' } }),
      ]);
      sendJson(res, 200, {
        metrics: {
          totalUsers,
          totalPets,
          totalPosts,
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
