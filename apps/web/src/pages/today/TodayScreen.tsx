import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  Crown,
  FileText,
  Plus,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';

export const TodayScreen: React.FC = () => {
  const {
    user,
    pets,
    activePetId,
    setActivePetId,
    careTasks,
    toggleCareTaskComplete,
    circleActivities,
    circleMembers,
    bookings,
    walkAppointments,
    updateWalkAppointmentStatus,
    sosAlerts,
    setActiveModal,
    setActiveTab,
    setExploreSubTab,
  } = usePawtyStore();

  const [completionModalTaskId, setCompletionModalTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];
  const petTasks = careTasks.filter((t) => t.petId === activePet.id);
  const pendingCount = petTasks.filter((t) => t.status === 'pending').length;
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );
  const pendingWalks = walkAppointments.filter((w) => w.status === 'pending');
  const activeSos = sosAlerts.find((s) => s.status === 'active');

  const handleConfirmTaskWithNote = () => {
    if (!completionModalTaskId) return;
    toggleCareTaskComplete(
      completionModalTaskId,
      completionNote || `Đã hoàn thành chăm sóc cho ${activePet.name} đúng giờ.`
    );
    setCompletionModalTaskId(null);
    setCompletionNote('');
  };

  return (
    <div className="p-4 pb-8 space-y-5">
      {/* Header Greeting + Boss Switcher Pills */}
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#FF6F61]">Chào buổi sáng,</span>
            {user.isVip && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                <Crown className="w-3 h-3 text-amber-600" /> Sen VIP
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2D3436] leading-tight">
            {user.displayName}! 🐾
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {pendingCount > 0
              ? `${activePet.name} có ${pendingCount} việc cần làm hôm nay`
              : `Hôm nay ${activePet.name} đã hoàn thành hết việc rồi!`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveModal('sos_alert')}
            title="Phát tín hiệu SOS Tìm Boss Lạc"
            className="p-2.5 rounded-2xl bg-red-50 text-[#E17055] hover:bg-red-100 transition-colors border border-red-200/60"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveModal('handover_note')}
            title="Ghi chú bàn giao khi đi vắng"
            className="p-2.5 rounded-2xl bg-white text-[#2D3436] hover:bg-stone-100 transition-colors border border-stone-200/80 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-teal-700" />
          </button>
        </div>
      </header>

      {/* Active Boss Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {pets.map((pet) => {
          const selected = pet.id === activePet.id;
          return (
            <button
              key={pet.id}
              onClick={() => setActivePetId(pet.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all ${
                selected
                  ? 'bg-[#2D3436] text-white border-[#2D3436] shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              <img
                src={pet.avatarUrl}
                alt={pet.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{pet.name}</span>
              <span className="text-[10px] opacity-80">
                ({pet.species === 'dog' ? 'Chó' : 'Mèo'})
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveModal('add_pet_wizard')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-[#FF6F61] text-[#FF6F61] text-xs font-bold shrink-0 bg-[#FF6F61]/5"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm Boss
        </button>
      </div>

      {/* Emergency SOS Banner if active */}
      {activeSos && (
        <div className="p-3.5 rounded-2xl bg-red-600 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">
                🚨 ĐANG PHÁT TÍN HIỆU SOS ({activeSos.radiusKm}KM): TÌM BÉ {activeSos.petName}
              </p>
              <p className="text-[11px] opacity-95">
                {activeSos.sightings.length} cư dân vừa gửi vị trí nhìn thấy Boss!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('explore');
              setExploreSubTab('feed');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white text-red-700 text-[11px] font-extrabold shrink-0"
          >
            Xem vị trí
          </button>
        </div>
      )}

      {/* Species-Specific Quick Care Banner (Layer 1 Spec) */}
      <div className="p-3.5 rounded-2xl bg-[#A3E4D7]/30 border border-[#A3E4D7] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{activePet.species === 'dog' ? '🦮' : '🐱'}</span>
          <div>
            <p className="text-xs font-extrabold text-teal-950">
              {activePet.species === 'dog'
                ? `Chế độ Chăm Cún (${activePet.breed})`
                : `Chế độ Chăm Mèo (${activePet.breed})`}
            </p>
            <p className="text-[11px] text-teal-900">
              {activePet.species === 'dog'
                ? `Mức năng lượng ${activePet.energyLevel.toUpperCase()} · Khuyến nghị dắt dạo 2 lần/ngày · Sổ tiêm: Đầy đủ ✓`
                : `Lịch dọn khay cát 2 lần/ngày · ${
                    activePet.speciesMeta?.coatCycleNote || 'Theo dõi chu kỳ lông định kỳ'
                  }`}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: VIỆC CẦN LÀM (CARE TASKS) */}
      <section className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#FF6F61]" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#2D3436]">
              📋 Việc cần làm hôm nay
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('new_task')}
            className="text-xs font-bold text-[#FF6F61] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Giao việc mới
          </button>
        </div>

        {petTasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-stone-500">
              Hôm nay Boss rảnh rồi! 🐾 Thêm việc chăm sóc hoặc khám phá cộng đồng.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {petTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-stone-50/80 border-stone-200/60 opacity-80'
                      : 'bg-[#FDFBF7] border-stone-200 hover:border-[#FF6F61]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        if (isDone) {
                          toggleCareTaskComplete(task.id);
                        } else {
                          setCompletionModalTaskId(task.id);
                        }
                      }}
                      aria-label={`Đánh dấu hoàn thành ${task.title}`}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                        isDone
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-[#FF6F61] bg-white hover:bg-[#FF6F61]/10'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold leading-snug ${
                          isDone ? 'line-through text-stone-400' : 'text-[#2D3436]'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-stone-500 mt-0.5">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                          👤 {task.assignedToName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-stone-500 font-mono">
                          <Clock className="w-3 h-3" /> {task.dueTime}
                        </span>
                        {isDone && task.completedByName && (
                          <span className="text-teal-700 font-bold">
                            ✓ Đã làm bởi {task.completedByName}
                          </span>
                        )}
                      </div>
                      {isDone && task.completionNote && (
                        <p className="mt-1.5 text-[11px] italic text-teal-900 bg-[#A3E4D7]/25 px-2.5 py-1 rounded-xl">
                          "{task.completionNote}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inline Task Completion Note Prompt */}
        {completionModalTaskId && (
          <div className="mt-3 p-3 rounded-2xl bg-[#FF6F61]/8 border border-[#FF6F61]/30 space-y-2">
            <p className="text-xs font-bold text-[#2D3436]">
              Xác nhận hoàn thành & Báo cho Vòng chăm sóc (Circle):
            </p>
            <input
              type="text"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Ghi chú nhanh (VD: Lu ăn hết sạch bát sáng rồi nha)..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCompletionModalTaskId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTaskWithNote}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF6F61] text-white text-xs font-bold shadow-xs"
              >
                Xác nhận Hoàn tất ✓
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: SẮP TỚI (UPCOMING BOOKINGS) */}
      <section className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#2D3436]">
              📅 Lịch dịch vụ sắp tới
            </h2>
          </div>
          <button
            onClick={() => {
              setActiveTab('explore');
              setExploreSubTab('services');
            }}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Đặt thêm
          </button>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-xs text-stone-500 py-2">
            Chưa có lịch hẹn nào. Đặt dịch vụ Grooming hoặc Khám định kỳ cho Boss nhé!
          </p>
        ) : (
          <div className="space-y-2.5">
            {upcomingBookings.map((bk) => (
              <div
                key={bk.id}
                className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={bk.partnerAvatar}
                    alt={bk.partnerName}
                    className="w-11 h-11 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#2D3436] truncate">
                        {bk.serviceNames[0]}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          bk.status === 'confirmed'
                            ? 'bg-[#A3E4D7]/50 text-teal-950'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {bk.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      @ {bk.partnerName} · Boss: <strong>{bk.petName}</strong>
                    </p>
                    <p className="text-[11px] font-mono font-bold text-[#FF6F61] mt-0.5">
                      🔔 {bk.scheduledDate} · {bk.scheduledTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('explore');
                    setExploreSubTab('services');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 shrink-0"
                >
                  Chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: VÒNG CHĂM SÓC (PAWTY CIRCLE ACTIVITY) */}
      <section className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF6F61]" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#2D3436]">
              👥 Vòng chăm sóc ({circleMembers.length} người)
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('invite_circle')}
            className="text-xs font-bold text-[#FF6F61] flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" /> Mời người nhà
          </button>
        </div>

        {/* Member Avatars Row */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100 overflow-x-auto no-scrollbar">
          {circleMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 shrink-0"
            >
              <img
                src={member.avatarUrl}
                alt={member.displayName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-[11px] font-bold text-stone-700">{member.displayName}</span>
              <span className="text-[10px] text-stone-400">({member.relationLabel})</span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {circleActivities.slice(0, 4).map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-2xl bg-[#FDFBF7] border border-stone-100 flex items-start gap-2.5"
            >
              <img
                src={act.actorAvatar}
                alt={act.actorName}
                className="w-8 h-8 rounded-full object-cover mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#2D3436] leading-snug">
                  <strong>{act.actorName}</strong> {act.actionText}
                </p>
                {act.detailText && (
                  <p className="text-[11px] text-stone-600 mt-0.5 italic">{act.detailText}</p>
                )}
                <span className="text-[10px] text-stone-400">{act.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: YÊU CẦU ĐANG CHỜ (PENDING WALK APPOINTMENTS) */}
      <section className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#2D3436]">
              🔔 Yêu cầu hẹn dạo đang chờ
            </h2>
          </div>
          <Sparkles className="w-4 h-4 text-[#FF6F61]" />
        </div>

        {pendingWalks.length === 0 ? (
          <p className="text-xs text-stone-500">
            Tất cả lời hẹn dắt dạo đã được xác nhận.
          </p>
        ) : (
          <div className="space-y-2.5">
            {pendingWalks.map((walk) => (
              <div
                key={walk.id}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF6F61]/8 to-[#A3E4D7]/20 border border-[#FF6F61]/25"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-[#2D3436]">
                    🐕 Hẹn dắt dạo với {walk.partnerName}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#FF6F61]">
                    Trung điểm
                  </span>
                </div>
                <p className="text-xs font-semibold text-teal-900 mt-1">
                  📍 {walk.locationName} ({walk.locationAddress})
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  📅 {walk.scheduledDate} · {walk.scheduledTime}
                </p>
                {walk.note && (
                  <p className="text-[11px] italic text-stone-500 mt-1">"{walk.note}"</p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateWalkAppointmentStatus(walk.id, 'confirmed')}
                    className="flex-1 py-2 rounded-xl bg-[#FF6F61] text-white text-xs font-bold shadow-xs"
                  >
                    Chấp nhận hẹn
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700"
                  >
                    Xem trong Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

