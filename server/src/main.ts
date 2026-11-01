import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

import http from 'http';
import { URL } from 'url';
import { ModerationService } from './modules/moderation/moderation.service';
import { GeminiVisionService } from './modules/sos/gemini-vision.service';
import { dbService, prisma } from './data/db-service';

const moderationService = new ModerationService();
const geminiVisionService = new GeminiVisionService();

const MAX_BODY_BYTES = 35 * 1024 * 1024;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

async function parseJsonBody(req: http.IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error('Dung lượng dữ liệu gửi lên vượt quá giới hạn 35MB.'));
        req.destroy();
        return;
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });

    req.on('error', (err) => {
      reject(err);
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

    // 0. Health & Full Ecosystem Bootstrap (PostgreSQL + PostGIS)
    if (pathname === '/api/health' && method === 'GET') {
      await prisma.$queryRaw`SELECT 1`;
      sendJson(res, 200, {
        status: 'ok',
        service: 'Pawty API Gateway (PostgreSQL + Prisma)',
        database: 'PostgreSQL (pawty) @ 127.0.0.1:5432',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (pathname === '/api/bootstrap' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const data = await dbService.getBootstrapData(userId);
      if (userId && !data.user) {
        sendJson(res, 401, {
          success: false,
          error:
            'Tài khoản không tồn tại trong cơ sở dữ liệu PostgreSQL. Vui lòng đăng nhập lại.',
        });
        return;
      }
      sendJson(res, 200, data);
      return;
    }

    // 1. Auth Endpoints
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
      const password = String(body.password || '123456').trim();
      const displayName = String(
        body.displayName || body.name || `Người dùng ${phone.slice(-4)}`
      ).trim();

      if (!phone) {
        sendJson(res, 400, {
          success: false,
          error: 'Vui lòng cung cấp số điện thoại đăng ký.',
        });
        return;
      }

      const existingByPhone = await dbService.findUserByPhone(phone);
      const existingByUsername = username
        ? await dbService.findUserByIdentifier(username)
        : null;
      if (existingByPhone || existingByUsername) {
        sendJson(res, 409, {
          success: false,
          error: 'Số điện thoại hoặc tên đăng nhập này đã được sử dụng.',
        });
        return;
      }

      const createdUser = await dbService.createUser({
        phone,
        username,
        password,
        displayName,
        district: String(body.district || 'TP. Thủ Đức'),
        neighborhood: String(body.neighborhood || body.area || 'Vinhomes Grand Park, TP. Thủ Đức'),
      });

      if (createdUser && body.petName && typeof body.petName === 'string' && body.petName.trim()) {
        await dbService.createPet({
          ownerId: createdUser.id,
          name: body.petName.trim(),
          species: String(body.petSpecies || 'Chó'),
          breed: String(body.petBreed || 'Golden Retriever'),
          weightKg: body.petWeightKg,
          gender: body.petGender || 'Đực',
        });
      }

      const hydratedUser = createdUser
        ? await dbService.getPrimaryUser(createdUser.id)
        : createdUser;

      sendJson(res, 201, {
        success: true,
        token: 'jwt-pawty-access-token',
        refresh_token: 'jwt-pawty-refresh-token',
        user: hydratedUser,
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
      let user: any = await dbService.findUserByPhone(phone);
      let isNew = false;
      if (!user) {
        isNew = true;
        user = await dbService.createUser(phone);
      } else {
        user = await dbService.getPrimaryUser(user.id);
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
        displayName:
          typeof body.name === 'string'
            ? body.name
            : typeof body.displayName === 'string'
            ? body.displayName
            : undefined,
        petName: typeof body.petName === 'string' ? body.petName : undefined,
        species:
          typeof body.petSpecies === 'string'
            ? body.petSpecies
            : typeof body.species === 'string'
            ? body.species
            : undefined,
        breed:
          typeof body.petBreed === 'string'
            ? body.petBreed
            : typeof body.breed === 'string'
            ? body.breed
            : undefined,
      });
      sendJson(res, 200, { success: true, user: synced.user, pet: synced.pet });
      return;
    }

    // 2. Public User Profile & Self Profile Endpoints
    if (pathname.startsWith('/api/users/profile/') && method === 'GET') {
      const handleParam = decodeURIComponent(pathname.replace('/api/users/profile/', ''));
      const currentUserId = parsedUrl.searchParams.get('currentUserId') || undefined;
      const profile = await dbService.getPublicUserProfileByHandle(handleParam, currentUserId);
      if (!profile) {
        sendJson(res, 404, { success: false, message: 'User profile not found' });
        return;
      }
      sendJson(res, 200, { success: true, profile });
      return;
    }

    if (pathname === '/api/users/me' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const user = await dbService.getPrimaryUser(userId);
      sendJson(res, 200, { user });
      return;
    }

    if (pathname === '/api/users/me' && method === 'PUT') {
      const body = await parseJsonBody(req);
      const targetUserId = String(body.userId || parsedUrl.searchParams.get('userId') || '');
      const primaryUser = await dbService.getPrimaryUser(targetUserId || undefined);
      if (!primaryUser) {
        sendJson(res, 404, { success: false, error: 'Không tìm thấy tài khoản người dùng.' });
        return;
      }
      const updatedUser = await dbService.updateUser(primaryUser.id, body);
      sendJson(res, 200, { success: true, user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/location' && method === 'PUT') {
      const body = await parseJsonBody(req);
      const targetUserId = String(body.userId || parsedUrl.searchParams.get('userId') || '');
      const primaryUser = await dbService.getPrimaryUser(targetUserId || undefined);
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
      const targetUserId = String(body.userId || parsedUrl.searchParams.get('userId') || '');
      const primaryUser = await dbService.getPrimaryUser(targetUserId || undefined);
      if (!primaryUser) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const updatedUser = await dbService.updateUser(primaryUser.id, {
        showLocation:
          body.showLocation !== undefined ? Boolean(body.showLocation) : primaryUser.showLocation,
        showPhone: body.showPhone !== undefined ? Boolean(body.showPhone) : primaryUser.showPhone,
        allowMessages: body.allowMessages
          ? String(body.allowMessages)
          : primaryUser.allowMessages,
        privacySettings: body.privacySettings,
      });
      sendJson(res, 200, { user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/data-export' && method === 'POST') {
      const body = await parseJsonBody(req);
      const data = await dbService.getBootstrapData(
        body.userId ? String(body.userId) : undefined
      );
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

    // 3. Pets & Vaccinations CRUD
    if (pathname === '/api/pets' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const pets = userId ? await dbService.getUserPets(userId) : await dbService.getPets();
      sendJson(res, 200, { pets });
      return;
    }

    if (pathname === '/api/pets' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newPet = await dbService.createPet(body);
      sendJson(res, 201, { success: true, pet: newPet });
      return;
    }

    const petVacMatch = pathname.match(/^\/api\/pets\/([^/]+)\/vaccinations$/);
    if (petVacMatch && method === 'POST') {
      const petId = petVacMatch[1];
      const body = await parseJsonBody(req);
      const vaccination = await dbService.addVaccination(petId, body);
      sendJson(res, 201, { success: true, vaccination });
      return;
    }

    const petItemMatch = pathname.match(/^\/api\/pets\/([^/]+)$/);
    if (petItemMatch && method === 'PUT') {
      const petId = petItemMatch[1];
      const body = await parseJsonBody(req);
      const updatedPet = await dbService.updatePet(petId, body);
      sendJson(res, 200, { success: true, pet: updatedPet });
      return;
    }

    if (petItemMatch && method === 'DELETE') {
      const petId = petItemMatch[1];
      const result = await dbService.deletePet(petId);
      sendJson(res, 200, result);
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
      const primaryUser = await dbService.getPrimaryUser(
        body.completedBy ? String(body.completedBy) : undefined
      );
      const task = await dbService.completeTask(
        taskId,
        String(body.completedBy || primaryUser?.id || 'user-test1'),
        body.note ? String(body.note) : undefined
      );
      sendJson(res, 200, { task });
      return;
    }

    // 5. Social Feed Posts, Reactions & Comments
    if (
      (pathname === '/api/posts/feed' ||
        pathname === '/api/posts/explore' ||
        pathname === '/api/posts') &&
      method === 'GET'
    ) {
      const posts = await dbService.getPosts();
      sendJson(res, 200, { posts });
      return;
    }

    if (pathname === '/api/posts' && method === 'POST') {
      const body = await parseJsonBody(req);
      const textContent = String(body.content ?? body.text ?? body.textContent ?? '').trim();
      const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls.filter(Boolean) : [];
      const contentType = (body.contentType || body.content_type || 'moment') as
        | 'moment'
        | 'question'
        | 'tip';

      if (!textContent && mediaUrls.length === 0) {
        sendJson(res, 400, {
          success: false,
          error: 'Vui lòng nhập nội dung chia sẻ hoặc chọn ít nhất 1 hình ảnh/video.',
        });
        return;
      }

      const decision = moderationService.moderatePost({
        textContent,
        contentType,
      });

      if (decision.status === 'rejected') {
        sendJson(res, 400, {
          success: false,
          allowed: false,
          error: decision.reason,
          reason: decision.reason,
        });
        return;
      }

      const hashtags = Array.isArray(body.tags)
        ? body.tags
        : Array.isArray(body.hashtags)
        ? body.hashtags
        : [];

      const newPost = await dbService.createPost({
        authorId: body.authorId || body.userId,
        textContent,
        contentType,
        hasHealthDisclaimer: decision.hasHealthDisclaimer,
        mediaUrls,
        hashtags,
        locationDistrict: body.locationDistrict || body.location,
      });

      sendJson(res, 201, { success: true, post: newPost });
      return;
    }

    const postReactionMatch = pathname.match(/^\/api\/posts\/([^/]+)\/reactions$/);
    if (postReactionMatch && method === 'POST') {
      const postId = postReactionMatch[1];
      const body = await parseJsonBody(req);
      const userId = String(body.userId || '');
      if (!userId) {
        sendJson(res, 400, { success: false, error: 'Thiếu userId khi thả Paw.' });
        return;
      }
      const result = await dbService.togglePostReaction(postId, userId);
      sendJson(res, 200, { success: true, ...result });
      return;
    }

    const postCommentMatch = pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (postCommentMatch && method === 'POST') {
      const postId = postCommentMatch[1];
      const body = await parseJsonBody(req);
      const authorId = String(body.authorId || body.userId || '');
      const text = String(body.text || body.textContent || '').trim();
      if (!authorId || !text) {
        sendJson(res, 400, { success: false, error: 'Thiếu nội dung bình luận hoặc authorId.' });
        return;
      }
      const comment = await dbService.addPostComment(postId, authorId, text);
      sendJson(res, 201, { success: true, comment });
      return;
    }

    const postDeleteMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (postDeleteMatch && method === 'DELETE') {
      const postId = postDeleteMatch[1];
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const result = await dbService.deletePost(postId, userId);
      sendJson(res, 200, result);
      return;
    }

    // 5b. Social Graph (Friend Request, Respond, Unfriend, Follow)
    if (pathname === '/api/social/friend-request' && method === 'POST') {
      const body = await parseJsonBody(req);
      const fromUserId = String(body.fromUserId || body.userId || '');
      const targetIdentifier = String(body.targetHandle || body.targetUserId || '');
      if (!fromUserId || !targetIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin người gửi hoặc người nhận.' });
        return;
      }
      const result = await dbService.sendFriendRequest(fromUserId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/social/friend-respond' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || '');
      const requesterIdentifier = String(body.requesterId || body.requesterHandle || '');
      const action = body.action === 'decline' ? 'decline' : 'accept';
      const notificationId = body.notificationId ? String(body.notificationId) : undefined;
      if (!userId || !requesterIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin phản hồi lời mời kết bạn.' });
        return;
      }
      const result = await dbService.respondFriendRequest(
        userId,
        requesterIdentifier,
        action,
        notificationId
      );
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/social/unfriend' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || '');
      const targetIdentifier = String(body.targetHandle || body.targetUserId || '');
      if (!userId || !targetIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin hủy kết bạn.' });
        return;
      }
      const result = await dbService.unfriendUsers(userId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/social/follow' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || '');
      const targetIdentifier = String(body.targetHandle || body.targetUserId || '');
      if (!userId || !targetIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin theo dõi.' });
        return;
      }
      const result = await dbService.toggleFollow(userId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    // 6. SOS Alerts (100% Free) & Single AI Photo-to-Description Endpoint
    if (pathname === '/api/sos' && method === 'GET') {
      const sosAlerts = await dbService.getSosAlerts();
      sendJson(res, 200, { sosAlerts });
      return;
    }

    if (pathname === '/api/sos' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newSos = await dbService.createSosAlert(body);
      sendJson(res, 201, { success: true, sos: newSos });
      return;
    }

    const sosSightingMatch = pathname.match(/^\/api\/sos\/([^/]+)\/sighting$/);
    if (sosSightingMatch && method === 'POST') {
      const sosId = sosSightingMatch[1];
      const body = await parseJsonBody(req);
      const result = await dbService.addSosSighting(sosId, {
        reporterName: String(body.reporterName || 'Cư dân hỗ trợ'),
        phone: String(body.phone || ''),
        note: String(body.note || ''),
        reporterId: body.reporterId ? String(body.reporterId) : undefined,
      });
      sendJson(res, 201, { success: true, ...result });
      return;
    }

    const sosFoundMatch = pathname.match(/^\/api\/sos\/([^/]+)\/found$/);
    if (sosFoundMatch && method === 'POST') {
      const sosId = sosFoundMatch[1];
      const updated = await dbService.markSosResolved(sosId);
      sendJson(res, 200, { success: true, sos: updated });
      return;
    }

    if (pathname === '/api/ai/describe-pet' && method === 'POST') {
      const body = await parseJsonBody(req);
      const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : undefined;
      const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : undefined;
      const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg';

      if (!imageUrl && !imageBase64) {
        sendJson(res, 400, {
          success: false,
          error: 'Vui lòng cung cấp ảnh thú cưng để AI tạo mô tả.',
        });
        return;
      }

      try {
        const aiResult = await geminiVisionService.generateSosPetDescription(
          imageUrl,
          imageBase64,
          mimeType
        );
        if (!aiResult) {
          sendJson(res, 500, {
            success: false,
            error:
              'Khóa GEMINI_API_KEY chưa được cấu hình hợp lệ trong server/.env. Bạn vẫn có thể đăng tin SOS bình thường.',
          });
          return;
        }
        sendJson(res, 200, {
          success: true,
          ...aiResult,
        });
        return;
      } catch (err: any) {
        const message = err && err.message ? err.message : String(err);
        sendJson(res, 500, {
          success: false,
          error: message || 'Lỗi khi kết nối Google Gemini API',
        });
        return;
      }
    }

    // 7. Tinder Candidates, Likes You & Matches
    if (pathname === '/api/tinder/candidates' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-test1';
      const intent = parsedUrl.searchParams.get('intent') || undefined;
      const candidates = await dbService.getTinderCandidates(userId, intent);
      sendJson(res, 200, { candidates });
      return;
    }

    if (pathname === '/api/tinder/likes-you' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-test1';
      const likesYou = await dbService.getLikesYouCandidates(userId);
      sendJson(res, 200, { likesYou });
      return;
    }

    if (pathname === '/api/matches/swipe' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || 'user-test1');
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

    if (
      (pathname === '/api/matches/rewind' || pathname === '/api/tinder/rewind') &&
      method === 'POST'
    ) {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || 'user-test1');
      const candidateId = String(body.candidateId || body.targetUserId || '');
      if (!candidateId) {
        sendJson(res, 400, { error: 'candidateId is required' });
        return;
      }
      const result = await dbService.rewindSwipe(userId, candidateId);
      sendJson(res, 200, result);
      return;
    }

    if (
      (pathname === '/api/matches/unmatch' || pathname === '/api/tinder/unmatch') &&
      method === 'POST'
    ) {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || body.fromUserId || 'user-test1');
      const targetIdentifier = String(
        body.candidateId || body.targetIdentifier || body.partnerHandle || body.partnerId || ''
      );
      if (!userId || !targetIdentifier) {
        sendJson(res, 400, {
          success: false,
          error: 'Thiếu thông tin người dùng để hủy tương hợp.',
        });
        return;
      }
      const result = await dbService.unmatchUsers(userId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    // 8. Chats & Messages
    if (pathname === '/api/chats' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-test1';
      const chats = await dbService.getChats(userId);
      sendJson(res, 200, { chats });
      return;
    }

    if (pathname === '/api/chats/open' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || '');
      const partnerIdentifier = String(body.partnerHandle || body.partnerId || '');
      if (!userId || !partnerIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin người trò chuyện.' });
        return;
      }
      const opened = await dbService.openOrCreateDirectChat(userId, partnerIdentifier);
      sendJson(res, 200, { success: true, ...opened });
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
      const senderId = String(body.senderId || 'user-test1');
      const text = String(body.text || '');
      const mediaUrl = body.mediaUrl ? String(body.mediaUrl) : undefined;
      if (!text && !mediaUrl) {
        sendJson(res, 400, { error: 'Text or media is required' });
        return;
      }
      try {
        const message = await dbService.sendChatMessage(conversationId, senderId, text, mediaUrl);
        sendJson(res, 201, { success: true, message });
      } catch (err: any) {
        if (err && err.code === 'UNFRIENDED_CANNOT_MESSAGE') {
          sendJson(res, 403, {
            success: false,
            error: err.message,
          });
          return;
        }
        throw err;
      }
      return;
    }

    if (chatMsgMatch && method === 'DELETE') {
      const conversationId = chatMsgMatch[1];
      const userId = parsedUrl.searchParams.get('userId') || undefined;
      const result = await dbService.clearConversationMessages(conversationId, userId);
      sendJson(res, 200, result);
      return;
    }

    const chatReadMatch = pathname.match(/^\/api\/chats\/([^/]+)\/read$/);
    if (chatReadMatch && (method === 'POST' || method === 'PUT')) {
      const conversationId = chatReadMatch[1];
      const body = await parseJsonBody(req);
      const userId = String(
        body.userId || parsedUrl.searchParams.get('userId') || 'user-test1'
      );
      const result = await dbService.markConversationAsRead(conversationId, userId);
      sendJson(res, 200, result);
      return;
    }

    // 9. Notifications
    if (pathname === '/api/notifications' && method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-test1';
      const notifications = await dbService.getNotifications(userId);
      sendJson(res, 200, { notifications });
      return;
    }

    if (pathname === '/api/notifications/read-all' && method === 'POST') {
      const body = await parseJsonBody(req);
      const userId = String(body.userId || parsedUrl.searchParams.get('userId') || '');
      if (!userId) {
        sendJson(res, 400, { success: false, error: 'Thiếu userId.' });
        return;
      }
      const result = await dbService.markAllNotificationsRead(userId);
      sendJson(res, 200, result);
      return;
    }

    const notifReadMatch = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
    if (notifReadMatch && method === 'POST') {
      const notifId = notifReadMatch[1];
      const result = await dbService.markNotificationRead(notifId);
      sendJson(res, 200, result);
      return;
    }

    const notifDeleteMatch = pathname.match(/^\/api\/notifications\/([^/]+)$/);
    if (notifDeleteMatch && method === 'DELETE') {
      const notifId = notifDeleteMatch[1];
      const result = await dbService.deleteNotification(notifId);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/notifications' && method === 'DELETE') {
      const userId = parsedUrl.searchParams.get('userId') || '';
      if (!userId) {
        sendJson(res, 400, { success: false, error: 'Thiếu userId.' });
        return;
      }
      const result = await dbService.clearAllNotifications(userId);
      sendJson(res, 200, result);
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
    const rawMsg = error instanceof Error ? error.message : String(error);
    const isDbUnreachable =
      rawMsg.includes("Can't reach database server") ||
      rawMsg.includes('PrismaClientInitializationError') ||
      rawMsg.includes('ECONNREFUSED') ||
      rawMsg.includes('P1001') ||
      rawMsg.includes('P1002') ||
      rawMsg.includes('P1003');
    sendJson(res, isDbUnreachable ? 503 : 500, {
      success: false,
      error: isDbUnreachable
        ? 'Không thể kết nối cơ sở dữ liệu PostgreSQL. Vui lòng bật PostgreSQL Server và thử lại.'
        : rawMsg || 'Lỗi xử lý máy chủ nội bộ.',
    });
  }
});

const PORT = Number(process.env.PORT || 3000);
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Pawty Server] API Gateway (PostgreSQL) running at http://0.0.0.0:${PORT}/api/health`
    );
  });
}

export { server };
