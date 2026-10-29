import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Crown,
  Download,
  Lock,
  MapPin,
  PartyPopper,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { CareTaskCategory, CircleRole, PostContentType, PostVisibility } from '@pawty/types';
import {
  buildVietQrUrl,
  formatDistanceLabel,
  formatVndCurrency,
  suggestMidpointWalkPlaces,
} from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';

export const GlobalModals: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    pets,
    activePetId,
    circleMembers,
    places,
    partners,
    selectedPartnerIdForBooking,
    selectedPublicPet,
    handoverNote,
    toggleHandoverChecklistItem,
    createSocialPost,
    createCareTask,
    inviteCircleMember,
    revokeCircleMember,
    createServiceBooking,
    createWalkAppointment,
    upgradeToVipPlan,
    activateSosAlert,
    updatePrivacySettings,
    latestMatchCelebration,
    dismissMatchCelebration,
    setActiveTab,
    setActiveConversationId,
    showToast,
  } = usePawtyStore();

  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];

  // Create Post State
  const [postType, setPostType] = useState<PostContentType>('moment');
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'
  );
  const [postHashtags, setPostHashtags] = useState('#GoldenRetriever #VinhomesQ9');
  const [postVisibility, setPostVisibility] = useState<PostVisibility>('public');

  // Create Task State
  const [taskTitle, setTaskTitle] = useState('Cho Boss ăn tối + bổ sung men tiêu hóa');
  const [taskDesc, setTaskDesc] = useState('Nhớ rửa sạch bát ăn trước khi đổ hạt.');
  const [taskCategory, setTaskCategory] = useState<CareTaskCategory>('feeding');
  const [taskAssignee, setTaskAssignee] = useState(circleMembers[1]?.userId || user.id);
  const [taskTime, setTaskTime] = useState('18:30');

  // Circle Invite State
  const [inviteName, setInviteName] = useState('Chị Thảo (Bạn thân)');
  const [inviteRelation, setInviteRelation] = useState('Bạn thân cùng tầng');
  const [inviteRole, setInviteRole] = useState<CircleRole>('caretaker');

  // Booking Service State
  const activePartner =
    partners.find((p) => p.id === selectedPartnerIdForBooking) ?? partners[0];
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    activePartner.services[0]?.id || 'srv-1',
  ]);
  const [bookingDate, setBookingDate] = useState('Thứ 7, 08/11/2026');
  const [bookingSlot, setBookingSlot] = useState('10:00');
  const [bookingNote, setBookingNote] = useState('Boss hơi nhát máy sấy, nhờ kỹ thuật viên sấy nhẹ.');

  // Walk Scheduler State
  const partnerGeo = { lat: 10.8435, lng: 106.8271 };
  const midpointResult = suggestMidpointWalkPlaces(user.location, partnerGeo, places, 3);
  const [walkDate, setWalkDate] = useState('Chủ nhật, 09/11/2026');
  const [walkTime, setWalkTime] = useState('07:00 AM');
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(0);
  const [walkNote, setWalkNote] = useState('Mang nước uống và bóng tennis cho 2 bé nha!');

  // VIP State
  const [selectedVipPlan, setSelectedVipPlan] = useState<'basic' | 'sen_vip' | 'sen_vip_yearly'>(
    'sen_vip'
  );

  // SOS State
  const [sosLocation, setSosLocation] = useState('Công viên Ánh Sáng Vinhomes Q9 (Khu B)');
  const [sosDesc, setSosDesc] = useState(
    'Bé đeo vòng cổ màu xanh mint có gắn thẻ tên Pawty, rất thân thiện khi gọi tên.'
  );
  const [sosReward, setSosReward] = useState('Hậu tạ 1.000.000đ cho người tìm thấy');

  // Kiosk PIN State
  const [kioskPin, setKioskPin] = useState('');

  // Match Celebration Overlay
  if (latestMatchCelebration) {
    return (
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border-4 border-[#FF6F61]">
          <div className="w-16 h-16 rounded-full bg-[#FF6F61]/15 text-[#FF6F61] flex items-center justify-center mx-auto">
            <PartyPopper className="w-9 h-9" />
          </div>
          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#A3E4D7] text-teal-950">
            🎉 IT'S A PAWTY MATCH!
          </span>
          <h3 className="font-display text-2xl font-bold text-[#2D3436]">
            {activePet.name} & {latestMatchCelebration.partnerPetName} đã hợp cạ!
          </h3>
          <p className="text-xs text-stone-600">{latestMatchCelebration.matchReason}</p>

          <div className="flex items-center justify-center gap-4 py-2">
            <img
              src={activePet.avatarUrl}
              alt={activePet.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#FF6F61]"
            />
            <span className="text-2xl">🐾</span>
            <img
              src={latestMatchCelebration.partnerPetAvatar}
              alt={latestMatchCelebration.partnerPetName}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#A3E4D7]"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                dismissMatchCelebration();
                setActiveTab('chat');
                setActiveConversationId('conv-1');
              }}
              className="w-full py-3 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold shadow-md"
            >
              Nhắn tin & Hẹn dắt dạo trung điểm ngay
            </button>
            <button
              onClick={dismissMatchCelebration}
              className="w-full py-2 text-xs font-bold text-stone-500"
            >
              Tiếp tục quẹt Radar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeModal) return null;

  // 1. CREATE BOTTOM SHEET (Tầng 3 Section 5)
  if (activeModal === 'create_sheet') {
    const actions = [
      {
        id: 'new_moment',
        icon: '📸',
        title: 'Đăng khoảnh khắc',
        desc: 'Chia sẻ ảnh/video Boss, mẹo chăm sóc hoặc review địa điểm',
      },
      {
        id: 'new_task',
        icon: '📋',
        title: 'Tạo việc chăm sóc',
        desc: 'Thêm việc cần làm và giao cho thành viên Vòng chăm sóc (Circle)',
      },
      {
        id: 'invite_circle',
        icon: '🤝',
        title: 'Gửi yêu cầu kết nối Circle',
        desc: 'Mời người nhà, bạn bè cùng chăm sóc hoặc nhận bàn giao',
      },
      {
        id: 'book_service',
        icon: '📅',
        title: 'Đặt dịch vụ xác minh',
        desc: 'Grooming, khám định kỳ, dắt dạo từ đối tác uy tín',
      },
      {
        id: 'new_question',
        icon: '❓',
        title: 'Đặt câu hỏi cộng đồng',
        desc: 'Hỏi Bác sĩ thú y xác minh & các chủ nuôi giàu kinh nghiệm',
      },
    ];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-3 shadow-2xl animate-in slide-in-from-bottom">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-1" />
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-[#2D3436]">Tạo mới trên Pawty</h3>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full bg-stone-100 text-stone-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {actions.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  if (act.id === 'new_question') {
                    setPostType('question');
                    setActiveModal('new_moment');
                  } else {
                    setPostType('moment');
                    setActiveModal(act.id as typeof activeModal);
                  }
                }}
                className="w-full p-3.5 rounded-2xl bg-[#FDFBF7] hover:bg-[#FF6F61]/10 border border-stone-200/80 flex items-center gap-3.5 text-left transition-colors"
              >
                <span className="text-2xl">{act.icon}</span>
                <div>
                  <p className="text-xs font-extrabold text-[#2D3436]">{act.title}</p>
                  <p className="text-[11px] text-stone-500">{act.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. NEW MOMENT / QUESTION MODAL WITH MODERATION PIPELINE (Tầng 3 Section 5)
  if (activeModal === 'new_moment' || activeModal === 'new_question') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <button
              onClick={() => setActiveModal(null)}
              className="text-xs font-bold text-stone-500"
            >
              ✕ Đóng
            </button>
            <h3 className="font-display text-base font-bold">Bài viết mới</h3>
            <button
              onClick={() => {
                const tags = postHashtags
                  .split(/\s+/)
                  .map((t) => t.trim())
                  .filter(Boolean);
                createSocialPost({
                  contentType: postType,
                  textContent: postText,
                  imageUrl: postType === 'question' ? undefined : postImage,
                  hashtags: tags,
                  visibility: postVisibility,
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF6F61] text-white text-xs font-bold"
            >
              Đăng bài
            </button>
          </div>

          {/* Content Type Selector (7 Types in Tầng 2 Section 2.1) */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              Loại nội dung (7 Content Types):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'moment', label: '📸 Khoảnh khắc' },
                { id: 'care_log', label: '📋 Nhật ký chăm' },
                { id: 'question', label: '❓ Hỏi đáp' },
                { id: 'tip', label: '💡 Mẹo hay' },
                { id: 'place_review', label: '📍 Review chỗ chơi' },
              ].map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => setPostType(ct.id as PostContentType)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    postType === ct.id
                      ? 'bg-[#2D3436] text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Viết gì đó về Boss... (Thử gõ 'tiêm phòng' để xem tự động gắn Lưu ý Y khoa ⚕️, hoặc thử gõ 'bán chó / phối giống' để kiểm tra bộ lọc chặn vi phạm)"
            className="w-full p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200 text-xs focus:outline-none focus:border-[#FF6F61]"
          />

          {postType !== 'question' && (
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                URL Ảnh / Video của Boss:
              </label>
              <input
                type="text"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                🐾 Tag Boss
              </label>
              <div className="px-3 py-2 rounded-xl bg-[#A3E4D7]/30 text-teal-950 text-xs font-bold">
                {activePet.name} ({activePet.breed})
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                👁️ Ai có thể xem?
              </label>
              <select
                value={postVisibility}
                onChange={(e) => setPostVisibility(e.target.value as PostVisibility)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
              >
                <option value="public">Công khai</option>
                <option value="circle_only">Chỉ Vòng Circle</option>
                <option value="private">Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              # Hashtag thông minh
            </label>
            <input
              type="text"
              value={postHashtags}
              onChange={(e) => setPostHashtags(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#FF6F61]"
            />
          </div>
        </div>
      </div>
    );
  }

  // 3. NEW CARE TASK MODAL
  if (activeModal === 'new_task') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">📋 Tạo việc chăm sóc & Giao việc</h3>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Tên công việc *</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Giao cho thành viên trong Vòng chăm sóc (Circle)
              </label>
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
              >
                {circleMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName} ({m.relationLabel})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Danh mục</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as CareTaskCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  <option value="feeding">🍖 Cho ăn</option>
                  <option value="medicine">💊 Thuốc / Vitamin</option>
                  <option value="walk">🦮 Dắt dạo</option>
                  <option value="grooming">🛁 Tắm / Chải lông</option>
                  <option value="litter">🧹 Dọn khay cát</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Giờ nhắc việc</label>
                <input
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Ghi chú hướng dẫn</label>
              <input
                type="text"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>

          <button
            onClick={() =>
              createCareTask({
                petId: activePet.id,
                title: taskTitle,
                description: taskDesc,
                category: taskCategory,
                assignedTo: taskAssignee,
                dueDate: '2026-10-29',
                dueTime: taskTime,
                isRecurring: true,
              })
            }
            className="w-full py-3 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold shadow-md"
          >
            Lưu & Bắn thông báo cho Circle
          </button>
        </div>
      </div>
    );
  }

  // 4. CIRCLE INVITE & RBAC MANAGEMENT MODAL (Layer 2)
  if (activeModal === 'invite_circle') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">
              👥 Vòng Chăm Sóc (Pawty Circle RBAC)
            </h3>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="space-y-2">
            {circleMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={m.avatarUrl}
                    alt={m.displayName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold">{m.displayName}</p>
                    <p className="text-[11px] text-stone-500">
                      {m.relationLabel} · Quyền: <strong>{m.role.toUpperCase()}</strong> · Mã:{' '}
                      <span className="font-mono">{m.inviteCode}</span>
                    </p>
                  </div>
                </div>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => revokeCircleMember(m.id)}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Thu hồi
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
            <p className="text-xs font-extrabold text-[#2D3436]">
              + Mời thêm người thân / bạn bè vào Circle
            </p>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Tên thành viên..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={inviteRelation}
                onChange={(e) => setInviteRelation(e.target.value)}
                placeholder="Mối quan hệ (Mẹ, Bạn...)"
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CircleRole)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold"
              >
                <option value="caretaker">Nhận việc & Cập nhật</option>
                <option value="viewer">Chỉ xem hồ sơ</option>
              </select>
            </div>
            <button
              onClick={() => inviteCircleMember(inviteName, inviteRelation, inviteRole)}
              className="w-full py-2.5 rounded-xl bg-[#FF6F61] text-white text-xs font-bold"
            >
              Tạo mã mời & Thêm vào Circle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. CARE HANDOVER CHECKLIST MODAL
  if (activeModal === 'handover_note') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">
              📋 Ghi Chú Bàn Giao Khi Đi Vắng
            </h3>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-[#A3E4D7]/30 border border-[#A3E4D7] text-xs space-y-1">
            <p>
              <strong>Người nhận bàn giao:</strong> {handoverNote.caretakerName}
            </p>
            <p>
              <strong>Thời gian:</strong> {handoverNote.startDate} → {handoverNote.endDate}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200">
              <strong className="block text-[#FF6F61] mb-0.5">🍖 Khẩu phần & Giờ ăn:</strong>
              {handoverNote.feedingInstructions}
            </div>
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200">
              <strong className="block text-teal-800 mb-0.5">💊 Thuốc & Lưu ý sức khỏe:</strong>
              {handoverNote.medicationInstructions}
            </div>
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900">
              <strong className="block mb-0.5">🏥 Liên hệ Thú y khẩn cấp:</strong>
              {handoverNote.emergencyVetContact}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold">Checklist chuẩn bị trước khi giao Boss:</p>
            {handoverNote.checklist.map((item) => (
              <label
                key={item.id}
                onClick={() => toggleHandoverChecklistItem(item.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 cursor-pointer text-xs font-semibold"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="accent-[#FF6F61]"
                />
                <span className={item.checked ? 'line-through text-stone-400' : ''}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={() => {
              setActiveModal('kiosk_lock');
            }}
            className="w-full py-2.5 rounded-2xl bg-[#2D3436] text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" /> Bật Chế Độ Khóa Màn Hình Bàn Giao (Kiosk Mode)
          </button>
        </div>
      </div>
    );
  }

  // 6. SERVICE BOOKING MODAL (Tầng 3 Section 7)
  if (activeModal === 'book_service') {
    const totalAmount = activePartner.services
      .filter((s) => selectedServiceIds.includes(s.id))
      .reduce((sum, s) => sum + s.priceVnd, 0);

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">
                Đặt lịch — {activePartner.name}
              </h3>
              <p className="text-[11px] text-teal-800 font-semibold">
                ✓ Đối tác đã xác minh · Phản hồi trong 2 giờ
              </p>
            </div>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Chọn dịch vụ cho bé {activePet.name}:
            </label>
            <div className="space-y-1.5">
              {activePartner.services.map((srv) => {
                const checked = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      if (checked && selectedServiceIds.length > 1) {
                        setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srv.id));
                      } else if (!checked) {
                        setSelectedServiceIds([...selectedServiceIds, srv.id]);
                      }
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between ${
                      checked
                        ? 'border-[#FF6F61] bg-[#FF6F61]/8'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#2D3436]">{srv.name}</p>
                      <p className="text-[11px] text-stone-500">{srv.description}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#FF6F61] shrink-0 ml-2">
                      {formatVndCurrency(srv.priceVnd)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">📅 Chọn ngày</label>
              <input
                type="text"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">⏰ Chọn slot trống</label>
              <select
                value={bookingSlot}
                onChange={(e) => setBookingSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
              >
                {activePartner.availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} — Còn chỗ
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              📝 Ghi chú hành vi của Boss cho Đối tác
            </label>
            <input
              type="text"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
            />
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 block">Tổng tạm tính</span>
              <span className="font-mono text-base font-extrabold text-[#FF6F61]">
                {formatVndCurrency(totalAmount)}
              </span>
            </div>
            <button
              onClick={() =>
                createServiceBooking({
                  partnerId: activePartner.id,
                  petId: activePet.id,
                  serviceIds: selectedServiceIds,
                  scheduledDate: bookingDate,
                  scheduledTime: bookingSlot,
                  note: bookingNote,
                })
              }
              className="px-5 py-3 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold shadow-md"
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. WALK APPOINTMENT MIDPOINT SCHEDULER MODAL (Tầng 3 Section 6)
  if (activeModal === 'walk_scheduler') {
    const chosenPlace =
      midpointResult.suggestedPlaces[selectedPlaceIdx] ?? midpointResult.suggestedPlaces[0];

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold">
                📅 Tạo Hẹn Dắt Dạo Trung Điểm
              </h3>
              <p className="text-[11px] text-teal-800 font-semibold">
                PostGIS ST_Centroid tự tính điểm giữa 2 chủ nuôi ({midpointResult.midpoint.lat},{' '}
                {midpointResult.midpoint.lng})
              </p>
            </div>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">📅 Chọn ngày</label>
              <input
                type="text"
                value={walkDate}
                onChange={(e) => setWalkDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">⏰ Chọn giờ</label>
              <input
                type="text"
                value={walkTime}
                onChange={(e) => setWalkTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              📍 3 Địa điểm Pet-Friendly gần Trung điểm nhất:
            </label>
            <div className="space-y-2">
              {midpointResult.suggestedPlaces.map((pl, idx) => {
                const active = idx === selectedPlaceIdx;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaceIdx(idx)}
                    className={`p-3 rounded-2xl border cursor-pointer ${
                      active
                        ? 'border-[#FF6F61] bg-[#FF6F61]/8'
                        : 'border-stone-200 bg-[#FDFBF7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#2D3436]">
                        {idx + 1}. {pl.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950">
                        🐾 Pet-friendly
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      📏 {formatDistanceLabel(pl.midpointDistanceMeters)} từ trung điểm · ⭐{' '}
                      {pl.rating} ({pl.reviewCount} reviews)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">📝 Ghi chú</label>
            <input
              type="text"
              value={walkNote}
              onChange={(e) => setWalkNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
            />
          </div>

          <button
            onClick={() =>
              createWalkAppointment({
                conversationId: 'conv-1',
                partnerName: 'Miu (Corgi)',
                scheduledDate: walkDate,
                scheduledTime: walkTime,
                locationName: chosenPlace.name,
                locationAddress: chosenPlace.address,
                distanceFromMidpointMeters: chosenPlace.midpointDistanceMeters,
                note: walkNote,
              })
            }
            className="w-full py-3 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold shadow-md"
          >
            Gửi lời hẹn dắt dạo
          </button>
        </div>
      </div>
    );
  }

  // 8. SEN VIP SUBSCRIPTION MODAL WITH VIETQR (Tầng 5 Section 2.2)
  if (activeModal === 'vip_upgrade') {
    const planDetails = {
      basic: { name: 'Gói Cơ bản', price: 29000, desc: 'Mở rộng Circle + Kho ảnh' },
      sen_vip: {
        name: 'Gói Sen VIP (Phổ biến nhất)',
        price: 49000,
        desc: 'Không giới hạn Boss, Circle, Radar x3, Xuất PDF Sổ tiêm, Vương miện vàng 👑',
      },
      sen_vip_yearly: {
        name: 'Gói Sen VIP Năm (-32%)',
        price: 399000,
        desc: 'Trọn gói 12 tháng quyền lợi Sen VIP cao cấp nhất',
      },
    };
    const activePlan = planDetails[selectedVipPlan];
    const qrUrl = buildVietQrUrl({
      amountVnd: activePlan.price,
      description: `PAWTY VIP ${user.phone}`,
    });

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="font-display text-lg font-bold">Nâng cấp Gói Sen VIP 👑</h3>
            </div>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="space-y-2">
            {(Object.keys(planDetails) as Array<keyof typeof planDetails>).map((key) => {
              const p = planDetails[key];
              const selected = selectedVipPlan === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedVipPlan(key)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between ${
                    selected
                      ? 'border-amber-500 bg-amber-50/70'
                      : 'border-stone-200 bg-[#FDFBF7]'
                  }`}
                >
                  <div className="pr-2">
                    <p className="text-xs font-extrabold text-[#2D3436]">{p.name}</p>
                    <p className="text-[11px] text-stone-500">{p.desc}</p>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#FF6F61] shrink-0">
                    {formatVndCurrency(p.price)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <p className="text-xs font-bold text-[#2D3436]">
              Quét mã VietQR động để kích hoạt tức thì ({formatVndCurrency(activePlan.price)})
            </p>
            <img
              src={qrUrl}
              alt="VietQR Payment"
              className="w-44 h-44 mx-auto rounded-2xl border border-stone-200 object-contain bg-white p-1"
            />
          </div>

          <button
            onClick={() => upgradeToVipPlan(selectedVipPlan)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-[#FF6F61] text-white text-xs font-extrabold shadow-md"
          >
            Xác nhận đã chuyển khoản VietQR → Mở khóa VIP ngay
          </button>
        </div>
      </div>
    );
  }

  // 9. SOS LOST PET BROADCAST MODAL (39,000đ VietQR - 3km Radius) (Tầng 5 Section 4)
  if (activeModal === 'sos_alert') {
    const sosQrUrl = buildVietQrUrl({
      amountVnd: 39000,
      description: `PAWTY SOS ${activePet.name}`,
    });

    return (
      <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[92vh] overflow-y-auto border-2 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-display text-base font-bold">
                🚨 Phát Báo Động SOS Tìm Boss Lạc (3km)
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <p className="text-xs text-stone-600">
            Bắn Push Notification khẩn cấp tới toàn bộ chủ nuôi trong bán kính <strong>3km</strong>{' '}
            và ghim Banner SOS trên đầu Bảng tin 24 giờ.
          </p>

          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Vị trí nhìn thấy {activePet.name} lần cuối *
              </label>
              <input
                type="text"
                value={sosLocation}
                onChange={(e) => setSosLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Đặc điểm nhận dạng / Vòng cổ
              </label>
              <input
                type="text"
                value={sosDesc}
                onChange={(e) => setSosDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Mức hậu tạ</label>
              <input
                type="text"
                value={sosReward}
                onChange={(e) => setSosReward(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-red-600"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1.5">
            <p className="text-xs font-bold text-red-900">
              Phí kích hoạt hệ thống Push 3km: <strong>39.000đ</strong> (VietQR động)
            </p>
            <img
              src={sosQrUrl}
              alt="VietQR SOS"
              className="w-36 h-36 mx-auto rounded-xl bg-white p-1 border border-red-200 object-contain"
            />
          </div>

          <button
            onClick={() =>
              activateSosAlert({
                petId: activePet.id,
                lastSeenLocation: sosLocation,
                description: sosDesc,
                rewardText: sosReward,
              })
            }
            className="w-full py-3 rounded-2xl bg-red-600 text-white text-xs font-extrabold shadow-md"
          >
            🚨 Xác nhận thanh toán 39k & Phát tín hiệu SOS ngay
          </button>
        </div>
      </div>
    );
  }

  // 10. DATA PRIVACY & CONSENT CENTER (Luật BVDLCN 91/2025/QH15 - Tầng 4 Section 5)
  if (activeModal === 'privacy_center') {
    const handleExportJson = () => {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        complianceLaw: 'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15',
        user,
        pets,
        circleMembers,
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pawty-data-export-${user.username}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Đã xuất dữ liệu cá nhân (JSON) 📦', 'Tập tin đã được tải về thiết bị của bạn.');
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <h3 className="font-display text-base font-bold">
                Quyền Riêng Tư & Dữ Liệu (Luật 91/2025/QH15)
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200">
              <span>📍 Chỉ hiển thị vị trí gần đúng (Tên chung cư, ẩn số căn hộ)</span>
              <input
                type="checkbox"
                checked={user.privacy.showLocation}
                onChange={(e) => updatePrivacySettings({ showLocation: e.target.checked })}
                className="accent-teal-600"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200">
              <span>📞 Ẩn số điện thoại cá nhân với người lạ</span>
              <input
                type="checkbox"
                checked={!user.privacy.showPhone}
                onChange={(e) => updatePrivacySettings({ showPhone: !e.target.checked })}
                className="accent-teal-600"
              />
            </label>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 rounded-2xl bg-[#A3E4D7]/45 text-teal-950 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Xuất toàn bộ dữ liệu cá nhân (JSON/CSV)
            </button>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast(
                  'Đã ghi nhận yêu cầu xóa tài khoản',
                  'Tài khoản chuyển sang trạng thái chờ xóa mềm 30 ngày theo quy định.',
                  'warning'
                );
              }}
              className="w-full py-2.5 rounded-2xl bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Yêu cầu xóa tài khoản & dữ liệu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 11. PUBLIC PET PROFILE VIEWER MODAL
  if (activeModal === 'public_pet_profile' && selectedPublicPet) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">
              Hồ sơ Boss: {selectedPublicPet.name}
            </h3>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={selectedPublicPet.avatarUrl}
              alt={selectedPublicPet.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-extrabold">{selectedPublicPet.breed}</p>
              <p className="text-xs text-stone-500">
                {selectedPublicPet.ageDisplay} · {selectedPublicPet.weightKg}kg
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-[10px] font-bold">
                🟢 Đã tiêm phòng đầy đủ
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {selectedPublicPet.behaviors.map((b) => (
              <span
                key={b.id}
                className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold"
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 12. KIOSK LOCK OVERLAY (Phase 1 Native App Lock Simulation)
  if (activeModal === 'kiosk_lock') {
    return (
      <div className="fixed inset-0 bg-[#2D3436] text-white z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm bg-stone-800 rounded-3xl p-6 space-y-4 border border-stone-700 shadow-2xl">
          <Lock className="w-10 h-10 text-[#A3E4D7] mx-auto" />
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#A3E4D7]/20 text-[#A3E4D7]">
            🔒 CHẾ ĐỘ KHÓA BÀN GIAO (KIOSK LOCK)
          </span>
          <h3 className="font-display text-xl font-bold">
            Chỉ hiển thị Hồ sơ Chăm sóc & Cấp cứu của {activePet.name}
          </h3>
          <div className="p-3.5 rounded-2xl bg-stone-900/90 text-left text-xs space-y-1.5">
            <p>
              <strong>🍖 Cho ăn:</strong> {handoverNote.feedingInstructions}
            </p>
            <p>
              <strong>💊 Thuốc:</strong> {handoverNote.medicationInstructions}
            </p>
            <p className="text-[#FF6F61] font-bold">
              🏥 Cấp cứu thú y: {handoverNote.emergencyVetContact}
            </p>
          </div>
          <input
            type="password"
            value={kioskPin}
            onChange={(e) => setKioskPin(e.target.value)}
            placeholder="Nhập mã PIN chủ nuôi (Mặc định: bất kỳ) để mở khóa"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-center text-white"
          />
          <button
            onClick={() => {
              setKioskPin('');
              setActiveModal(null);
            }}
            className="w-full py-3 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold"
          >
            Mở khóa ứng dụng
          </button>
        </div>
      </div>
    );
  }

  // Fallback for add_pet_wizard
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 text-center">
        <Sparkles className="w-8 h-8 text-[#FF6F61] mx-auto" />
        <h3 className="font-display text-base font-bold">Thêm Boss mới vào Hộ gia đình</h3>
        <p className="text-xs text-stone-600">
          Bạn hiện có {pets.length} Boss ({pets.map((p) => p.name).join(', ')}). Gói Free hỗ trợ tối
          đa 2 Boss.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveModal(null)}
            className="flex-1 py-2.5 rounded-xl bg-stone-100 text-xs font-bold"
          >
            Đóng
          </button>
          <button
            onClick={() => setActiveModal('vip_upgrade')}
            className="flex-1 py-2.5 rounded-xl bg-[#FF6F61] text-white text-xs font-bold"
          >
            Mở khóa không giới hạn 👑
          </button>
        </div>
      </div>
    </div>
  );
};

