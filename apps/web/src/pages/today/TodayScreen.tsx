import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, X } from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { WEB_THEMES } from '../../mocks/seedData';

export const TodayScreen: React.FC = () => {
  const {
    bookings,
    updateBookingStatus,
    setActiveModal,
    setActiveTab,
    setExploreSubTab,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'history'>('all');

  const filteredBookings = bookings.filter((bk) => {
    if (statusFilter === 'upcoming') {
      return bk.status === 'confirmed' || bk.status === 'pending';
    }
    if (statusFilter === 'history') {
      return bk.status === 'completed' || bk.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="p-4 pb-6 space-y-3.5">
      {/* Header Card */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="p-4 rounded-2xl border space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 style={{ color: theme.text }} className="text-base font-extrabold">
              Quản lý Lịch hẹn
            </h1>
            <p style={{ color: theme.textSoft }} className="text-xs mt-0.5">
              Theo dõi lịch hẹn Spa, khám thú y và lưu trú của thú cưng
            </p>
          </div>
          <button
            onClick={() => setActiveModal('book_service')}
            style={{ backgroundColor: theme.primary }}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đặt lịch mới</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
          className="grid grid-cols-3 p-1 rounded-xl border"
        >
          {(
            [
              { id: 'all', label: `Tất cả (${bookings.length})` },
              {
                id: 'upcoming',
                label: `Sắp tới (${bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length})`,
              },
              {
                id: 'history',
                label: `Lịch sử (${bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled').length})`,
              },
            ] as const
          ).map((f) => {
            const active = statusFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  backgroundColor: active ? theme.surface : 'transparent',
                  color: active ? theme.text : theme.textSoft,
                }}
                className="py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      {filteredBookings.length === 0 ? (
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="p-8 rounded-2xl border text-center space-y-2"
        >
          <Calendar style={{ color: theme.textSoft }} className="w-8 h-8 mx-auto opacity-70" />
          <p style={{ color: theme.text }} className="text-sm font-bold">
            Chưa có lịch hẹn nào
          </p>
          <p style={{ color: theme.textSoft }} className="text-xs">
            Khám phá các cơ sở Spa & Phòng khám thú y uy tín để đặt lịch cho thú cưng của bạn.
          </p>
          <button
            onClick={() => {
              setActiveTab('services');
              setExploreSubTab('services');
            }}
            style={{ backgroundColor: theme.primary }}
            className="mt-2 px-4 py-2 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Xem danh sách Dịch vụ</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBookings.map((bk) => (
            <div
              key={bk.id}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="p-4 rounded-2xl border space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                >
                  Bé {bk.petName}
                </span>
                <span
                  style={{
                    backgroundColor:
                      bk.status === 'confirmed'
                        ? theme.primarySoft
                        : bk.status === 'pending'
                        ? theme.primarySoft
                        : theme.bg,
                    color:
                      bk.status === 'confirmed'
                        ? theme.primary
                        : bk.status === 'pending'
                        ? theme.primary
                        : theme.textSoft,
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                >
                  {bk.status === 'confirmed'
                    ? 'Đã xác nhận'
                    : bk.status === 'pending'
                    ? 'Chờ xác nhận'
                    : bk.status === 'completed'
                    ? 'Đã hoàn thành'
                    : 'Đã hủy'}
                </span>
              </div>

              <div>
                <h2 style={{ color: theme.text }} className="text-sm font-extrabold">
                  {bk.serviceNames.join(', ')}
                </h2>
                <p style={{ color: theme.primary }} className="text-xs font-bold mt-0.5">
                  {bk.partnerName}
                </p>
              </div>

              <div
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                className="p-3 rounded-xl border space-y-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clock style={{ color: theme.textSoft }} className="w-3.5 h-3.5 shrink-0" />
                  <span style={{ color: theme.text }} className="font-semibold">
                    {bk.scheduledDate} · Lúc {bk.scheduledTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin style={{ color: theme.textSoft }} className="w-3.5 h-3.5 shrink-0" />
                  <span style={{ color: theme.textSoft }}>
                    Khu đô thị Vinhomes Grand Park, TP. Thủ Đức
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span style={{ color: theme.text }} className="text-xs font-extrabold">
                  Chi phí: {bk.totalPriceVnd.toLocaleString('vi-VN')}đ
                </span>
                {(bk.status === 'confirmed' || bk.status === 'pending') && (
                  <button
                    onClick={() => updateBookingStatus(bk.id, 'cancelled')}
                    className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hủy lịch hẹn</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
