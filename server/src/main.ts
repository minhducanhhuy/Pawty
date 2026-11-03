import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

import http from 'http';
import { URL } from 'url';
import { ModerationService } from './modules/moderation/moderation.service';
import { GeminiVisionService } from './modules/sos/gemini-vision.service';
import { dbService, prisma } from './data/db-service';
import { cloudinaryService } from './services/cloudinary.service';
import {
  generateSessionToken,
  extractAuthUserId,
  deepSanitizePasswords,
} from './utils/auth-crypto';

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
  res.end(JSON.stringify(deepSanitizePasswords(data)));
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

/**
 * Trích xuất và xác minh phiên làm việc từ header Authorization: Bearer <token>.
 * Nếu phiên không hợp lệ, lập tức trả về 401 và trả về null để dừng handler.
 */
function requireAuthUser(req: http.IncomingMessage, res: http.ServerResponse): string | null {
  const authHeader = req.headers['authorization'];
  const userId = extractAuthUserId(authHeader);
  if (!userId) {
    sendJson(res, 401, {
      success: false,
      error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
    });
    return null;
  }
  return userId;
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

    // Bootstrap yêu cầu gắn phiên xác thực hợp lệ
    if (pathname === '/api/bootstrap' && method === 'GET') {
      const authHeader = req.headers['authorization'];
      const authUserId = extractAuthUserId(authHeader);
      if (!authUserId) {
        sendJson(res, 401, {
          success: false,
          error: 'Yêu cầu phiên đăng nhập hợp lệ (Authorization: Bearer <token>) để tải dữ liệu.',
        });
        return;
      }
      const data = await dbService.getBootstrapData(authUserId);
      if (!data.user) {
        sendJson(res, 401, {
          success: false,
          error: 'Tài khoản không tồn tại trong cơ sở dữ liệu PostgreSQL. Vui lòng đăng nhập lại.',
        });
        return;
      }
      sendJson(res, 200, data);
      return;
    }

    // Static Media Handler (dành cho local fallback storage)
    if (pathname.startsWith('/uploads/') && method === 'GET') {
      const filename = path.basename(pathname);
      const filePath = path.resolve(process.cwd(), 'public', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filename).toLowerCase();
        const mimeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        res.writeHead(200, {
          'Content-Type': mimeMap[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
      sendJson(res, 404, { success: false, error: 'Tệp tin hình ảnh không tồn tại.' });
      return;
    }

    // Media Upload API (Cloudinary CDN & Fallback)
    if (pathname === '/api/upload' && method === 'POST') {
      const body = await parseJsonBody(req);
      const image = body.image || body.file || body.dataUrl || body.data;
      const folder = String(body.folder || 'pawty/media');
      if (!image || typeof image !== 'string') {
        sendJson(res, 400, {
          success: false,
          error: 'Vui lòng cung cấp dữ liệu hình ảnh (chuỗi base64 hoặc URL).',
        });
        return;
      }
      const host = req.headers.host || 'localhost:3000';
      const url = await cloudinaryService.uploadImage(image, folder, host);
      sendJson(res, 200, {
        success: true,
        url,
        message: 'Tải ảnh lên thành công.',
      });
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

      if (!password) {
        sendJson(res, 400, {
          success: false,
          error: 'Mật khẩu không được để trống.',
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

      const token = generateSessionToken(user.id, user.phone);
      sendJson(res, 200, {
        success: true,
        token,
        refresh_token: token,
        user,
        message: `Chào mừng ${user.displayName} đăng nhập thành công.`,
      });
      return;
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseJsonBody(req);
      const phone = String(body.phone || '').trim();
      const username = body.username ? String(body.username).trim() : undefined;
      const password = String(body.password || '').trim();
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

      if (!password) {
        sendJson(res, 400, {
          success: false,
          error: 'Mật khẩu không được để trống.',
        });
        return;
      }

      const existingByPhone = await dbService.findUserByPhone(phone);
      const existingByUsername = username
        ? await dbService.findUserByIdentifier(username)
        : null;
      if (existingByPhone) {
        sendJson(res, 409, {
          success: false,
          error: `Số điện thoại ${phone} đã được sử dụng. Vui lòng đăng nhập hoặc dùng số khác.`,
        });
        return;
      }
      if (existingByUsername) {
        sendJson(res, 409, {
          success: false,
          error: `Tên tài khoản (username) "${username}" đã có người sử dụng. Vui lòng chọn tên khác.`,
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
          breed: body.petBreed && String(body.petBreed).trim() ? String(body.petBreed).trim() : 'Chưa rõ',
          weightKg: body.petWeightKg != null ? Number(body.petWeightKg) : undefined,
          gender: body.petGender || 'Đực',
          avatarUrl: body.petAvatarUrl || undefined,
          galleryUrls: body.petAvatarUrl ? [body.petAvatarUrl] : undefined,
          birthDate: body.petBirthDate || undefined,
          isVaccinatedAndRabies: body.petVaccinated === true,
        });
      }

      const hydratedUser = createdUser
        ? await dbService.getPrimaryUser(createdUser.id)
        : createdUser;

      if (!hydratedUser) {
        sendJson(res, 500, {
          success: false,
          error: 'Không thể khởi tạo tài khoản trong cơ sở dữ liệu.',
        });
        return;
      }

      const token = generateSessionToken(hydratedUser.id, hydratedUser.phone);
      sendJson(res, 201, {
        success: true,
        token,
        refresh_token: token,
        user: hydratedUser,
        message: 'Đăng ký tài khoản thành công.',
      });
      return;
    }

    // Đóng hoàn toàn API OTP cũ -> Trả về 410 Gone theo Item 3
    if (
      (pathname === '/api/auth/send-otp' || pathname === '/api/auth/verify-otp') &&
      method === 'POST'
    ) {
      sendJson(res, 410, {
        success: false,
        error:
          'Phương thức xác thực OTP qua SMS đã ngừng hỗ trợ. Vui lòng sử dụng đăng ký / đăng nhập bằng Số điện thoại hoặc Tên đăng nhập và Mật khẩu.',
      });
      return;
    }

    // Đóng endpoint register-or-sync -> Trả về 410 Gone (Chặn bypass tạo user không mật khẩu)
    if (pathname === '/api/auth/register-or-sync' && method === 'POST') {
      sendJson(res, 410, {
        success: false,
        error:
          'Endpoint register-or-sync đã ngừng hoạt động vì lý do bảo mật. Vui lòng sử dụng /api/auth/register hoặc /api/auth/login.',
      });
      return;
    }

    // Làm mới token: Bắt buộc phải có token hợp lệ hiện tại
    if (pathname === '/api/auth/refresh' && method === 'POST') {
      const authHeader = req.headers['authorization'];
      const userId = extractAuthUserId(authHeader);
      if (!userId) {
        sendJson(res, 401, {
          success: false,
          error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
        });
        return;
      }
      const user = await dbService.getPrimaryUser(userId);
      if (!user) {
        sendJson(res, 401, {
          success: false,
          error: 'Người dùng không tồn tại.',
        });
        return;
      }
      const newToken = generateSessionToken(user.id, user.phone);
      sendJson(res, 200, {
        success: true,
        token: newToken,
        refresh_token: newToken,
        user,
      });
      return;
    }

    if (pathname === '/api/auth/logout' && method === 'DELETE') {
      sendJson(res, 200, { success: true });
      return;
    }

    // 2. Public User Profile & Self Profile Endpoints
    if (pathname.startsWith('/api/users/profile/') && method === 'GET') {
      const handleParam = decodeURIComponent(pathname.replace('/api/users/profile/', ''));
      const authHeader = req.headers['authorization'];
      const currentUserId = extractAuthUserId(authHeader) || parsedUrl.searchParams.get('currentUserId') || undefined;
      const profile = await dbService.getPublicUserProfileByHandle(handleParam, currentUserId);
      if (!profile) {
        sendJson(res, 404, { success: false, message: 'User profile not found' });
        return;
      }
      sendJson(res, 200, { success: true, profile });
      return;
    }

    if (pathname === '/api/users/me' && method === 'GET') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const user = await dbService.getPrimaryUser(authUserId);
      if (!user) {
        sendJson(res, 404, { success: false, error: 'Người dùng không tồn tại.' });
        return;
      }
      sendJson(res, 200, { user });
      return;
    }

    if (pathname === '/api/users/me' && method === 'PUT') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const updatedUser = await dbService.updateUser(authUserId, body);
      sendJson(res, 200, { success: true, user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/location' && method === 'PUT') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const user = await dbService.getPrimaryUser(authUserId);
      if (!user) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const updatedUser = await dbService.updateUser(authUserId, {
        district: body.district ? String(body.district) : user.district,
        neighborhood: body.neighborhood ? String(body.neighborhood) : user.neighborhood,
      });
      sendJson(res, 200, { user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/privacy' && method === 'PUT') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const user = await dbService.getPrimaryUser(authUserId);
      if (!user) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      const updatedUser = await dbService.updateUser(authUserId, {
        showLocation:
          body.showLocation !== undefined ? Boolean(body.showLocation) : user.showLocation,
        showPhone: body.showPhone !== undefined ? Boolean(body.showPhone) : user.showPhone,
        allowMessages: body.allowMessages
          ? String(body.allowMessages)
          : user.allowMessages,
        privacySettings: body.privacySettings,
      });
      sendJson(res, 200, { user: updatedUser });
      return;
    }

    if (pathname === '/api/users/me/data-export' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const data = await dbService.getBootstrapData(authUserId);
      sendJson(res, 200, {
        compliance: 'Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15',
        exportedAt: new Date().toISOString(),
        data,
      });
      return;
    }

    if (pathname === '/api/users/me' && method === 'DELETE') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      sendJson(res, 200, {
        success: true,
        message: 'Yêu cầu xóa tài khoản đã được ghi nhận theo Luật BVDLCN 91/2025/QH15.',
      });
      return;
    }

    // 3. Pets & Vaccinations CRUD
    if (pathname === '/api/pets' && method === 'GET') {
      const authHeader = req.headers['authorization'];
      const authUserId = extractAuthUserId(authHeader);
      const targetUserId = parsedUrl.searchParams.get('userId') || authUserId || undefined;
      const pets = targetUserId ? await dbService.getUserPets(targetUserId) : await dbService.getPets();
      sendJson(res, 200, { pets });
      return;
    }

    if (pathname === '/api/pets' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      body.ownerId = authUserId; // Luôn gán chủ sở hữu là người dùng trong phiên
      const newPet = await dbService.createPet(body);
      sendJson(res, 201, { success: true, pet: newPet });
      return;
    }

    const petVacMatch = pathname.match(/^\/api\/pets\/([^/]+)\/vaccinations$/);
    if (petVacMatch && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const petId = petVacMatch[1];
      const body = await parseJsonBody(req);
      const vaccination = await dbService.addVaccination(petId, body);
      sendJson(res, 201, { success: true, vaccination });
      return;
    }

    const petItemMatch = pathname.match(/^\/api\/pets\/([^/]+)$/);
    if (petItemMatch && method === 'PUT') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const petId = petItemMatch[1];
      const body = await parseJsonBody(req);
      const updatedPet = await dbService.updatePet(petId, body, authUserId);
      sendJson(res, 200, { success: true, pet: updatedPet });
      return;
    }

    if (petItemMatch && method === 'DELETE') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const petId = petItemMatch[1];
      const result = await dbService.deletePet(petId, authUserId);
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
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const taskId = taskCompleteMatch[1];
      const body = await parseJsonBody(req);
      const task = await dbService.completeTask(
        taskId,
        authUserId,
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
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
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
        authorId: authUserId, // Luôn gán tác giả từ phiên xác thực
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
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const postId = postReactionMatch[1];
      const result = await dbService.togglePostReaction(postId, authUserId);
      sendJson(res, 200, { success: true, ...result });
      return;
    }

    const postCommentMatch = pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (postCommentMatch && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const postId = postCommentMatch[1];
      const body = await parseJsonBody(req);
      const text = String(body.text || body.textContent || body.content || '').trim();
      const parentId = body.parentId ? String(body.parentId) : undefined;
      if (!text) {
        sendJson(res, 400, { success: false, error: 'Thiếu nội dung bình luận.' });
        return;
      }
      const comment = await dbService.addPostComment(postId, authUserId, text, parentId);
      sendJson(res, 201, { success: true, comment });
      return;
    }

    const postDeleteMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (postDeleteMatch && method === 'DELETE') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const postId = postDeleteMatch[1];
      const result = await dbService.deletePost(postId, authUserId);
      sendJson(res, 200, result);
      return;
    }

    // 5b. Social Graph (Friend Request, Respond, Unfriend, Follow)
    if (pathname === '/api/social/friend-request' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const targetIdentifier = String(body.targetHandle || body.targetUserId || '');
      if (!targetIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin người nhận.' });
        return;
      }
      const result = await dbService.sendFriendRequest(authUserId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/social/friend-respond' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const requesterIdentifier = String(body.requesterId || body.requesterHandle || '');
      const action = body.action === 'decline' ? 'decline' : 'accept';
      const notificationId = body.notificationId ? String(body.notificationId) : undefined;
      if (!requesterIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin phản hồi lời mời kết bạn.' });
        return;
      }
      const result = await dbService.respondFriendRequest(
        authUserId,
        requesterIdentifier,
        action,
        notificationId
      );
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/social/unfriend' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const targetIdentifier = String(body.targetHandle || body.targetUserId || '');
      if (!targetIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin hủy kết bạn.' });
        return;
      }
      const result = await dbService.unfriendUsers(authUserId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/social/follow' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const targetIdentifier = String(body.targetHandle || body.targetUserId || '');
      if (!targetIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin theo dõi.' });
        return;
      }
      const result = await dbService.toggleFollow(authUserId, targetIdentifier);
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
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      body.userId = authUserId; // Luôn gán chủ tin SOS là người trong phiên
      const newSos = await dbService.createSosAlert(body);
      sendJson(res, 201, { success: true, sos: newSos });
      return;
    }

    const sosSightingMatch = pathname.match(/^\/api\/sos\/([^/]+)\/sighting$/);
    if (sosSightingMatch && method === 'POST') {
      const authHeader = req.headers['authorization'];
      const callerUserId = extractAuthUserId(authHeader);
      const sosId = sosSightingMatch[1];
      const body = await parseJsonBody(req);
      const result = await dbService.addSosSighting(sosId, {
        reporterName: String(body.reporterName || 'Cư dân hỗ trợ'),
        phone: String(body.phone || ''),
        note: String(body.note || ''),
        reporterId: callerUserId || (body.reporterId ? String(body.reporterId) : undefined),
      });
      sendJson(res, 201, { success: true, ...result });
      return;
    }

    const sosFoundMatch = pathname.match(/^\/api\/sos\/([^/]+)\/found$/);
    if (sosFoundMatch && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const sosId = sosFoundMatch[1];
      const updated = await dbService.markSosResolved(sosId, authUserId);
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
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const intent = parsedUrl.searchParams.get('intent') || undefined;
      const gender =
        parsedUrl.searchParams.get('gender') ||
        parsedUrl.searchParams.get('targetGender') ||
        undefined;
      const candidates = await dbService.getTinderCandidates(authUserId, intent, gender);
      sendJson(res, 200, { candidates });
      return;
    }

    if (pathname === '/api/tinder/likes-you' && method === 'GET') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const likesYou = await dbService.getLikesYouCandidates(authUserId);
      sendJson(res, 200, { likesYou });
      return;
    }

    if (
      (pathname === '/api/matches/swipe' || pathname === '/api/tinder/swipe') &&
      method === 'POST'
    ) {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const candidateId = String(body.candidateId || body.targetUserId || '');
      const direction = (body.direction || 'right') as 'left' | 'right';
      if (!candidateId) {
        sendJson(res, 400, { error: 'candidateId is required' });
        return;
      }
      const result = await dbService.recordSwipe(authUserId, candidateId, direction);
      sendJson(res, 200, result);
      return;
    }

    if (
      (pathname === '/api/matches/rewind' || pathname === '/api/tinder/rewind') &&
      method === 'POST'
    ) {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const candidateId = String(body.candidateId || body.targetUserId || '');
      if (!candidateId) {
        sendJson(res, 400, { error: 'candidateId is required' });
        return;
      }
      const result = await dbService.rewindSwipe(authUserId, candidateId);
      sendJson(res, 200, result);
      return;
    }

    // Hủy tương hợp (Unmatch): Lấy danh tính người hủy từ phiên, kiểm tra actor !== target trước mọi thao tác
    if (
      (pathname === '/api/matches/unmatch' || pathname === '/api/tinder/unmatch') &&
      method === 'POST'
    ) {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const targetIdentifier = String(
        body.candidateId || body.targetIdentifier || body.partnerHandle || body.partnerId || ''
      );
      if (!targetIdentifier) {
        sendJson(res, 400, {
          success: false,
          error: 'Thiếu thông tin người dùng để hủy tương hợp.',
        });
        return;
      }
      const result = await dbService.unmatchUsers(authUserId, targetIdentifier);
      sendJson(res, 200, result);
      return;
    }

    // 8. Chats & Messages
    if (pathname === '/api/chats' && method === 'GET') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const chats = await dbService.getChats(authUserId);
      sendJson(res, 200, { chats });
      return;
    }

    if (pathname === '/api/chats/open' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const body = await parseJsonBody(req);
      const partnerIdentifier = String(body.partnerHandle || body.partnerId || '');
      const chatType = body.chatType === 'dating' ? 'dating' : 'social';
      if (!partnerIdentifier) {
        sendJson(res, 400, { success: false, error: 'Thiếu thông tin người trò chuyện.' });
        return;
      }
      const opened = await dbService.openOrCreateDirectChat(authUserId, partnerIdentifier, chatType);
      sendJson(res, 200, { success: true, ...opened });
      return;
    }

    const chatMsgMatch = pathname.match(/^\/api\/chats\/([^/]+)\/messages$/);
    if (chatMsgMatch && method === 'GET') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const conversationId = chatMsgMatch[1];
      const messages = await dbService.getChatMessages(conversationId, authUserId);
      sendJson(res, 200, { messages });
      return;
    }

    if (chatMsgMatch && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const conversationId = chatMsgMatch[1];
      const body = await parseJsonBody(req);
      const text = String(body.text || '');
      const mediaUrl = body.mediaUrl ? String(body.mediaUrl) : undefined;
      if (!text && !mediaUrl) {
        sendJson(res, 400, { error: 'Text or media is required' });
        return;
      }
      try {
        const message = await dbService.sendChatMessage(conversationId, authUserId, text, mediaUrl);
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
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const conversationId = chatMsgMatch[1];
      const result = await dbService.clearConversationMessages(conversationId, authUserId);
      sendJson(res, 200, result);
      return;
    }

    const chatReadMatch = pathname.match(/^\/api\/chats\/([^/]+)\/read$/);
    if (chatReadMatch && (method === 'POST' || method === 'PUT')) {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const conversationId = chatReadMatch[1];
      const result = await dbService.markConversationAsRead(conversationId, authUserId);
      sendJson(res, 200, result);
      return;
    }

    // 9. Notifications
    if (pathname === '/api/notifications' && method === 'GET') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const notifications = await dbService.getNotifications(authUserId);
      sendJson(res, 200, { notifications });
      return;
    }

    if (pathname === '/api/notifications/read-all' && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const result = await dbService.markAllNotificationsRead(authUserId);
      sendJson(res, 200, result);
      return;
    }

    const notifReadMatch = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
    if (notifReadMatch && method === 'POST') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const notifId = notifReadMatch[1];
      const result = await dbService.markNotificationRead(notifId);
      sendJson(res, 200, result);
      return;
    }

    const notifDeleteMatch = pathname.match(/^\/api\/notifications\/([^/]+)$/);
    if (notifDeleteMatch && method === 'DELETE') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const notifId = notifDeleteMatch[1];
      const result = await dbService.deleteNotification(notifId);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/notifications' && method === 'DELETE') {
      const authUserId = requireAuthUser(req, res);
      if (!authUserId) return;
      const result = await dbService.clearAllNotifications(authUserId);
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

    const statusCode = (error as any)?.statusCode || 500;

    sendJson(res, isDbUnreachable ? 503 : statusCode, {
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
