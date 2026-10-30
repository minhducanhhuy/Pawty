import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { ModerationService } from './modules/moderation/moderation.service';
import { PawRankAndSpatialService } from './modules/social/pawrank.service';
import { PetTracingService } from './modules/sos/pet-tracing.service';
import { INITIAL_SERVER_DB, ServerDatabaseState } from './data/seed';

const moderationService = new ModerationService();
const spatialService = new PawRankAndSpatialService();
const petTracingService = new PetTracingService();

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'db.json');

function loadDatabase(): ServerDatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_SERVER_DB, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(INITIAL_SERVER_DB));
    }
    const rawContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(rawContent) as ServerDatabaseState;
  } catch (error) {
    console.error('[Pawty Server] Failed to read db.json, falling back to INITIAL_SERVER_DB:', error);
    return JSON.parse(JSON.stringify(INITIAL_SERVER_DB));
  }
}

function saveDatabase(state: ServerDatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Pawty Server] Failed to persist db.json:', error);
  }
}

const dbState: ServerDatabaseState = loadDatabase();

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

    // 0. Health & Full Ecosystem Bootstrap (Web + Expo Go Mobile + Partner Admin)
    if (pathname === '/api/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'ok',
        service: 'Pawty API Gateway (REST + Socket.io + PostGIS)',
        layers: ['Care', 'Circle', 'Local', 'Services', 'Pro'],
        persistence: DB_FILE_PATH,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (pathname === '/api/bootstrap' && method === 'GET') {
      sendJson(res, 200, dbState);
      return;
    }

    // 1. Auth Endpoints (3.1)
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
      let existingUser = dbState.users.find((u) => u.phone === phone);
      let isNew = false;
      if (!existingUser) {
        isNew = true;
        existingUser = {
          ...dbState.users[0],
          id: `user-${Date.now()}`,
          phone,
        };
        dbState.users.push(existingUser);
        saveDatabase(dbState);
      }
      sendJson(res, 200, {
        token: 'jwt-pawty-access-token',
        refresh_token: 'jwt-pawty-refresh-token',
        user: existingUser,
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

    // 2. Users & Privacy Endpoints (3.2)
    if (pathname === '/api/users/me' && method === 'GET') {
      sendJson(res, 200, { user: dbState.users[0] });
      return;
    }

    if (pathname === '/api/users/me' && method === 'PUT') {
      const body = await parseJsonBody(req);
      dbState.users[0] = { ...dbState.users[0], ...body };
      saveDatabase(dbState);
      sendJson(res, 200, { user: dbState.users[0] });
      return;
    }

    if (pathname === '/api/users/me/location' && method === 'PUT') {
      const body = await parseJsonBody(req);
      dbState.users[0] = {
        ...dbState.users[0],
        district: body.district || dbState.users[0].district,
        neighborhood: body.neighborhood || dbState.users[0].neighborhood,
        location: {
          lat: Number(body.lat || 10.8412),
          lng: Number(body.lng || 106.8286),
        },
      };
      saveDatabase(dbState);
      sendJson(res, 200, { user: dbState.users[0] });
      return;
    }

    if (pathname === '/api/users/me/privacy' && method === 'PUT') {
      const body = await parseJsonBody(req);
      dbState.users[0] = {
        ...dbState.users[0],
        privacySettings: {
          ...(dbState.users[0].privacySettings as Record<string, unknown>),
          ...body,
        },
      };
      saveDatabase(dbState);
      sendJson(res, 200, { user: dbState.users[0] });
      return;
    }

    if (pathname === '/api/users/me/data-export' && method === 'POST') {
      sendJson(res, 200, {
        compliance: 'Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15',
        exportedAt: new Date().toISOString(),
        data: dbState,
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

    // 3. Pets, Vaccinations & Behaviors (3.3)
    if (pathname === '/api/pets' && method === 'GET') {
      sendJson(res, 200, { pets: dbState.pets });
      return;
    }

    if (pathname === '/api/pets' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newPet = {
        id: `pet-${Date.now()}`,
        householdId: 'hh-mai',
        ownerId: 'user-mai',
        vaccinations: [],
        behaviors: [],
        ...body,
      };
      dbState.pets.push(newPet);
      saveDatabase(dbState);
      sendJson(res, 201, { pet: newPet });
      return;
    }

    const petVacMatch = pathname.match(/^\/api\/pets\/([^/]+)\/vaccinations$/);
    if (petVacMatch && method === 'POST') {
      const petId = petVacMatch[1];
      const body = await parseJsonBody(req);
      const pet = dbState.pets.find((p) => p.id === petId);
      if (!pet) {
        sendJson(res, 404, { error: 'Pet not found' });
        return;
      }
      const newVac = {
        id: `vac-${Date.now()}`,
        petId,
        verified: true,
        ...body,
      };
      const vacList = Array.isArray(pet.vaccinations) ? pet.vaccinations : [];
      pet.vaccinations = [newVac, ...vacList];
      pet.vaccinationStatus = 'full';
      saveDatabase(dbState);
      sendJson(res, 201, { vaccination: newVac, pet });
      return;
    }

    // 4. Households, Circle & Care Tasks (3.4)
    if (pathname === '/api/circle' && method === 'GET') {
      sendJson(res, 200, {
        members: dbState.circleMembers,
        activities: dbState.circleActivities,
      });
      return;
    }

    if (pathname.match(/^\/api\/households\/([^/]+)\/invite$/) && method === 'POST') {
      const body = await parseJsonBody(req);
      const newMember = {
        id: `cm-${Date.now()}`,
        householdId: 'hh-mai',
        userId: `user-inv-${Date.now()}`,
        displayName: String(body.displayName || 'Thành viên mới'),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: String(body.role || 'co_carer'),
        relationshipLabel: String(body.relationshipLabel || 'Người thân trong Circle'),
        status: 'active',
        inviteCode: `PAWTY-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      dbState.circleMembers.push(newMember);
      dbState.circleActivities.unshift({
        id: `act-${Date.now()}`,
        householdId: 'hh-mai',
        actorName: 'Mai Nguyễn',
        actorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        actionText: `đã mời ${newMember.displayName} (${newMember.relationshipLabel}) vào Vòng chăm sóc`,
        timestamp: 'Vừa xong',
        type: 'handover',
      });
      saveDatabase(dbState);
      sendJson(res, 201, { member: newMember });
      return;
    }

    if (pathname === '/api/tasks' && method === 'GET') {
      sendJson(res, 200, { tasks: dbState.tasks });
      return;
    }

    if (pathname === '/api/tasks' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newTask = {
        id: `task-${Date.now()}`,
        householdId: 'hh-mai',
        status: 'pending',
        dueDate: 'Hôm nay',
        recurrence: 'daily',
        ...body,
      };
      dbState.tasks.unshift(newTask);
      saveDatabase(dbState);
      sendJson(res, 201, { task: newTask });
      return;
    }

    const taskCompleteMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);
    if (taskCompleteMatch && method === 'PUT') {
      const taskId = taskCompleteMatch[1];
      const body = await parseJsonBody(req);
      const task = dbState.tasks.find((t) => t.id === taskId);
      if (!task) {
        sendJson(res, 404, { error: 'Task not found' });
        return;
      }
      task.status = task.status === 'done' ? 'pending' : 'done';
      task.completedByName = 'Mai Nguyễn';
      task.completedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      if (body.note) {
        task.completionNote = String(body.note);
      }
      dbState.circleActivities.unshift({
        id: `act-${Date.now()}`,
        householdId: 'hh-mai',
        actorName: 'Mai Nguyễn',
        actorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        actionText: `${task.status === 'done' ? 'đã hoàn thành' : 'đã mở lại'} "${String(task.title)}"`,
        timestamp: 'Vừa xong',
        type: 'task_done',
      });
      saveDatabase(dbState);
      sendJson(res, 200, { task });
      return;
    }

    // 5. Social Feed, Posts, Reactions, Comments & Groups (3.5 & 3.6)
    if ((pathname === '/api/posts/feed' || pathname === '/api/posts/explore' || pathname === '/api/posts') && method === 'GET') {
      sendJson(res, 200, { posts: dbState.posts });
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

      const newPost = {
        id: `post-${Date.now()}`,
        authorId: 'user-mai',
        authorName: 'Mai Nguyễn',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        authorRoleBadge: 'vip',
        petId: body.petId || 'pet-lu',
        petName: body.petName || 'Lu',
        petBreed: body.petBreed || 'Golden Retriever',
        petSpecies: body.petSpecies || 'dog',
        contentType,
        textContent,
        mediaUrls: Array.isArray(body.mediaUrls) && body.mediaUrls.length > 0
          ? body.mediaUrls
          : ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80'],
        hashtags: Array.isArray(body.hashtags) ? body.hashtags : ['#PawtyLocal', '#KhoảnhKhắcBoss'],
        locationDistrict: 'TP. Thủ Đức (Quận 9)',
        distanceMeters: 50,
        visibility: 'public',
        hasHealthDisclaimer: decision.hasHealthDisclaimer,
        isSponsored: false,
        pawRankScore: 99,
        createdAt: 'Vừa xong',
        reactions: { paw: 1, heart_eyes: 0, laughing: 0, worried: 0, helpful: 0 },
        isBookmarked: false,
        comments: [],
      };
      dbState.posts.unshift(newPost);
      saveDatabase(dbState);

      // AI Multimodal Sighting Scanner (Google Gemini 2.5 Flash)
      try {
        const socialPostFormat = {
          id: newPost.id,
          authorId: newPost.authorName,
          textContent: newPost.textContent,
          media: newPost.mediaUrls.map((url) => ({ id: 'm-' + Date.now(), type: 'image' as const, url })),
          locationName: newPost.locationDistrict,
          locationCoords: { lat: 10.8428, lng: 106.8305 },
          createdAt: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          pawRankScore: newPost.pawRankScore,
        };

        const activeSos = (dbState.sosAlerts || []).filter((s) => s.status === 'active');
        const matches = await petTracingService.scanPostForSosMatchesAsync(socialPostFormat as any, activeSos as any);

        if (matches.length > 0) {
          console.log('[Pawty AI Scanner] Phat hien ' + matches.length + ' manh moi tu bai dang ' + newPost.id);
          for (const m of matches) {
            const targetSos = (dbState.sosAlerts || []).find((s: any) => s.id === m.sosAlertId) as any;
            if (targetSos) {
              targetSos.matchedPosts = targetSos.matchedPosts || [];
              targetSos.matchedPosts.unshift(m);
              const trajectory = petTracingService.buildTrajectory(targetSos as any);
              targetSos.trajectoryPoints = trajectory.trajectoryPoints;
              targetSos.totalDistanceMeters = trajectory.totalDistanceMeters;
            }
          }
          saveDatabase(dbState);
        }
      } catch (scanErr: any) {
        console.warn('[Pawty AI Scanner] Quet bai dang that bai:', scanErr.message);
      }

      sendJson(res, 201, { post: newPost });
      return;
    }

    const postReactionMatch = pathname.match(/^\/api\/posts\/([^/]+)\/reactions$/);
    if (postReactionMatch && method === 'POST') {
      const postId = postReactionMatch[1];
      const body = await parseJsonBody(req);
      const reactionType = String(body.reaction || 'paw');
      const post = dbState.posts.find((p) => p.id === postId);
      if (!post) {
        sendJson(res, 404, { error: 'Post not found' });
        return;
      }
      const reactions = (post.reactions || {}) as Record<string, number>;
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;
      post.reactions = reactions;
      saveDatabase(dbState);
      sendJson(res, 200, { post });
      return;
    }

    const postCommentMatch = pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (postCommentMatch && method === 'POST') {
      const postId = postCommentMatch[1];
      const body = await parseJsonBody(req);
      const post = dbState.posts.find((p) => p.id === postId);
      if (!post) {
        sendJson(res, 404, { error: 'Post not found' });
        return;
      }
      const newComment = {
        id: `cmt-${Date.now()}`,
        postId,
        authorId: 'user-mai',
        authorName: 'Mai Nguyễn',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        content: String(body.content || ''),
        createdAt: 'Vừa xong',
      };
      const comments = Array.isArray(post.comments) ? post.comments : [];
      post.comments = [...comments, newComment];
      saveDatabase(dbState);
      sendJson(res, 201, { comment: newComment, post });
      return;
    }

    const postBookmarkMatch = pathname.match(/^\/api\/posts\/([^/]+)\/bookmark$/);
    if (postBookmarkMatch && method === 'POST') {
      const postId = postBookmarkMatch[1];
      const post = dbState.posts.find((p) => p.id === postId);
      if (!post) {
        sendJson(res, 404, { error: 'Post not found' });
        return;
      }
      post.isBookmarked = !post.isBookmarked;
      saveDatabase(dbState);
      sendJson(res, 200, { post });
      return;
    }

    if (pathname === '/api/groups' && method === 'GET') {
      sendJson(res, 200, { groups: dbState.groups });
      return;
    }

    const groupJoinMatch = pathname.match(/^\/api\/groups\/([^/]+)\/(join|leave)$/);
    if (groupJoinMatch && (method === 'POST' || method === 'DELETE')) {
      const groupId = groupJoinMatch[1];
      const group = dbState.groups.find((g) => g.id === groupId);
      if (group) {
        group.isJoined = !group.isJoined;
        group.memberCount = Number(group.memberCount || 100) + (group.isJoined ? 1 : -1);
        saveDatabase(dbState);
      }
      sendJson(res, 200, { group });
      return;
    }

    // 6. Radar, Matches & Midpoint Walk Appointments (3.7)
    if (pathname === '/api/radar' && method === 'GET') {
      sendJson(res, 200, {
        candidates: dbState.radarCandidates,
        matches: dbState.matches,
      });
      return;
    }

    const swipeMatch = pathname.match(/^\/api\/matches\/([^/]+)\/swipe$/);
    if (swipeMatch && method === 'POST') {
      const candidateId = swipeMatch[1];
      const body = await parseJsonBody(req);
      const isRight = body.direction === 'right';
      if (isRight && !dbState.matches.includes(candidateId)) {
        dbState.matches.push(candidateId);
        saveDatabase(dbState);
      }
      sendJson(res, 200, {
        matched: isRight,
        candidateId,
        matches: dbState.matches,
      });
      return;
    }

    if (pathname === '/api/appointments/midpoint' && method === 'GET') {
      const result = spatialService.computeWalkMidpointSuggestions(
        { lat: 10.8412, lng: 106.8286 },
        { lat: 10.8435, lng: 106.8271 },
        dbState.places as never[]
      );
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/appointments' && method === 'GET') {
      sendJson(res, 200, { appointments: dbState.walkAppointments });
      return;
    }

    if (pathname === '/api/appointments' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newWalk = {
        id: `walk-${Date.now()}`,
        matchId: 'match-bo',
        status: 'confirmed',
        ...body,
      };
      dbState.walkAppointments.unshift(newWalk);
      saveDatabase(dbState);
      sendJson(res, 201, { appointment: newWalk });
      return;
    }

    const walkUpdateMatch = pathname.match(/^\/api\/appointments\/([^/]+)$/);
    if (walkUpdateMatch && method === 'PUT') {
      const walkId = walkUpdateMatch[1];
      const body = await parseJsonBody(req);
      const walk = dbState.walkAppointments.find((w) => w.id === walkId);
      if (walk) {
        walk.status = String(body.status || walk.status);
        saveDatabase(dbState);
      }
      sendJson(res, 200, { appointment: walk });
      return;
    }

    // 7. Partners, Places & Bookings (3.8)
    if (pathname === '/api/partners' && method === 'GET') {
      sendJson(res, 200, {
        partners: dbState.partners,
        places: dbState.places,
      });
      return;
    }

    if (pathname === '/api/bookings' && method === 'GET') {
      sendJson(res, 200, { bookings: dbState.bookings });
      return;
    }

    if (pathname === '/api/bookings' && method === 'POST') {
      const body = await parseJsonBody(req);
      const price = Number(body.servicePrice || 300000);
      const newBooking = {
        id: `bk-${Date.now()}`,
        status: 'confirmed',
        commissionRate: 0.12,
        commissionVnd: Math.round(price * 0.12),
        hasReviewed: false,
        ...body,
      };
      dbState.bookings.unshift(newBooking);
      saveDatabase(dbState);
      sendJson(res, 201, { booking: newBooking });
      return;
    }

    const bookingStatusMatch = pathname.match(/^\/api\/bookings\/([^/]+)\/status$/);
    if (bookingStatusMatch && method === 'PUT') {
      const bookingId = bookingStatusMatch[1];
      const body = await parseJsonBody(req);
      const booking = dbState.bookings.find((b) => b.id === bookingId);
      if (booking) {
        booking.status = String(body.status || booking.status);
        saveDatabase(dbState);
      }
      sendJson(res, 200, { booking });
      return;
    }

    // 8. SOS, Sen VIP & Admin Metrics (3.9)
    if (pathname === '/api/sos' && method === 'GET') {
      sendJson(res, 200, { sosAlerts: dbState.sosAlerts });
      return;
    }

    const sosTrajectoryMatch = pathname.match(/^\/api\/sos\/([^/]+)\/trajectory$/);
    if (sosTrajectoryMatch && method === 'GET') {
      const sosId = sosTrajectoryMatch[1];
      const sos = dbState.sosAlerts.find((s) => s.id === sosId);
      if (!sos) {
        sendJson(res, 404, { error: 'SOS alert not found' });
        return;
      }
      const trajectory = petTracingService.buildTrajectory(sos as any);
      sendJson(res, 200, { trajectory });
      return;
    }

    const sosMatchDecision = pathname.match(/^\/api\/sos\/([^/]+)\/match-decision$/);
    if (sosMatchDecision && method === 'POST') {
      const sosId = sosMatchDecision[1];
      const body = await parseJsonBody(req);
      const { matchId, decision } = body;
      const sos = (dbState.sosAlerts || []).find((s: any) => s.id === sosId) as any;
      if (!sos) {
        sendJson(res, 404, { error: 'SOS alert not found' });
        return;
      }
      const match = (sos.matchedPosts || []).find((m: any) => m.id === matchId);
      if (match) {
        match.status = decision;
        const trajectory = petTracingService.buildTrajectory(sos as any);
        sos.trajectoryPoints = trajectory.trajectoryPoints;
        sos.totalDistanceMeters = trajectory.totalDistanceMeters;
        saveDatabase(dbState);
      }
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

    if (pathname === '/api/sos' && method === 'POST') {
      const body = await parseJsonBody(req);
      const newSos = {
        id: `sos-${Date.now()}`,
        ownerId: 'user-mai',
        ownerName: 'Mai Nguyễn',
        ownerPhone: '0912 345 678',
        radiusKm: 3,
        status: 'active',
        createdAt: 'Vừa phát tín hiệu',
        sightingCount: 0,
        ...body,
      };
      dbState.sosAlerts.unshift(newSos);
      saveDatabase(dbState);
      sendJson(res, 201, { sos: newSos });
      return;
    }

    const sosSightingMatch = pathname.match(/^\/api\/sos\/([^/]+)\/sighting$/);
    if (sosSightingMatch && method === 'POST') {
      const sosId = sosSightingMatch[1];
      const sos = dbState.sosAlerts.find((s) => s.id === sosId);
      if (sos) {
        sos.sightingCount = Number(sos.sightingCount || 0) + 1;
        saveDatabase(dbState);
      }
      sendJson(res, 200, { sos });
      return;
    }

    if (pathname === '/api/vip/subscribe' && method === 'POST') {
      const body = await parseJsonBody(req);
      dbState.users[0] = {
        ...dbState.users[0],
        isVip: true,
        vipPlan: body.plan || 'sen_vip_monthly',
      };
      saveDatabase(dbState);
      sendJson(res, 200, { user: dbState.users[0] });
      return;
    }

    if (pathname === '/api/admin/metrics' && method === 'GET') {
      sendJson(res, 200, { metrics: dbState.metrics });
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
    console.log(`[Pawty Server] API Gateway running at http://0.0.0.0:${PORT}/api/health`);
  });
}

export { server };
