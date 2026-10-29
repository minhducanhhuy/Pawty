import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { formatVndCurrency } from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';

export const ProAndAdminPortal: React.FC = () => {
  const {
    bookings,
    updateBookingStatus,
    partners,
    reports,
    resolveContentReport,
    metrics,
    analyticsEvents,
    setDesktopFrameMode,
  } = usePawtyStore();

  const [activeTab, setActiveTab] = useState<'pro' | 'kpis' | 'moderation'>('pro');

  const cohortRetention = [
    { day: 'D1', pct: metrics.d1Retention },
    { day: 'D3', pct: 46 },
    { day: 'D7', pct: metrics.d7Retention },
    { day: 'D14', pct: 31 },
    { day: 'D21', pct: 27 },
    { day: 'D28', pct: metrics.d28Retention },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Portal Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <img
            src="/assets/pawty-icon.png"
            alt="Pawty Pro"
            className="w-11 h-11 rounded-2xl object-cover shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-[#2D3436]">
                Pawty Pro & Founder Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-xs font-extrabold">
                Layer 5 + Tầng 8 KPIs
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Quản lý Lịch hẹn Đối tác · North Star Metric · Kiểm duyệt nội dung 4 tầng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'pro', label: '💼 Pawty Pro (Đối tác)', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'kpis', label: '📊 North Star & KPIs', icon: <BarChart3 className="w-4 h-4" /> },
            {
              id: 'moderation',
              label: `🛡️ Kiểm duyệt (${reports.filter((r) => r.status === 'pending').length})`,
              icon: <ShieldAlert className="w-4 h-4" />,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === t.id
                  ? 'bg-[#2D3436] text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}

          <button
            onClick={() => setDesktopFrameMode('iphone')}
            className="px-3.5 py-2 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold"
          >
            ← Quay lại App Chủ nuôi
          </button>
        </div>
      </div>

      {/* TAB 1: PAWTY PRO PARTNER DASHBOARD */}
      {activeTab === 'pro' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs font-bold text-stone-400">Tổng Booking trong tháng</span>
              <p className="font-display text-2xl font-bold text-[#2D3436] mt-1">
                {bookings.length + 48} đơn
              </p>
              <span className="text-[11px] font-bold text-teal-700">
                Tỷ lệ hoàn tất: {metrics.bookingCompletionRate}% (Target ≥85%)
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs font-bold text-stone-400">
                Hoa hồng Pawty (12% đơn hoàn tất)
              </span>
              <p className="font-display text-2xl font-bold text-[#FF6F61] mt-1">
                {formatVndCurrency(metrics.bookingCommissionRevenueVnd)}
              </p>
              <span className="text-[11px] text-stone-500">
                Chỉ thu khi khách xác nhận hoàn thành
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs font-bold text-stone-400">Thời gian vận hành / đơn</span>
              <p className="font-display text-2xl font-bold text-[#2D3436] mt-1">
                {metrics.avgOpsMinutesPerBooking} phút/đơn
              </p>
              <span className="text-[11px] font-bold text-teal-700">
                ✓ Đạt ngưỡng Gate 4 (&lt;15 phút/yêu cầu)
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs font-bold text-stone-400">Điểm đánh giá Đối tác TB</span>
              <p className="font-display text-2xl font-bold text-amber-500 mt-1">
                ⭐ {metrics.avgPartnerRating} / 5.0
              </p>
              <span className="text-[11px] text-stone-500">100% từ giao dịch thật</span>
            </div>
          </div>

          {/* Partner Booking Queue */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">
                📅 Quản lý Lịch hẹn Đối tác (Pending → Confirmed → In-Progress → Completed)
              </h2>
              <span className="text-xs font-semibold text-stone-500">
                Tự động nhắc khách trước 24h
              </span>
            </div>

            <div className="space-y-3">
              {bookings.map((bk) => (
                <div
                  key={bk.id}
                  className="p-4 rounded-2xl bg-[#FDFBF7] border border-stone-200 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#2D3436]">
                        {bk.serviceNames.join(', ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#A3E4D7]/50 text-teal-950 text-xs font-bold uppercase">
                        {bk.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">
                      Khách: <strong>{bk.userName}</strong> · Boss: <strong>{bk.petName}</strong> ·
                      Cơ sở: <strong>{bk.partnerName}</strong>
                    </p>
                    <p className="text-xs font-mono text-[#FF6F61] font-bold">
                      ⏰ {bk.scheduledDate} lúc {bk.scheduledTime} · Giá:{' '}
                      {formatVndCurrency(bk.totalPriceVnd)} (Hoa hồng Pawty:{' '}
                      {formatVndCurrency(bk.commissionVnd)})
                    </p>
                    {bk.note && (
                      <p className="text-xs italic text-stone-500">Lưu ý của chủ nuôi: "{bk.note}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {bk.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(bk.id, 'confirmed')}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                      >
                        Xác nhận lịch
                      </button>
                    )}
                    {bk.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(bk.id, 'in_progress')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
                      >
                        Bắt đầu làm dịch vụ
                      </button>
                    )}
                    {(bk.status === 'confirmed' || bk.status === 'in_progress') && (
                      <button
                        onClick={() => updateBookingStatus(bk.id, 'completed')}
                        className="px-3.5 py-2 rounded-xl bg-[#FF6F61] text-white text-xs font-bold"
                      >
                        Hoàn tất & Ghi nhận doanh thu ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Directory Overview */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3">
            <h2 className="font-display text-base font-bold">
              🏥 Danh sách Cơ sở Đối tác Đã Xác Minh ({partners.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {partners.map((p) => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">{p.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">{p.operatingHours}</p>
                  <p className="text-xs font-bold text-[#FF6F61] mt-1">
                    ⭐ {p.ratingAvg} ({p.reviewCount} reviews) · Hoa hồng {p.commissionRatePercent}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NORTH STAR METRIC & KPI DECISION GATES (Tầng 8) */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {/* North Star Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2D3436] to-stone-800 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#A3E4D7]">
                <Sparkles className="w-3.5 h-3.5" /> NORTH STAR METRIC (TẦNG 8)
              </span>
              <h2 className="font-display text-xl font-bold">
                Số hộ/tháng hoàn thành ≥2 hành động chăm sóc có ích, trong đó ≥1 có phối hợp với
                Circle hoặc Đối tác
              </h2>
              <p className="text-xs text-stone-300">
                Không tính vanity metrics (mở app, cuộn bảng tin, nhấn thích).
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#A3E4D7] block font-bold">Tháng hiện tại</span>
              <span className="font-display text-4xl font-bold text-white">
                {metrics.northStarQualifiedHouseholds} hộ
              </span>
              <span className="block text-xs text-teal-300 font-bold">
                +15% vs tháng trước (Vượt ngưỡng Gate 4 ≥30 hộ)
              </span>
            </div>
          </div>

          {/* 3 Revenue Streams Breakdown (Tầng 5) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white border border-stone-200">
              <span className="text-xs font-bold text-stone-400">Tổng MRR Tháng</span>
              <p className="font-display text-2xl font-bold text-[#2D3436] mt-1">
                {formatVndCurrency(metrics.mrrVnd)}
              </p>
              <span className="text-[11px] font-bold text-teal-700">+40% MoM · Kịch bản A đạt</span>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-stone-200">
              <span className="text-xs font-bold text-stone-400">
                #1 Phí Hoa hồng Dịch vụ (12%)
              </span>
              <p className="font-display text-xl font-bold text-[#FF6F61] mt-1">
                {formatVndCurrency(metrics.bookingCommissionRevenueVnd)}
              </p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-stone-200">
              <span className="text-xs font-bold text-stone-400">
                #2 Gói Sen VIP (49.000đ/tháng)
              </span>
              <p className="font-display text-xl font-bold text-amber-600 mt-1">
                {formatVndCurrency(metrics.vipSubscriptionRevenueVnd)}
              </p>
            </div>
            <div className="p-4 rounded-3xl bg-white border border-stone-200">
              <span className="text-xs font-bold text-stone-400">
                #3 Native Ads & SOS Boss Lạc
              </span>
              <p className="font-display text-xl font-bold text-teal-700 mt-1">
                {formatVndCurrency(metrics.nativeAdsRevenueVnd + metrics.sosRevenueVnd)}
              </p>
            </div>
          </div>

          {/* Cohort Retention & Decision Gates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-4">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FF6F61]" />
                Retention Curve (Cohort Analysis D1 → D28)
              </h3>
              <div className="flex items-end gap-3 h-40 pt-4 px-2">
                {cohortRetention.map((c) => (
                  <div key={c.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#2D3436]">{c.pct}%</span>
                    <div
                      style={{ height: `${c.pct * 1.8}px` }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#FF6F61] to-[#A3E4D7]"
                    />
                    <span className="text-xs font-bold text-stone-500">{c.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />4 Ngưỡng Quyết Định (Decision Gates)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-[#A3E4D7]/30 flex items-center justify-between">
                  <span>Gate 1 (Ngày 10): ≥15/20 hộ sẵn sàng thử</span>
                  <strong className="text-teal-900">PASS (18/20)</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#A3E4D7]/30 flex items-center justify-between">
                  <span>
                    Gate 2 (Ngày 17): Activation ≥60% ({metrics.activationRate7d}%) & Circle ≥30% (
                    {metrics.circleInviteRate14d}%)
                  </span>
                  <strong className="text-teal-900">PASS</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#A3E4D7]/30 flex items-center justify-between">
                  <span>Gate 3 (Ngày 38): W4 Retention ≥40% ({metrics.w4ActiveRate}%)</span>
                  <strong className="text-teal-900">PASS</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#A3E4D7]/30 flex items-center justify-between">
                  <span>
                    Gate 4 (Ngày 90): North Star ≥30 hộ ({metrics.northStarQualifiedHouseholds}) &
                    Margin &gt; 0
                  </span>
                  <strong className="text-teal-900">READY TO SCALE</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy-Compliant Event Stream */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-2">
            <h3 className="font-display text-sm font-bold">
              🔒 Nhật ký Analytics Events (Privacy-Compliant — Không lưu PII)
            </h3>
            {analyticsEvents.length === 0 ? (
              <p className="text-xs text-stone-500">
                Hãy tương tác trên App (hoàn thành việc, đăng bài, đặt lịch) để xem event log
                real-time.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {analyticsEvents.slice(0, 8).map((ev) => (
                  <div
                    key={ev.id}
                    className="px-3 py-1.5 rounded-xl bg-stone-50 font-mono text-xs flex items-center justify-between"
                  >
                    <span className="font-bold text-[#FF6F61]">{ev.eventType}</span>
                    <span className="text-stone-600">{JSON.stringify(ev.eventData)}</span>
                    <span className="text-stone-400 text-[10px]">{ev.createdAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT MODERATION PIPELINE (Tầng 2 Section 6) */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 space-y-2">
            <h2 className="font-display text-base font-bold">
              🛡️ Hệ thống Kiểm duyệt Nội dung 4 Tầng (Auto-Filter → AI Pet-Relevance → Community
              Report → Human Review)
            </h2>
            <p className="text-xs text-stone-500">
              Tỷ lệ bài bị gắn cờ hiện tại: <strong>{metrics.moderationFlagRate}%</strong> (Mục tiêu
              ≤5%). Tự động chặn mua bán thú cưng, phối giống, tự kê đơn thuốc.
            </p>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-3xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase">
                      {rep.reason}
                    </span>
                    <span className="text-xs text-stone-400">
                      Báo cáo bởi {rep.reporterName} · {rep.createdAt}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#2D3436]">
                    Nội dung bị báo cáo: "{rep.targetPreview}"
                  </p>
                  <p className="text-xs text-stone-600">{rep.description}</p>
                  {rep.actionTaken && (
                    <p className="text-xs font-bold text-teal-700">✓ Đã xử lý: {rep.actionTaken}</p>
                  )}
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        resolveContentReport(rep.id, 'Đã gỡ bài viết & Cảnh cáo tài khoản')
                      }
                      className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                    >
                      Gỡ nội dung & Cảnh cáo
                    </button>
                    <button
                      onClick={() => resolveContentReport(rep.id, 'Đã bỏ qua (Nội dung hợp lệ)')}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                    >
                      Bỏ qua
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

