import { mockCoreStore } from './mockStoreCore';
import { mockCommunityStore } from './mockStoreCommunity';
import { VoucherItem } from '../types';

export function handleMockExtras(method: string, path: string, body?: any): any {
  const user = mockCoreStore.user;
  if (path === '/reminders' && method === 'GET') return mockCommunityStore.reminders;
  if (path === '/reminders' && method === 'POST') {
    const r = { id: `rem_${Date.now()}`, petId: body.petId, petName: 'Bơ Lùn', kind: body.kind, title: body.title, dueDate: body.dueDate, isDone: false };
    mockCommunityStore.reminders.unshift(r);
    return r;
  }
  if (path.startsWith('/reminders/') && method === 'PATCH') {
    const r = mockCommunityStore.reminders.find((x) => x.id === path.split('/')[2]);
    if (r && body.isDone !== undefined) r.isDone = body.isDone;
    return r;
  }
  if (path.startsWith('/notifications/read')) {
    mockCommunityStore.notifications.forEach((n) => { n.isRead = true; });
    return { success: true };
  }
  if (path.startsWith('/notifications')) {
    return { items: mockCommunityStore.notifications, unreadCount: mockCommunityStore.notifications.filter((n) => !n.isRead).length };
  }
  if (path === '/badges/me') return mockCommunityStore.badges;
  if (path === '/referrals/me') return { code: user.referralCode, invitedCount: 2, rewardDaysGranted: 14, shareUrl: `https://pawty.app/invite/${user.referralCode}` };
  if (path === '/streak/me') {
    return {
      streakDays: user.walkStreakDays, lastWalkDate: user.lastWalkDate, totalWalkMeters: user.totalWalkMeters,
      recentWalks: [
        { id: 'w1', date: 'Hôm nay', distanceMeters: 1450, durationMinutes: 28, source: 'walk_now' },
        { id: 'w2', date: 'Hôm qua', distanceMeters: 1820, durationMinutes: 35, source: 'appointment' },
      ],
    };
  }
  if (path === '/payments/create-qr') {
    const amounts: Record<string, number> = { sos_emergency: 39000, vip_subscription: body?.plan === 'year' ? 399000 : 49000, vip_plus_subscription: 99000, boost: 15000, super_like_pack: 29000, boost_pack: 39000 };
    const amt = amounts[body?.serviceType] || 49000;
    const code = `PAWTY ${String(body?.serviceType || 'VIP').toUpperCase().slice(0, 6)} ${Date.now().toString().slice(-4)}`;
    return {
      transactionId: `tx_${Date.now()}`, serviceType: body?.serviceType,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`,
      bankName: 'MBBank', accountNo: '999988887777', amount: amt, paymentCode: code,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    };
  }
  if (path === '/payments/sandbox/confirm' || path.startsWith('/payments/tx_')) {
    if (body?.serviceType === 'vip_plus_subscription') { user.vipTier = 'vip_plus'; user.isVip = true; }
    else if (body?.serviceType === 'vip_subscription') { user.vipTier = 'vip'; user.isVip = true; }
    else if (body?.serviceType === 'super_like_pack') { user.superLikeBalance += 5; user.superLikesLeft += 5; }
    else if (body?.serviceType === 'boost' || body?.serviceType === 'boost_pack') { user.boostBalance += 1; }
    return { status: 'paid', user };
  }
  if (path === '/sos' && method === 'POST') {
    const alert = { id: `sos_${Date.now()}`, ...body, status: 'active' as const, distanceMeters: 120, createdAt: 'Vừa xong' };
    mockCommunityStore.sosAlerts.unshift(alert);
    return alert;
  }
  if (path.startsWith('/sos/nearby')) return mockCommunityStore.sosAlerts.filter((s) => s.status === 'active');
  if (path.endsWith('/resolve') && path.startsWith('/sos/')) {
    const s = mockCommunityStore.sosAlerts.find((x) => x.id === path.split('/')[2]);
    if (s) s.status = 'resolved';
    return s;
  }
  if (path.endsWith('/save-voucher')) {
    const v: VoucherItem = {
      id: `vch_${Date.now()}`, adId: 'ad_spa_01', businessName: 'Pawty Luxury Pet Spa',
      title: 'Voucher Giảm 35% Dịch Vụ Spa Nội Khu', discountPercent: 35,
      code: `PAW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, status: 'saved', expiresAt: '25/11/2026',
    };
    mockCommunityStore.vouchers.unshift(v);
    return v;
  }
  if (path === '/vouchers/me') return mockCommunityStore.vouchers;
  if (path === '/reports') return { reportId: `rep_${Date.now()}` };
  return { ok: true };
}
