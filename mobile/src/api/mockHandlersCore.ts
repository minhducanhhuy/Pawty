import { mockCoreStore, DEFAULT_CONFIG } from './mockStoreCore';
import { Pet, RadarItem, MomentItem, MomentComment } from '../types';

export function handleMockCore(method: string, path: string, body?: any): any {
  const user = mockCoreStore.user;
  if (path === '/config/public') return DEFAULT_CONFIG;
  if (path === '/auth/register') {
    const newUser = {
      ...user,
      id: `usr_${Date.now()}`,
      username: body?.username || 'user',
      fullName: body?.fullName || 'Chủ Nuôi Mới',
      condoComplex: body?.condoComplex || 'Vinhomes Central Park',
    };
    mockCoreStore.user = newUser;
    mockCoreStore.myPets = [];
    return { token: `jwt_${Date.now()}`, user: newUser, isNewUser: true };
  }
  if (path === '/auth/login') {
    return { token: `jwt_${Date.now()}`, user };
  }
  if (path === '/auth/google') {
    const googleUser = {
      ...user,
      id: `usr_google_${Date.now()}`,
      email: body?.email || 'user@gmail.com',
      fullName: body?.fullName || 'Sen Google',
      avatarUrl: body?.avatarUrl || user.avatarUrl,
    };
    mockCoreStore.user = googleUser;
    return { token: `jwt_${Date.now()}`, user: googleUser, isNewUser: mockCoreStore.myPets.length === 0 };
  }
  if (path === '/auth/send-otp') return { sessionInfo: 'mock_session_888888' };
  if (path === '/auth/verify-otp' || path === '/auth/social') {
    if (body?.phone) user.phone = body.phone;
    if (body?.referralCode) {
      user.vipTier = 'vip';
      user.isVip = true;
      user.vipExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    }
    return { token: 'mock_jwt_token_pawty_01', user, isNewUser: mockCoreStore.myPets.length === 0 };
  }
  if (path === '/users/me' && method === 'GET') return { ...user };
  if (path === '/users/me' && method === 'PATCH') return Object.assign(user, body);
  if (path === '/users/me' && method === 'DELETE') return { scheduledHardDeleteAt: new Date(Date.now() + 30 * 86400000).toISOString() };
  if (path === '/users/me/export') return { user, pets: mockCoreStore.myPets, moments: mockCoreStore.moments, exportedAt: new Date().toISOString() };
  if (path === '/users/blocks' && method === 'GET') return mockCoreStore.blockedUsers;
  if (path === '/users/blocks' && method === 'POST') {
    mockCoreStore.blockedUsers.push({ id: body.blockedUserId, fullName: 'Người dùng đã chặn', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', phone: '090***' });
    return { blocked: true };
  }
  if (path.startsWith('/users/blocks/') && method === 'DELETE') {
    const id = path.split('/').pop();
    mockCoreStore.blockedUsers = mockCoreStore.blockedUsers.filter((u) => u.id !== id);
    return { blocked: false };
  }
  if (path === '/pets/me') return [...mockCoreStore.myPets];
  if (path === '/pets' && method === 'POST') {
    const weight = Number(body.weightKg || 5);
    const newPet: Pet = {
      id: `pet_${Date.now()}`, userId: user.id, name: body.name || 'Boss Mới', species: body.species || 'dog',
      breed: body.breed || 'Corgi', gender: body.gender || 'male', isNeutered: Boolean(body.isNeutered),
      ageYears: Number(body.ageYears ?? 1), ageMonths: Number(body.ageMonths ?? 0), weightKg: weight,
      size: weight < 5 ? 'small' : weight <= 15 ? 'medium' : 'large',
      isVaccinated: Boolean(body.isVaccinated), lastVaccineDate: body.lastVaccineDate || '10/02/2026',
      vaccineDetails: body.vaccineDetails || 'Vắc-xin 7 bệnh & Dại', vaccineStatus: body.isVaccinated ? 'verified' : 'none',
      vaccineProofUrls: [], vaccineNextDueDate: '10/02/2027', isSafePet: Boolean(body.isVaccinated),
      isPrimary: mockCoreStore.myPets.length === 0, bio: body.bio || 'Boss đáng yêu tìm bạn đi dạo!',
      tags: body.tags || ['Thân thiện'], habitsGood: body.habitsGood || ['Ngoan ngoãn'], habitsBad: body.habitsBad || [],
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      photos: [], ownerName: user.fullName, ownerPhone: user.phone, condoComplex: user.condoComplex,
    };
    mockCoreStore.myPets.push(newPet);
    return newPet;
  }
  if (path.endsWith('/primary') && method === 'POST') {
    const petId = path.split('/')[2];
    mockCoreStore.myPets.forEach((p) => { p.isPrimary = p.id === petId; });
    return { success: true };
  }
  if (path.endsWith('/vaccine-proof') && method === 'POST') {
    const pet = mockCoreStore.myPets.find((p) => p.id === path.split('/')[2]) || mockCoreStore.myPets[0];
    if (pet) Object.assign(pet, { vaccineStatus: 'pending', vaccineProofUrls: body.proofUrls || [], vaccineDetails: body.vaccineDetails || pet.vaccineDetails, lastVaccineDate: body.lastVaccineDate || pet.lastVaccineDate, vaccineNextDueDate: body.nextDueDate || pet.vaccineNextDueDate });
    return pet;
  }
  if (path.startsWith('/pets/') && method === 'GET') {
    const id = path.split('/')[2];
    return [...mockCoreStore.myPets, ...mockCoreStore.radarPets].find((p) => p.id === id) || mockCoreStore.myPets[0];
  }
  if (path.startsWith('/radar')) {
    const items: RadarItem[] = mockCoreStore.radarPets.map((pet, i) => ({
      type: 'pet', pet, distanceMeters: (i + 1) * 185,
      distanceLabel: user.isDistanceHidden ? 'Gần bạn' : `Cách bạn ${(i + 1) * 185}m`,
      isBoosted: i === 0, isWalkingNow: i !== 2, hasSuperLikedMe: i === 0,
    }));
    if (user.vipTier !== 'vip_plus' && mockCoreStore.ads[0]) items.push({ type: 'ad', ad: mockCoreStore.ads[0] });
    return { items, radiusMeters: 1500, totalFound: items.length };
  }
  if ((path === '/matches' || path === '/radar/matches') && method === 'POST') {
    mockCoreStore.lastSwipedPet = mockCoreStore.radarPets.find((p) => p.id === body.targetPetId) || mockCoreStore.radarPets[0];
    if (user.vipTier === 'free' && user.swipesLeft > 0) user.swipesLeft -= 1;
    if (body.action === 'superlike' && user.superLikesLeft > 0) user.superLikesLeft -= 1;
    const isMatch = body.action === 'like' || body.action === 'superlike';
    return { isMatch, status: isMatch ? 'matched' : 'disliked', roomId: 'room_mochi_01', matchedAt: 'Vừa xong', quota: { swipesLeft: user.swipesLeft, superLikesLeft: user.superLikesLeft } };
  }
  if (path === '/matches/rewind' && method === 'POST') return { restoredPet: mockCoreStore.lastSwipedPet || mockCoreStore.radarPets[0], quota: { swipesLeft: user.swipesLeft, superLikesLeft: user.superLikesLeft } };
  if (path === '/matches/likes-me') return { count: 2, items: user.vipTier === 'free' ? [] : mockCoreStore.radarPets.slice(0, 2) };
  if (path === '/boosts/activate') {
    user.boostExpiresAt = new Date(Date.now() + 30 * 60000).toISOString();
    return { boostExpiresAt: user.boostExpiresAt };
  }
  if (path.startsWith('/moments') || path.startsWith('/feed')) return handleMockMoments(method, path, body);
  return null;
}

function handleMockMoments(method: string, path: string, body?: any): any {
  if (path.endsWith('/like') && method === 'POST') {
    const m = mockCoreStore.moments.find((x) => x.id === path.split('/')[2]);
    if (m) { m.isLiked = !m.isLiked; m.likesCount += m.isLiked ? 1 : -1; return { liked: m.isLiked, likesCount: m.likesCount }; }
  }
  if (path.includes('/comments') && method === 'GET') {
    const list = mockCoreStore.comments[path.split('/')[2]] || [];
    return { items: list, total: list.length };
  }
  if (path.includes('/comments') && method === 'POST') {
    const id = path.split('/')[2];
    const item: MomentComment = { id: `c_${Date.now()}`, momentId: id, userId: mockCoreStore.user.id, userName: mockCoreStore.user.fullName, userAvatarUrl: mockCoreStore.user.avatarUrl, text: body.text, createdAt: 'Vừa xong' };
    mockCoreStore.comments[id] = [...(mockCoreStore.comments[id] || []), item];
    const m = mockCoreStore.moments.find((x) => x.id === id);
    if (m) m.commentsCount += 1;
    return item;
  }
  if (path.endsWith('/share')) {
    const m = mockCoreStore.moments.find((x) => x.id === path.split('/')[2]) || mockCoreStore.moments[0];
    return { shareUrl: `https://pawty.app/m/${m.id}`, imageUrl: m.mediaUrl, caption: m.caption, watermark: 'Pawty 🐾' };
  }
  if (method === 'POST' && path === '/moments') {
    const pet = mockCoreStore.myPets[0];
    const created: MomentItem = { id: `m_${Date.now()}`, petId: pet.id, petName: pet.name, petAvatarUrl: pet.avatarUrl, condoComplex: mockCoreStore.user.condoComplex, mediaUrl: body.mediaUrl, mediaType: 'image', caption: body.caption, likesCount: 0, commentsCount: 0, isLiked: false, createdAt: 'Vừa xong' };
    mockCoreStore.moments.unshift(created);
    return created;
  }
  const list = path.includes('filter=mine') ? mockCoreStore.moments.filter((m) => m.petId === mockCoreStore.myPets[0]?.id) : mockCoreStore.moments;
  return { items: list, page: 1, limit: 20, total: list.length };
}
