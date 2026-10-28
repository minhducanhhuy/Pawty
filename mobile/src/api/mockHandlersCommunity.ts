import { mockCoreStore } from './mockStoreCore';
import { mockCommunityStore } from './mockStoreCommunity';
import { WalkAppointment, ChatMessage } from '../types';

export function handleMockCommunity(method: string, path: string, body?: any): any {
  const user = mockCoreStore.user;

  if (path.startsWith('/walks/live')) {
    return mockCoreStore.radarPets.slice(0, 2).map((pet, idx) => ({
      pet, distanceGridMeters: (idx + 1) * 100, condoComplex: pet.condoComplex, walkingMinutesLeft: 24 - idx * 5,
    }));
  }
  if (path === '/walks/start' || path === '/walks/heartbeat') {
    user.isWalkingNow = true;
    user.walkingUntil = new Date(Date.now() + 30 * 60000).toISOString();
    return { walkingUntil: user.walkingUntil };
  }
  if (path === '/walks/stop') {
    user.isWalkingNow = false;
    user.walkingUntil = null;
    user.walkStreakDays += 1;
    user.totalWalkMeters += 850;
    return { distanceMeters: 850, streakDays: user.walkStreakDays, newBadges: ['walk_7_streak'] };
  }
  if (path === '/chat/rooms') return mockCommunityStore.rooms;
  if (path.endsWith('/icebreakers')) {
    return {
      suggestions: [
        'Gâu! Chiều nay 5h30 ra bãi cỏ Landmark chạy thi không bạn ơi? 🐾',
        'Nhìn mặt Boss cưng quá! Bé có thích ăn xúc xích phô mai không? 🌭',
        'Cuối tuần này đi Corgi Cafe Thảo Điền giao lưu nhé Sen ơi! ☕',
      ],
    };
  }
  if (path.includes('/chat/rooms/') && path.includes('/messages')) {
    const roomId = path.split('/')[3];
    return { items: mockCommunityStore.messages[roomId] || [], total: (mockCommunityStore.messages[roomId] || []).length };
  }
  if (path === '/appointments' && method === 'POST') {
    const apt: WalkAppointment = {
      id: `apt_${Date.now()}`, roomId: body.roomId, senderPetId: mockCoreStore.myPets[0]?.id || 'pet_bo_01',
      receiverPetId: body.receiverPetId, scheduledTime: body.scheduledTime || new Date(Date.now() + 3600000).toISOString(),
      displayTime: body.displayTime || 'Tối nay • 19:30', placeId: body.placeId,
      placeName: body.placeName, placeAddress: body.placeAddress, placeThumbnail: body.placeThumbnail,
      placeLat: body.placeLat || 10.7955, placeLng: body.placeLng || 106.7222, note: body.note, status: 'pending',
    };
    const room = mockCommunityStore.rooms.find((r) => r.id === body.roomId) || mockCommunityStore.rooms[0];
    if (room) room.activeAppointment = apt;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`, roomId: body.roomId, senderPetId: apt.senderPetId,
      appointment: apt, status: 'delivered', createdAt: 'Vừa xong',
    };
    mockCommunityStore.messages[body.roomId] = [...(mockCommunityStore.messages[body.roomId] || []), msg];
    return apt;
  }
  if (path.startsWith('/appointments/') && path.endsWith('/status')) {
    const id = path.split('/')[2];
    const room = mockCommunityStore.rooms.find((r) => r.activeAppointment?.id === id) || mockCommunityStore.rooms[0];
    if (room?.activeAppointment) room.activeAppointment.status = body.status;
    return room?.activeAppointment;
  }
  if (path.startsWith('/appointments/') && path.endsWith('/check-in')) {
    const id = path.split('/')[2];
    const room = mockCommunityStore.rooms.find((r) => r.activeAppointment?.id === id) || mockCommunityStore.rooms[0];
    if (room?.activeAppointment) {
      room.activeAppointment.status = 'completed';
      room.activeAppointment.checkedInSenderAt = new Date().toISOString();
      room.activeAppointment.checkedInReceiverAt = new Date().toISOString();
    }
    return { checkedIn: true, isCompleted: true, newBadges: ['social_butterfly'] };
  }
  if (path.startsWith('/places/suggestions')) {
    return { midpoint: { lat: 10.7953, lng: 106.722 }, places: mockCommunityStore.places.slice(0, 3) };
  }
  if (path.startsWith('/places/') && path.endsWith('/reviews') && method === 'POST') {
    const placeId = path.split('/')[2];
    const place = mockCommunityStore.places.find((p) => p.id === placeId);
    const rv = { id: `rv_${Date.now()}`, placeId, userId: user.id, userName: user.fullName, rating: body.rating, text: body.text, createdAt: 'Vừa xong' };
    if (place) { place.reviews = [rv, ...(place.reviews || [])]; place.reviewsCount += 1; }
    return rv;
  }
  if (path.startsWith('/places/')) {
    const id = path.split('/')[2];
    return mockCommunityStore.places.find((p) => p.id === id) || mockCommunityStore.places[0];
  }
  if (path.startsWith('/places')) return { items: mockCommunityStore.places, total: mockCommunityStore.places.length };
  if (path.startsWith('/clubs') || path.startsWith('/events')) return handleMockClubsEvents(method, path, body);
  return null;
}

function handleMockClubsEvents(method: string, path: string, body?: any): any {
  if (path === '/clubs' && method === 'POST') {
    const c = {
      id: `club_${Date.now()}`, name: body.name, type: body.type || 'breed', breedOrBuilding: body.breedOrBuilding,
      coverUrl: body.coverUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      description: body.description, ownerUserId: mockCoreStore.user.id, membersCount: 1, isMember: true,
    };
    mockCommunityStore.clubs.unshift(c);
    return c;
  }
  if (path.endsWith('/join') || path.endsWith('/leave')) {
    const club = mockCommunityStore.clubs.find((c) => c.id === path.split('/')[2]);
    if (club) { club.isMember = path.endsWith('/join'); club.membersCount += club.isMember ? 1 : -1; }
    return club;
  }
  if (path.startsWith('/clubs/')) {
    const club = mockCommunityStore.clubs.find((c) => c.id === path.split('/')[2]) || mockCommunityStore.clubs[0];
    return { ...club, upcomingEvents: mockCommunityStore.events.filter((e) => e.clubId === club.id) };
  }
  if (path.startsWith('/clubs')) return { items: mockCommunityStore.clubs, total: mockCommunityStore.clubs.length };
  if (path === '/events' && method === 'POST') {
    const ev = {
      id: `evt_${Date.now()}`, clubId: body.clubId, title: body.title, description: body.description,
      coverUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      placeName: body.placeName, lat: 10.7955, lng: 106.7222, startsAt: body.startsAt || 'Thứ Bảy • 17:00',
      capacity: Number(body.capacity || 25), rsvpCount: 1, myRsvp: 'going' as const,
    };
    mockCommunityStore.events.unshift(ev);
    return ev;
  }
  if (path.endsWith('/rsvp')) {
    const ev = mockCommunityStore.events.find((e) => e.id === path.split('/')[2]);
    if (ev) { ev.myRsvp = body.status; if (body.status === 'going') ev.rsvpCount = Math.min(ev.capacity, ev.rsvpCount + 1); }
    return { rsvpCount: ev?.rsvpCount || 1 };
  }
  return { items: mockCommunityStore.events, total: mockCommunityStore.events.length };
}
