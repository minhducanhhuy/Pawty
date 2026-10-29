import React, { useState } from 'react';
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Star,
} from 'lucide-react';
import { formatVndCurrency } from '@pawty/utils';

export const PartnerAdminApp: React.FC = () => {
  const [tab, setTab] = useState<'bookings' | 'services' | 'kpis'>('bookings');
  const [bookings, setBookings] = useState([
    {
      id: 'bk-101',
      customerName: 'Mai Nguyễn (@mai_petmom)',
      petName: 'Lu (Golden Retriever · 28kg)',
      serviceName: 'Combo Full Grooming + Spa Sục Ozone',
      priceVnd: 350000,
      commissionVnd: 42000,
      scheduledAt: 'Thứ 7, 02/11/2026 · 10:00 AM',
      note: 'Bé hơi sợ tiếng máy sấy lớn, nhờ kỹ thuật viên dùng lồng sấy tĩnh âm.',
      status: 'confirmed',
    },
    {
      id: 'bk-102',
      customerName: 'Hòa Trần (@hoa_corgi)',
      petName: 'Miu (Pembroke Welsh Corgi · 11.5kg)',
      serviceName: 'Tắm thảo dược + Cắt mài móng',
      priceVnd: 150000,
      commissionVnd: 18000,
      scheduledAt: 'Chủ nhật, 03/11/2026 · 14:00 PM',
      note: 'Bé rất ngoan, thích ăn bánh thưởng sau khi sấy.',
      status: 'pending',
    },
  ]);

  const updateStatus = (id: string, status: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3436] p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/assets/pawty-icon.png"
            alt="Pawty Pro"
            className="w-12 h-12 rounded-2xl object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">Pawty Pro — Partner Console</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-xs font-extrabold">
                Layer 5 · Verified Partner
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Cơ sở: PetSpa Bubble & Paws (Vinhomes Grand Park Q9) · Hoa hồng đối tác: 12%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 ${
              tab === 'bookings' ? 'bg-[#FF6F61] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> Lịch hẹn ({bookings.length})
          </button>
          <button
            onClick={() => setTab('services')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 ${
              tab === 'services' ? 'bg-[#FF6F61] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Bảng giá & Hồ sơ cơ sở
          </button>
          <button
            onClick={() => setTab('kpis')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 ${
              tab === 'kpis' ? 'bg-[#2D3436] text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> North Star & Moderation
          </button>
        </div>
      </header>

      {tab === 'bookings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200">
              <span className="text-xs font-bold text-stone-400">Doanh thu dịch vụ tháng này</span>
              <p className="font-display text-2xl font-bold text-[#2D3436] mt-1">
                {formatVndCurrency(12500000)}
              </p>
              <span className="text-xs text-teal-700 font-bold">
                ✓ 50 đơn hoàn tất · Đánh giá ⭐ 4.8/5
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200">
              <span className="text-xs font-bold text-stone-400">
                Phí hoa hồng Pawty (12% đơn thành công)
              </span>
              <p className="font-display text-2xl font-bold text-[#FF6F61] mt-1">
                {formatVndCurrency(1500000)}
              </p>
              <span className="text-xs text-stone-500">Không thu phí nếu khách hủy lịch</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200">
              <span className="text-xs font-bold text-stone-400">Thời gian phản hồi TB</span>
              <p className="font-display text-2xl font-bold text-teal-700 mt-1">18 phút</p>
              <span className="text-xs text-stone-500">Mục tiêu SLA: ≤ 2 giờ</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3">
            <h2 className="font-display text-lg font-bold">Danh sách Đặt lịch từ Chủ nuôi</h2>
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#FDFBF7] border border-stone-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">{b.serviceName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-xs font-bold uppercase">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Khách hàng: <strong>{b.customerName}</strong> · Boss: <strong>{b.petName}</strong>
                  </p>
                  <p className="text-xs font-mono font-bold text-[#FF6F61]">
                    📅 {b.scheduledAt} · {formatVndCurrency(b.priceVnd)}
                  </p>
                  <p className="text-xs italic text-stone-500">Lưu ý hành vi: "{b.note}"</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(b.id, 'confirmed')}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, 'completed')}
                    className="px-3.5 py-2 rounded-xl bg-[#FF6F61] text-white text-xs font-bold"
                  >
                    Hoàn tất dịch vụ ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              Hồ sơ Cơ sở & Danh mục Dịch vụ Đã Xác Minh
            </h2>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" /> 4.8 (156 đánh giá giao dịch thật)
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Địa chỉ: T12-18 Khu Manhattan, Vinhomes Grand Park, TP. Thủ Đức · Giờ mở cửa: 08:30 –
            20:00
          </p>
        </div>
      )}

      {tab === 'kpis' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <div className="flex items-center gap-2 text-[#FF6F61]">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold">
              North Star Metric & Hệ thống Kiểm duyệt (Tầng 8)
            </h2>
          </div>
          <p className="text-sm font-bold">
            North Star hiện tại: 45 hộ đạt chuẩn / 127 hộ active tháng này (≥2 hành động chăm sóc có
            ích, ≥1 có phối hợp với Circle hoặc Đối tác).
          </p>
          <div className="p-4 rounded-2xl bg-[#A3E4D7]/30 border border-[#A3E4D7] text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-teal-800" />
              Trạng thái Content Moderation Pipeline:
            </p>
            <p>
              • Layer 1 Auto-Filter & Layer 2 AI Pet-Relevance đang hoạt động 100% (Tự động chặn bài
              mua bán/phối giống và tự động gắn khuyến cáo sức khỏe ⚕️).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerAdminApp;

