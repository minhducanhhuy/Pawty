import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Camera,
  Cat,
  Check,
  ClipboardList,
  Crown,
  Dog,
  Edit3,
  FileText,
  Hash,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Palette,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import type { CareTaskCategory, PostContentType, PostVisibility } from '@pawty/types';
import {
  buildVietQrUrl,
  formatVndCurrency,
  suggestMidpointWalkPlaces,
} from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';
import {
  SAMPLE_POST_PHOTOS,
  SUGGESTED_HASHTAGS,
  WEB_THEMES,
  type WebThemeId,
} from '../../mocks/seedData';

export const GlobalModals: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    sosAlerts,
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
    themeId,
    setThemeId,
    notifications,
    respondToCareInvite,
    markAllNotificationsRead,
    searchableUsers,
    sendCareInviteByTag,
    updateOwnerAndPetProfile,
    addNewPetObject,
    logoutSession,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;
  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];

  // Post Composer State
  const [postType, setPostType] = useState<PostContentType>('moment');
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(SAMPLE_POST_PHOTOS[0].url);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([
    '#DiDaoChieu',
    '#ChamSocCho',
  ]);
  const [customHashtagInput, setCustomHashtagInput] = useState('');
  const [postVisibility, setPostVisibility] = useState<PostVisibility>('public');

  // Create Care Task State
  const [taskTitle, setTaskTitle] = useState('Cho ăn tối & uống vitamin');
  const [taskDesc, setTaskDesc] = useState('Rửa sạch bát trước khi đổ hạt.');
  const [taskCategory, setTaskCategory] = useState<CareTaskCategory>('feeding');
  const [taskAssignee, setTaskAssignee] = useState(circleMembers[0]?.userId || user.id);
  const [taskTime, setTaskTime] = useState('18:30');

  // Co-Care @tag Search & Invite State
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedInviteTag, setSelectedInviteTag] = useState('@minhpham');
  const [selectedInvitePetId, setSelectedInvitePetId] = useState(activePet.id);

  // Edit Profile State
  const [editOwnerName, setEditOwnerName] = useState(user.displayName);
  const [editOwnerBio, setEditOwnerBio] = useState(user.bio);
  const [editNeighborhood, setEditNeighborhood] = useState(user.neighborhood);
  const [editPetName, setEditPetName] = useState(activePet.name);
  const [editSpecies, setEditSpecies] = useState<'dog' | 'cat'>(
    activePet.species === 'cat' ? 'cat' : 'dog'
  );
  const [editBreed, setEditBreed] = useState(activePet.breed);
  const [editWeightKg, setEditWeightKg] = useState(activePet.weightKg);
  const [editAgeDisplay, setEditAgeDisplay] = useState(activePet.ageDisplay);

  // Add New Pet Object State
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat'>('dog');
  const [newPetBreed, setNewPetBreed] = useState('Corgi');
  const [newPetWeight, setNewPetWeight] = useState(10);
  const [newPetAge, setNewPetAge] = useState('1 tuổi');

  // Service Booking State
  const activePartner =
    partners.find((p) => p.id === selectedPartnerIdForBooking) ?? partners[0];
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    activePartner.services[0]?.id || 'srv-1',
  ]);
  const [bookingDate, setBookingDate] = useState('Thứ 7, 08/11/2026');
  const [bookingSlot, setBookingSlot] = useState('10:00');
  const [bookingNote, setBookingNote] = useState('Nhờ nhân viên sấy nhẹ nhàng cho bé.');

  // Walk Scheduler State
  const partnerGeo = { lat: 10.8435, lng: 106.8271 };
  const midpointResult = suggestMidpointWalkPlaces(user.location, partnerGeo, places, 3);
  const [walkDate, setWalkDate] = useState('Chủ nhật, 09/11/2026');
  const [walkTime, setWalkTime] = useState('07:00');
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(0);
  const [walkNote, setWalkNote] = useState('Mình mang bình nước cho 2 bé nha.');

  // VIP & SOS State
  const [selectedVipPlan, setSelectedVipPlan] = useState<'basic' | 'sen_vip' | 'sen_vip_yearly'>(
    'sen_vip'
  );
  const [sosLocation, setSosLocation] = useState('Công viên Ánh Sáng Vinhomes Q9');
  const [sosDesc, setSosDesc] = useState(
    'Bé đeo vòng cổ màu xanh, rất thân thiện khi gọi tên.'
  );
  const [sosReward, setSosReward] = useState('Hậu tạ 1.000.000đ cho người tìm thấy');

  const handleToggleHashtag = (tag: string) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter((t) => t !== tag));
    } else {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPostImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Match Celebration Modal
  if (latestMatchCelebration) {
    return (
      <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.primary }}
          className="w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-xl border-2"
        >
          <span
            style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
            className="text-xs font-bold px-3 py-1 rounded-full inline-block"
          >
            Kết nối bạn đi dạo thành công
          </span>
          <h3 style={{ color: theme.text }} className="text-lg font-bold">
            {activePet.name} & {latestMatchCelebration.partnerPetName}
          </h3>
          <p style={{ color: theme.textSoft }} className="text-xs">
            {latestMatchCelebration.matchReason}
          </p>

          <div className="flex items-center justify-center gap-4 py-2">
            <img
              src={activePet.avatarUrl}
              alt={activePet.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <img
              src={latestMatchCelebration.partnerPetAvatar}
              alt={latestMatchCelebration.partnerPetName}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                dismissMatchCelebration();
                setActiveTab('chat');
                setActiveConversationId('conv-1');
              }}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold"
            >
              Nhắn tin & Hẹn đi dạo
            </button>
            <button
              onClick={dismissMatchCelebration}
              style={{ color: theme.textSoft }}
              className="w-full py-2 text-xs font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeModal) return null;

  // 1. CREATE BOTTOM SHEET
  if (activeModal === 'create_sheet') {
    const actions = [
      {
        id: 'new_moment',
        icon: <Camera className="w-4 h-4" />,
        title: 'Đăng bài viết & Ảnh thú cưng',
        desc: 'Chọn phân loại bài, đính kèm ảnh và gợi ý hashtag',
      },
      {
        id: 'new_task',
        icon: <ClipboardList className="w-4 h-4" />,
        title: 'Thêm việc chăm sóc hôm nay',
        desc: 'Tạo lịch cho ăn, uống thuốc hoặc dắt đi dạo',
      },
      {
        id: 'invite_circle',
        icon: <UserPlus className="w-4 h-4" />,
        title: 'Mời người chăm cùng qua @tag',
        desc: 'Tìm tài khoản bạn bè hoặc người nhà để cùng quản lý thú cưng',
      },
      {
        id: 'book_service',
        icon: <Stethoscope className="w-4 h-4" />,
        title: 'Đặt lịch dịch vụ & Thú y',
        desc: 'Tắm cắt tỉa, khám định kỳ từ cơ sở uy tín',
      },
    ];

    return (
      <div className="fixed inset-0 bg-black/55 z-50 flex items-end justify-center p-0 sm:p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Tạo mới</h3>
            <button
              onClick={() => setActiveModal(null)}
              style={{ backgroundColor: theme.bg, color: theme.textSoft }}
              className="p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {actions.map((act) => (
              <button
                key={act.id}
                onClick={() => setActiveModal(act.id as typeof activeModal)}
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                className="w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
              >
                <div
                  style={{
                    backgroundColor: theme.primarySoft,
                    color: theme.primary,
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                >
                  {act.icon}
                </div>
                <div>
                  <p style={{ color: theme.text }} className="text-xs font-bold">
                    {act.title}
                  </p>
                  <p style={{ color: theme.textSoft }} className="text-[11px] mt-0.5">
                    {act.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. POST COMPOSER MODAL (WITH CATEGORY + IMAGE UPLOAD/PICKER + HASHTAG SUGGESTIONS)
  if (activeModal === 'new_moment' || activeModal === 'new_question') {
    const categories: { id: PostContentType; label: string }[] = [
      { id: 'moment', label: 'Nhật ký' },
      { id: 'tip', label: 'Mẹo chăm' },
      { id: 'question', label: 'Hỏi đáp' },
      { id: 'service_review', label: 'Đánh giá' },
    ];

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div
            style={{ borderColor: theme.border }}
            className="flex items-center justify-between border-b pb-3"
          >
            <button
              onClick={() => setActiveModal(null)}
              style={{ color: theme.textSoft }}
              className="text-xs font-bold"
            >
              Hủy
            </button>
            <h3 className="text-sm font-bold">Đăng bài viết mới</h3>
            <button
              onClick={() => {
                const extraTags = customHashtagInput
                  .split(/\s+/)
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (t.startsWith('#') ? t : `#${t}`));
                const allTags = Array.from(new Set([...selectedHashtags, ...extraTags]));
                createSocialPost({
                  contentType: postType,
                  textContent: postText || `Cập nhật hình ảnh mới của ${activePet.name}.`,
                  imageUrl: postImage || undefined,
                  hashtags: allTags,
                  visibility: postVisibility,
                });
                setPostText('');
              }}
              style={{ backgroundColor: theme.primary }}
              className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold"
            >
              Đăng bài
            </button>
          </div>

          {/* Step 1: Post Category Selection */}
          <div>
            <label
              style={{ color: theme.textSoft }}
              className="block text-xs font-semibold mb-1.5"
            >
              1. Chọn phân loại bài viết
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map((cat) => {
                const active = postType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPostType(cat.id)}
                    style={{
                      backgroundColor: active ? theme.primary : theme.bg,
                      borderColor: active ? theme.primary : theme.border,
                      color: active ? '#FFFFFF' : theme.text,
                    }}
                    className="py-2 px-2 rounded-xl border text-xs font-bold text-center transition-colors"
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Content Input */}
          <div>
            <label
              style={{ color: theme.textSoft }}
              className="block text-xs font-semibold mb-1.5"
            >
              2. Nội dung chia sẻ (Hồ sơ: {activePet.name})
            </label>
            <textarea
              rows={3}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={`Chia sẻ câu chuyện hoặc câu hỏi về ${activePet.name}...`}
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              className="w-full p-3 rounded-xl border text-xs focus:outline-none"
            />
          </div>

          {/* Step 3: Photo Attachment (Device File Picker + Sample Photos) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                style={{ color: theme.textSoft }}
                className="block text-xs font-semibold"
              >
                3. Hình ảnh đính kèm
              </label>
              <label
                style={{
                  backgroundColor: theme.primarySoft,
                  color: theme.primary,
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Tải ảnh từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDevicePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {postImage && (
              <div className="relative rounded-xl overflow-hidden h-40 bg-stone-100">
                <img
                  src={postImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPostImage('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-1.5">
              {SAMPLE_POST_PHOTOS.map((item) => {
                const selected = postImage === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPostImage(item.url)}
                    style={{
                      borderColor: selected ? theme.primary : theme.border,
                    }}
                    className="rounded-lg overflow-hidden border-2 h-14 relative"
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: 1-Tap Suggested Hashtags */}
          <div className="space-y-2">
            <label
              style={{ color: theme.textSoft }}
              className="block text-xs font-semibold flex items-center gap-1"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>4. Gợi ý hashtag (Bấm để chọn nhanh)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_HASHTAGS.map((tag) => {
                const active = selectedHashtags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleHashtag(tag)}
                    style={{
                      backgroundColor: active ? theme.primary : theme.bg,
                      borderColor: active ? theme.primary : theme.border,
                      color: active ? '#FFFFFF' : theme.textSoft,
                    }}
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customHashtagInput}
              onChange={(e) => setCustomHashtagInput(e.target.value)}
              placeholder="Thêm hashtag khác (cách nhau bằng khoảng trắng)..."
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
            />
          </div>

          {/* Step 5: Visibility */}
          <div className="flex items-center justify-between pt-1">
            <span style={{ color: theme.textSoft }} className="text-xs font-semibold">
              Quyền xem bài viết:
            </span>
            <select
              value={postVisibility}
              onChange={(e) => setPostVisibility(e.target.value as PostVisibility)}
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold"
            >
              <option value="public">Công khai</option>
              <option value="circle_only">Chỉ nhóm cùng chăm</option>
              <option value="private">Chỉ mình tôi</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // 3. INVITE CO-CARE BY @TAG SEARCH MODAL (NO RELATIONSHIP FIELD)
  if (activeModal === 'invite_circle') {
    const filteredUsers = searchableUsers.filter((u) => {
      if (!tagSearchQuery.trim()) return true;
      const q = tagSearchQuery.toLowerCase();
      return (
        u.tag.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.area.toLowerCase().includes(q)
      );
    });

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Mời người chăm cùng</h3>
              <p style={{ color: theme.textSoft }} className="text-xs">
                Tìm theo @tag tài khoản. Khi người nhận bấm Chấp nhận trong thông báo, hồ sơ thú cưng sẽ hiển thị bên máy họ.
              </p>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Select Pet to Share */}
          <div>
            <label
              style={{ color: theme.textSoft }}
              className="block text-xs font-semibold mb-1.5"
            >
              Chọn hồ sơ thú cưng mời chăm cùng
            </label>
            <div className="grid grid-cols-2 gap-2">
              {pets.map((p) => {
                const selected = p.id === selectedInvitePetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedInvitePetId(p.id)}
                    style={{
                      backgroundColor: selected ? theme.primarySoft : theme.bg,
                      borderColor: selected ? theme.primary : theme.border,
                    }}
                    className="p-2.5 rounded-xl border flex items-center gap-2 text-left"
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p style={{ color: theme.text }} className="text-xs font-bold">
                        {p.name}
                      </p>
                      <p style={{ color: theme.textSoft }} className="text-[10px]">
                        Loài: {p.species === 'dog' ? 'Chó' : 'Mèo'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search by @tag */}
          <div>
            <label
              style={{ color: theme.textSoft }}
              className="block text-xs font-semibold mb-1.5"
            >
              Tìm kiếm tài khoản theo @tag hoặc tên
            </label>
            <div
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              className="flex items-center px-3 py-2.5 rounded-xl border"
            >
              <Search style={{ color: theme.textSoft }} className="w-4 h-4 mr-2" />
              <input
                type="text"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Nhập @hungle, @lantran, @minhpham..."
                style={{ color: theme.text }}
                className="w-full bg-transparent text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* User Directory List */}
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {filteredUsers.map((u) => {
              const isSelected = selectedInviteTag === u.tag;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedInviteTag(u.tag)}
                  style={{
                    backgroundColor: isSelected ? theme.primarySoft : theme.bg,
                    borderColor: isSelected ? theme.primary : theme.border,
                  }}
                  className="w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p style={{ color: theme.text }} className="text-xs font-bold truncate">
                        {u.displayName}{' '}
                        <span style={{ color: theme.primary }}>{u.tag}</span>
                      </p>
                      <p style={{ color: theme.textSoft }} className="text-[11px] truncate">
                        {u.petsSummary} · {u.area}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check style={{ color: theme.primary }} className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => sendCareInviteByTag(selectedInviteTag, selectedInvitePetId)}
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi lời mời tới {selectedInviteTag}</span>
          </button>

          {/* Current Co-Care Members */}
          <div style={{ borderColor: theme.border }} className="pt-3 border-t space-y-2">
            <p style={{ color: theme.textSoft }} className="text-xs font-semibold">
              Danh sách đang chăm cùng ({circleMembers.length})
            </p>
            {circleMembers.map((m) => (
              <div
                key={m.id}
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
              >
                <div>
                  <p style={{ color: theme.text }} className="font-bold">
                    {m.displayName}
                  </p>
                  <p style={{ color: theme.textSoft }} className="text-[11px]">
                    {m.status === 'pending' ? 'Đang chờ xác nhận' : 'Đang chăm cùng'}
                  </p>
                </div>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => revokeCircleMember(m.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. NOTIFICATIONS CENTER MODAL (ACCEPT CO-CARE INVITES)
  if (activeModal === 'notifications') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell style={{ color: theme.primary }} className="w-4 h-4" />
              <h3 className="text-base font-bold">Thông báo</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                style={{ color: theme.primary }}
                className="text-xs font-bold"
              >
                Đánh dấu đã đọc
              </button>
              <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  backgroundColor: notif.isRead ? theme.bg : theme.primarySoft,
                  borderColor: notif.isRead ? theme.border : theme.primary,
                }}
                className="p-3.5 rounded-2xl border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p style={{ color: theme.text }} className="text-xs font-bold">
                    {notif.title}
                  </p>
                  <span style={{ color: theme.textSoft }} className="text-[10px]">
                    {notif.createdAt}
                  </span>
                </div>
                <p style={{ color: theme.textSoft }} className="text-xs">
                  {notif.body}
                </p>

                {notif.invitePayload && (
                  <div className="pt-1">
                    {notif.invitePayload.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => respondToCareInvite(notif.id, true)}
                          style={{ backgroundColor: theme.primary }}
                          className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold"
                        >
                          Chấp nhận chăm cùng
                        </button>
                        <button
                          onClick={() => respondToCareInvite(notif.id, false)}
                          style={{
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                            color: theme.textSoft,
                          }}
                          className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{ color: theme.primary }}
                        className="text-[11px] font-bold"
                      >
                        {notif.invitePayload.status === 'accepted'
                          ? `Đã chấp nhận — Bé ${notif.invitePayload.petName} đã có trong danh sách thú cưng của bạn.`
                          : 'Đã từ chối lời mời.'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. EDIT PROFILE MODAL (OWNER & UNIFIED PET OBJECT)
  if (activeModal === 'edit_profile') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 style={{ color: theme.primary }} className="w-4 h-4" />
              <h3 className="text-base font-bold">Chỉnh sửa hồ sơ</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <p
              style={{ color: theme.textSoft }}
              className="text-[11px] font-bold uppercase tracking-wider"
            >
              Thông tin chủ nuôi
            </p>
            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={editOwnerName}
                onChange={(e) => setEditOwnerName(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              />
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Khu vực sinh sống
              </label>
              <input
                type="text"
                value={editNeighborhood}
                onChange={(e) => setEditNeighborhood(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              />
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Giới thiệu ngắn
              </label>
              <textarea
                rows={2}
                value={editOwnerBio}
                onChange={(e) => setEditOwnerBio(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <div style={{ borderColor: theme.border }} className="pt-3 border-t space-y-2.5">
              <p
                style={{ color: theme.textSoft }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Đối tượng hồ sơ thú cưng đang chọn ({activePet.name})
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditSpecies('dog')}
                  style={{
                    backgroundColor: editSpecies === 'dog' ? theme.primary : theme.bg,
                    borderColor: editSpecies === 'dog' ? theme.primary : theme.border,
                    color: editSpecies === 'dog' ? '#FFFFFF' : theme.text,
                  }}
                  className="py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Dog className="w-3.5 h-3.5" />
                  <span>Loài: Chó</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditSpecies('cat')}
                  style={{
                    backgroundColor: editSpecies === 'cat' ? theme.primary : theme.bg,
                    borderColor: editSpecies === 'cat' ? theme.primary : theme.border,
                    color: editSpecies === 'cat' ? '#FFFFFF' : theme.text,
                  }}
                  className="py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Cat className="w-3.5 h-3.5" />
                  <span>Loài: Mèo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                    Tên thú cưng
                  </label>
                  <input
                    type="text"
                    value={editPetName}
                    onChange={(e) => setEditPetName(e.target.value)}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>
                <div>
                  <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                    Giống loài
                  </label>
                  <input
                    type="text"
                    value={editBreed}
                    onChange={(e) => setEditBreed(e.target.value)}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editWeightKg}
                    onChange={(e) => setEditWeightKg(Number(e.target.value))}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>
                <div>
                  <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                    Độ tuổi
                  </label>
                  <input
                    type="text"
                    value={editAgeDisplay}
                    onChange={(e) => setEditAgeDisplay(e.target.value)}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              updateOwnerAndPetProfile({
                ownerName: editOwnerName,
                ownerBio: editOwnerBio,
                neighborhood: editNeighborhood,
                petId: activePet.id,
                petName: editPetName,
                species: editSpecies,
                breed: editBreed,
                weightKg: editWeightKg,
                ageDisplay: editAgeDisplay,
              })
            }
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    );
  }

  // 6. SETTINGS & 4 THEME PERSONALIZATION MODAL
  if (activeModal === 'settings' || activeModal === 'privacy_center') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette style={{ color: theme.primary }} className="w-4 h-4" />
              <h3 className="text-base font-bold">Cài đặt & Giao diện cá nhân hóa</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Warm Minimalist Themes */}
          <div className="space-y-2">
            <p style={{ color: theme.textSoft }} className="text-xs font-semibold">
              Chọn tông màu ứng dụng yêu thích
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(WEB_THEMES) as WebThemeId[]).map((id) => {
                const t = WEB_THEMES[id];
                const active = themeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => setThemeId(id)}
                    style={{
                      backgroundColor: active ? t.primarySoft : theme.bg,
                      borderColor: active ? t.primary : theme.border,
                    }}
                    className="p-3 rounded-2xl border text-left space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{ backgroundColor: t.primary }}
                        className="w-4 h-4 rounded-full"
                      />
                      {active && <Check style={{ color: t.primary }} className="w-4 h-4" />}
                    </div>
                    <p style={{ color: theme.text }} className="text-xs font-bold">
                      {t.name}
                    </p>
                    <p style={{ color: theme.textSoft }} className="text-[10px]">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Toggles */}
          <div style={{ borderColor: theme.border }} className="pt-3 border-t space-y-2">
            <p style={{ color: theme.textSoft }} className="text-xs font-semibold">
              Quyền riêng tư
            </p>
            <label
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              className="p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer"
            >
              <span>Chỉ hiển thị khu vực gần đúng (Ẩn số nhà)</span>
              <input
                type="checkbox"
                checked={user.privacy.showLocation}
                onChange={(e) =>
                  updatePrivacySettings({ showLocation: e.target.checked })
                }
              />
            </label>
          </div>

          {/* Quick Account Actions */}
          <div style={{ borderColor: theme.border }} className="pt-3 border-t space-y-2">
            <button
              onClick={() => setActiveModal('vip_upgrade')}
              style={{
                backgroundColor: theme.primarySoft,
                color: theme.primary,
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Crown className="w-4 h-4" />
              <span>{user.isVip ? 'Đang dùng gói VIP' : 'Nâng cấp tài khoản VIP (49k/tháng)'}</span>
            </button>

            <button
              onClick={logoutSession}
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: '#C94A4A',
              }}
              className="w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất khỏi màn hình chính</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. ADD NEW PET OBJECT MODAL
  if (activeModal === 'add_pet_wizard') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Thêm đối tượng hồ sơ thú cưng</h3>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1.5">
                Phân loại loài thú
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewPetSpecies('dog');
                    setNewPetBreed('Corgi');
                  }}
                  style={{
                    backgroundColor: newPetSpecies === 'dog' ? theme.primary : theme.bg,
                    borderColor: newPetSpecies === 'dog' ? theme.primary : theme.border,
                    color: newPetSpecies === 'dog' ? '#FFFFFF' : theme.text,
                  }}
                  className="py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Dog className="w-4 h-4" />
                  <span>Loài: Chó</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPetSpecies('cat');
                    setNewPetBreed('Mèo Anh Lông Ngắn');
                  }}
                  style={{
                    backgroundColor: newPetSpecies === 'cat' ? theme.primary : theme.bg,
                    borderColor: newPetSpecies === 'cat' ? theme.primary : theme.border,
                    color: newPetSpecies === 'cat' ? '#FFFFFF' : theme.text,
                  }}
                  className="py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Cat className="w-4 h-4" />
                  <span>Loài: Mèo</span>
                </button>
              </div>
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Tên thú cưng
              </label>
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder="VD: Mỡ, Đậu, Bơ..."
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newPetWeight}
                  onChange={(e) => setNewPetWeight(Number(e.target.value))}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                />
              </div>
              <div className="col-span-2">
                <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                  Giống
                </label>
                <input
                  type="text"
                  value={newPetBreed}
                  onChange={(e) => setNewPetBreed(e.target.value)}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              addNewPetObject({
                name: newPetName || 'Bé mới',
                species: newPetSpecies,
                breed: newPetBreed,
                weightKg: newPetWeight,
                ageDisplay: newPetAge,
              });
              setNewPetName('');
            }}
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Tạo hồ sơ thú cưng
          </button>
        </div>
      </div>
    );
  }

  // 8. NEW CARE TASK MODAL
  if (activeModal === 'new_task') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Thêm việc chăm sóc</h3>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Tên việc cần làm
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                  Phân loại
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as CareTaskCategory)}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                >
                  <option value="feeding">Ăn uống</option>
                  <option value="medicine">Thuốc / Vitamin</option>
                  <option value="walk">Đi dạo</option>
                  <option value="grooming">Tắm & Chải lông</option>
                  <option value="litter">Vệ sinh khay cát</option>
                </select>
              </div>
              <div>
                <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                  Giờ thực hiện
                </label>
                <input
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Người phụ trách
              </label>
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              >
                {circleMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Ghi chú thêm
              </label>
              <input
                type="text"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs"
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
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Lưu công việc
          </button>
        </div>
      </div>
    );
  }

  // 9. HANDOVER NOTE MODAL
  if (activeModal === 'handover_note') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText style={{ color: theme.primary }} className="w-4 h-4" />
              <h3 className="text-base font-bold">Phiếu bàn giao chăm sóc</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            className="p-3.5 rounded-2xl border space-y-2 text-xs"
          >
            <p>
              <strong>Thời gian:</strong> {handoverNote.startDate} – {handoverNote.endDate}
            </p>
            <p>
              <strong>Người nhận chăm:</strong> {handoverNote.caretakerName}
            </p>
            <p>
              <strong>Khẩu phần ăn:</strong> {handoverNote.feedingInstructions}
            </p>
            <p>
              <strong>Thuốc & Lưu ý:</strong> {handoverNote.medicationInstructions}
            </p>
            <p>
              <strong>Liên hệ thú y:</strong> {handoverNote.emergencyVetContact}
            </p>
          </div>

          <div className="space-y-2">
            <p style={{ color: theme.textSoft }} className="text-xs font-semibold">
              Danh mục chuẩn bị trước khi bàn giao
            </p>
            {handoverNote.checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleHandoverChecklistItem(item.id)}
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                className="w-full p-2.5 rounded-xl border flex items-center gap-2.5 text-left text-xs"
              >
                <div
                  style={{
                    backgroundColor: item.checked ? theme.primary : 'transparent',
                    borderColor: item.checked ? theme.primary : theme.textSoft,
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                >
                  {item.checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={item.checked ? 'line-through opacity-70' : ''}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveModal(null)}
            style={{ backgroundColor: theme.primary }}
            className="w-full py-2.5 rounded-xl text-white text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // 10. BOOK SERVICE MODAL
  if (activeModal === 'book_service') {
    const toggleService = (id: string) => {
      if (selectedServiceIds.includes(id)) {
        if (selectedServiceIds.length > 1) {
          setSelectedServiceIds(selectedServiceIds.filter((s) => s !== id));
        }
      } else {
        setSelectedServiceIds([...selectedServiceIds, id]);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Đặt lịch: {activePartner.name}</h3>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {activePartner.services.map((srv) => {
              const checked = selectedServiceIds.includes(srv.id);
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => toggleService(srv.id)}
                  style={{
                    backgroundColor: checked ? theme.primarySoft : theme.bg,
                    borderColor: checked ? theme.primary : theme.border,
                  }}
                  className="w-full p-3 rounded-xl border flex items-center justify-between text-left text-xs"
                >
                  <div>
                    <p style={{ color: theme.text }} className="font-bold">
                      {srv.name}
                    </p>
                    <p style={{ color: theme.textSoft }} className="text-[11px]">
                      Thời lượng: {srv.durationMin} phút
                    </p>
                  </div>
                  <span style={{ color: theme.primary }} className="font-bold">
                    {formatVndCurrency(srv.priceVnd)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Ngày hẹn
              </label>
              <input
                type="text"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              />
            </div>
            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Khung giờ
              </label>
              <select
                value={bookingSlot}
                onChange={(e) => setBookingSlot(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              >
                {activePartner.availableSlots.map((sl) => (
                  <option key={sl} value={sl}>
                    {sl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <input
            type="text"
            value={bookingNote}
            onChange={(e) => setBookingNote(e.target.value)}
            placeholder="Ghi chú cho cửa hàng..."
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
            className="w-full px-3 py-2 rounded-xl border text-xs"
          />

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
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Xác nhận đặt lịch cho {activePet.name}
          </button>
        </div>
      </div>
    );
  }

  // 11. WALK SCHEDULER MODAL
  if (activeModal === 'walk_scheduler') {
    const chosenPlace =
      midpointResult.suggestedPlaces[selectedPlaceIdx] ??
      midpointResult.suggestedPlaces[0];

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar style={{ color: theme.primary }} className="w-4 h-4" />
              <h3 className="text-base font-bold">Hẹn đi dạo chung</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <p style={{ color: theme.textSoft }} className="text-xs font-semibold">
              Địa điểm thuận tiện ở giữa hai nhà:
            </p>
            {midpointResult.suggestedPlaces.map((pl, idx) => {
              const selected = idx === selectedPlaceIdx;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedPlaceIdx(idx)}
                  style={{
                    backgroundColor: selected ? theme.primarySoft : theme.bg,
                    borderColor: selected ? theme.primary : theme.border,
                  }}
                  className="w-full p-3 rounded-xl border flex items-center justify-between text-left text-xs"
                >
                  <div>
                    <p style={{ color: theme.text }} className="font-bold">
                      {pl.name}
                    </p>
                    <p style={{ color: theme.textSoft }} className="text-[11px]">
                      {pl.address}
                    </p>
                  </div>
                  <MapPin style={{ color: theme.primary }} className="w-4 h-4 shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={walkDate}
              onChange={(e) => setWalkDate(e.target.value)}
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              className="px-3 py-2 rounded-xl border text-xs font-semibold"
            />
            <input
              type="text"
              value={walkTime}
              onChange={(e) => setWalkTime(e.target.value)}
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              className="px-3 py-2 rounded-xl border text-xs font-semibold"
            />
          </div>

          <input
            type="text"
            value={walkNote}
            onChange={(e) => setWalkNote(e.target.value)}
            placeholder="Lời nhắn..."
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
            className="w-full px-3 py-2 rounded-xl border text-xs"
          />

          <button
            onClick={() =>
              createWalkAppointment({
                conversationId: 'conv-1',
                partnerName: 'Hòa Trần (Bé Miu)',
                scheduledDate: walkDate,
                scheduledTime: walkTime,
                locationName: chosenPlace.name,
                locationAddress: chosenPlace.address,
                distanceFromMidpointMeters: chosenPlace.midpointDistanceMeters,
                note: walkNote,
              })
            }
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Gửi lời hẹn đi dạo
          </button>
        </div>
      </div>
    );
  }

  // 12. VIP UPGRADE MODAL
  if (activeModal === 'vip_upgrade') {
    const amount =
      selectedVipPlan === 'basic'
        ? 29000
        : selectedVipPlan === 'sen_vip'
        ? 49000
        : 399000;
    const qrUrl = buildVietQrUrl({
      amountVnd: amount,
      description: `PAWTY VIP ${user.phone}`,
    });

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown style={{ color: theme.primary }} className="w-4 h-4" />
              <h3 className="text-base font-bold">Gói thành viên VIP</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'basic', name: 'Cơ bản', price: '29k/tháng' },
              { id: 'sen_vip', name: 'VIP Tháng', price: '49k/tháng' },
              { id: 'sen_vip_yearly', name: 'VIP Năm', price: '399k/năm' },
            ].map((pl) => {
              const active = selectedVipPlan === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setSelectedVipPlan(pl.id as typeof selectedVipPlan)}
                  style={{
                    backgroundColor: active ? theme.primarySoft : theme.bg,
                    borderColor: active ? theme.primary : theme.border,
                  }}
                  className="p-2.5 rounded-xl border text-center"
                >
                  <p style={{ color: theme.text }} className="text-xs font-bold">
                    {pl.name}
                  </p>
                  <p style={{ color: theme.primary }} className="text-[11px] font-bold">
                    {pl.price}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center p-3 rounded-2xl bg-white border">
            <img src={qrUrl} alt="VietQR" className="w-40 h-40 object-contain" />
          </div>

          <button
            onClick={() => upgradeToVipPlan(selectedVipPlan)}
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Xác nhận đã thanh toán ({formatVndCurrency(amount)})
          </button>
        </div>
      </div>
    );
  }

  // 13. SOS LOST PET ALERT MODAL
  if (activeModal === 'sos_alert') {
    const qrUrl = buildVietQrUrl({
      amountVnd: 39000,
      description: `PAWTY SOS ${activePet.name}`,
    });

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C94A4A]" />
              <h3 className="text-base font-bold">Trung tâm SOS & AI Radar Truy Vết</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Radar Trajectory Preview Banner */}
          {sosAlerts.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-stone-900 text-white space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6F61]">
                  🛰️ AI SPATIOTEMPORAL RADAR
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {sosAlerts[0]?.trajectoryPoints?.length || 3} Mốc Lộ Trình
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Đang truy vết: <strong className="text-white">{sosAlerts[0]?.petName}</strong> (Bán kính 3km)
              </p>
              <div className="space-y-2 pt-2 border-t border-stone-800">
                {(sosAlerts[0]?.trajectoryPoints || []).map((pt, idx) => (
                  <div key={pt.id || idx} className="flex items-start gap-2.5 text-[11px]">
                    <span className="shrink-0 mt-0.5">{idx === 0 ? '🔴' : pt.source === 'ai_feed_match' ? '🟢' : '🟡'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-200 truncate">{pt.locationName}</p>
                      <p className="text-[10px] text-stone-400 font-medium">{pt.note || pt.timestamp}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 font-medium">{pt.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Vị trí nhìn thấy lần cuối
              </label>
              <input
                type="text"
                value={sosLocation}
                onChange={(e) => setSosLocation(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
              />
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Đặc điểm nhận dạng
              </label>
              <textarea
                rows={2}
                value={sosDesc}
                onChange={(e) => setSosDesc(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <div>
              <label style={{ color: theme.textSoft }} className="block text-xs mb-1">
                Lời nhắn cảm ơn / Hậu tạ
              </label>
              <input
                type="text"
                value={sosReward}
                onChange={(e) => setSosReward(e.target.value)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>

            <div className="flex flex-col items-center p-3 rounded-2xl bg-white border">
              <img src={qrUrl} alt="VietQR SOS" className="w-36 h-36 object-contain" />
              <span className="text-[11px] text-stone-500 mt-1">
                Phí phát thông báo khẩn cấp 3km: 39.000đ
              </span>
            </div>
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
            style={{ backgroundColor: '#C94A4A' }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold"
          >
            Phát thông báo tìm {activePet.name} ngay
          </button>
        </div>
      </div>
    );
  }

  // 14. PUBLIC PET PROFILE MODAL
  if (activeModal === 'public_pet_profile' && selectedPublicPet) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div
          style={{ backgroundColor: theme.surface, color: theme.text }}
          className="w-full max-w-md rounded-3xl p-5 space-y-3.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedPublicPet.avatarUrl}
                alt={selectedPublicPet.name}
                className="w-11 h-11 rounded-2xl object-cover"
              />
              <div>
                <h3 className="text-base font-bold">{selectedPublicPet.name}</h3>
                <p style={{ color: theme.textSoft }} className="text-xs">
                  Loài: {selectedPublicPet.species === 'dog' ? 'Chó' : 'Mèo'} ·{' '}
                  {selectedPublicPet.breed}
                </p>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: theme.textSoft }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            className="p-3 rounded-xl border text-xs space-y-1"
          >
            <p className="flex items-center gap-1.5 font-bold">
              <ShieldCheck style={{ color: theme.primary }} className="w-4 h-4" />
              <span>Đã xác nhận tiêm phòng đầy đủ</span>
            </p>
            <p style={{ color: theme.textSoft }}>
              Cân nặng: {selectedPublicPet.weightKg}kg · Tuổi: {selectedPublicPet.ageDisplay}
            </p>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            style={{ backgroundColor: theme.primary }}
            className="w-full py-2.5 rounded-xl text-white text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return null;
};
