import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Compass,
  Flag,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  Radio,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import type { ReactionType } from '@pawty/types';
import { calculatePawRankScore, formatDistanceLabel, formatVndCurrency } from '@pawty/utils';
import { usePawtyStore, type ExploreSubTabId } from '../../stores/usePawtyStore';

const REACTION_PICKER: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'paw', emoji: '🐾', label: 'Paw' },
  { type: 'heart_eyes', emoji: '😍', label: 'Yêu quá' },
  { type: 'laughing', emoji: '😂', label: 'Hài quá' },
  { type: 'worried', emoji: '😟', label: 'Thương Boss' },
  { type: 'helpful', emoji: '💡', label: 'Hữu ích' },
];

export const ExploreScreen: React.FC = () => {
  const {
    user,
    pets,
    activePetId,
    exploreSubTab,
    setExploreSubTab,
    posts,
    reactToPost,
    addCommentToPost,
    toggleBookmarkPost,
    groups,
    toggleJoinGroup,
    places,
    partners,
    radarCandidates,
    swipeRadarCandidate,
    sosAlerts,
    reportSosSighting,
    markSosFound,
    setActiveModal,
    openPublicPetProfile,
    submitContentReport,
  } = usePawtyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat' | 'nearby'>('all');
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [openReactionPickerPostId, setOpenReactionPickerPostId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const [radarVaccinatedOnly, setRadarVaccinatedOnly] = useState(true);
  const [radarMaxRadiusMeters, setRadarMaxRadiusMeters] = useState(3000);
  const [sightingModalAlertId, setSightingModalAlertId] = useState<string | null>(null);
  const [sightingLocation, setSightingLocation] = useState('Công viên Ánh Sáng khu B');
  const [sightingNote, setSightingNote] = useState('');

  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];

  // PawRank sorted posts
  const rankedPosts = useMemo(() => {
    return [...posts]
      .filter((p) => {
        if (speciesFilter === 'dog') return p.speciesTags.includes('dog');
        if (speciesFilter === 'cat') return p.speciesTags.includes('cat');
        return true;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.textContent.toLowerCase().includes(q) ||
          p.petName.toLowerCase().includes(q) ||
          p.hashtags.some((h) => h.toLowerCase().includes(q))
        );
      })
      .map((post) => ({
        ...post,
        pawRankScore: calculatePawRankScore(
          post,
          activePet.species,
          activePet.breed,
          user.location
        ),
      }))
      .sort((a, b) => (b.pawRankScore ?? 0) - (a.pawRankScore ?? 0));
  }, [posts, speciesFilter, searchQuery, activePet, user.location]);

  const filteredRadar = radarCandidates.filter((c) => {
    if (radarVaccinatedOnly && c.pet.vaccinationStatus !== 'full') return false;
    if (c.distanceMeters > radarMaxRadiusMeters) return false;
    return true;
  });

  const subTabs: { id: ExploreSubTabId; label: string; icon: React.ReactNode }[] = [
    { id: 'feed', label: 'Feed', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'discover', label: 'Trending', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'groups', label: 'Nhóm', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'qa', label: 'Q&A', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'services', label: 'Dịch vụ', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'places', label: 'Địa điểm', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'radar', label: 'Radar', icon: <Radio className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="p-4 pb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm Boss, #GoldenRetriever, dịch vụ, câu hỏi..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold focus:outline-none focus:border-[#FF6F61]"
        />
      </div>

      {/* Segmented Sub-Tab Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {subTabs.map((t) => {
          const active = exploreSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setExploreSubTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                active
                  ? 'bg-[#FF6F61] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active SOS Alert Banner on Feed (24h Emergency Broadcast) */}
      {sosAlerts
        .filter((a) => a.status === 'active')
        .map((alert) => (
          <div
            key={alert.id}
            className="p-3.5 rounded-3xl bg-red-600 text-white shadow-md space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={alert.petAvatar}
                  alt={alert.petName}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white"
                />
                <div>
                  <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-red-700 uppercase">
                    🚨 SOS KHẨN CẤP · BÁN KÍNH {alert.radiusKm}KM
                  </span>
                  <h3 className="font-display text-sm font-bold mt-0.5">
                    Tìm Boss lạc: {alert.petName} ({alert.petBreed})
                  </h3>
                  <p className="text-[11px] opacity-90">📍 Khu vực: {alert.lastSeenLocation}</p>
                </div>
              </div>
              <button
                onClick={() => markSosFound(alert.id)}
                className="text-[10px] font-bold underline opacity-90"
              >
                Đã tìm thấy
              </button>
            </div>
            <p className="text-xs bg-red-700/60 p-2.5 rounded-2xl">
              {alert.description} · <strong>{alert.rewardText}</strong>
            </p>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-semibold">
                👀 {alert.sightings.length} tin báo vị trí từ cộng đồng
              </span>
              <button
                onClick={() => setSightingModalAlertId(alert.id)}
                className="px-3 py-1.5 rounded-xl bg-white text-red-700 text-xs font-extrabold shadow-xs"
              >
                Tôi thấy Boss! 📍
              </button>
            </div>
          </div>
        ))}

      {/* Modal for reporting SOS sighting */}
      {sightingModalAlertId && (
        <div className="p-4 rounded-3xl bg-white border-2 border-red-500 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-red-700">
              📍 Gửi vị trí bạn vừa nhìn thấy Boss
            </h4>
            <button onClick={() => setSightingModalAlertId(null)}>
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>
          <input
            type="text"
            value={sightingLocation}
            onChange={(e) => setSightingLocation(e.target.value)}
            placeholder="Vị trí nhìn thấy..."
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
          />
          <input
            type="text"
            value={sightingNote}
            onChange={(e) => setSightingNote(e.target.value)}
            placeholder="Mô tả hướng chạy / tình trạng của bé..."
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
          />
          <button
            onClick={() => {
              reportSosSighting(
                sightingModalAlertId,
                user.displayName,
                sightingLocation,
                sightingNote || 'Bé đang ở gần bãi cỏ, nhìn khỏe mạnh.'
              );
              setSightingModalAlertId(null);
              setSightingNote('');
            }}
            className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            Báo ngay cho chủ nuôi
          </button>
        </div>
      )}

      {/* VIEW 1: PET SOCIAL FEED */}
      {exploreSubTab === 'feed' && (
        <div className="space-y-4">
          {/* Species & Purpose Filter Chips */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'dog', label: '🐕 Chó' },
                { id: 'cat', label: '🐈 Mèo' },
                { id: 'nearby', label: '📍 Gần bạn' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSpeciesFilter(f.id as typeof speciesFilter)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    speciesFilter === f.id
                      ? 'bg-[#2D3436] text-white'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-[#A3E4D7]/40 px-2.5 py-1 rounded-full">
              PawRank AI
            </span>
          </div>

          {rankedPosts.map((post) => {
            const currentReaction = REACTION_PICKER.find((r) => r.type === post.userReaction);
            const sortedComments = [...post.comments].sort((a, b) =>
              a.isExpert === b.isExpert ? 0 : a.isExpert ? -1 : 1
            );

            return (
              <article
                key={post.id}
                className={`rounded-3xl p-4 border shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-3 ${
                  post.isSponsored
                    ? 'bg-gradient-to-br from-white via-[#FDFBF7] to-[#FF6F61]/8 border-[#FF6F61]/30'
                    : 'bg-white border-stone-200/80'
                }`}
              >
                {/* Sponsored or Expert Header Banner */}
                {post.isSponsored && (
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#FF6F61] pb-1 border-b border-stone-100">
                    <span>🎯 TÀI TRỢ · ĐỐI TÁC XÁC MINH</span>
                    {post.sponsorDiscountBadge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6F61] text-white text-[10px]">
                        🎁 {post.sponsorDiscountBadge}
                      </span>
                    )}
                  </div>
                )}

                {/* Author & Pet Info */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => {
                      const targetPet = pets.find((p) => p.id === post.petIds[0]);
                      if (targetPet) openPublicPetProfile(targetPet);
                    }}
                    className="flex items-center gap-2.5 cursor-pointer"
                  >
                    <img
                      src={post.petAvatar || post.authorAvatar}
                      alt={post.petName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#A3E4D7]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-[#2D3436]">
                          {post.petName}
                        </span>
                        <span className="text-[11px] text-stone-500">· @{post.authorUsername}</span>
                        {post.expertVerified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> Chuyên gia
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400">
                        📍 {post.location.name} · Điểm PawRank: {post.pawRankScore}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      submitContentReport(
                        'post',
                        post.id,
                        post.textContent.slice(0, 60),
                        'inappropriate',
                        'Người dùng báo cáo kiểm duyệt nội dung.'
                      )
                    }
                    title="Báo cáo bài viết"
                    className="p-1.5 text-stone-400 hover:text-stone-600"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Post Media */}
                {post.media.length > 0 && (
                  <div className="rounded-2xl overflow-hidden bg-stone-100 max-h-72">
                    <img
                      src={post.media[0].url}
                      alt={post.petName}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Post Body Text */}
                <p className="text-xs text-[#2D3436] whitespace-pre-line leading-relaxed">
                  {post.textContent}
                </p>

                {/* Auto Health Disclaimer Protocol (Tầng 2 Section 6.3) */}
                {post.hasHealthDisclaimer && (
                  <div className="p-2.5 rounded-2xl bg-[#A3E4D7]/25 border border-[#A3E4D7] text-[11px] text-teal-950 flex items-start gap-2">
                    <span className="text-sm leading-none">⚕️</span>
                    <div>
                      <strong>Lưu ý Y khoa Thú y:</strong> Nội dung này chỉ mang tính tham khảo. Hãy
                      tham khảo ý kiến bác sĩ thú y cho Boss của bạn.
                      {post.isSevereHealthAlert && (
                        <p className="text-red-700 font-bold mt-1">
                          🚨 Nếu Boss có triệu chứng cấp tính, hãy đến phòng khám thú y gần nhất ngay!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="text-[11px] font-bold text-[#FF6F61] cursor-pointer hover:underline"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sponsored CTA Button */}
                {post.isSponsored && (
                  <button
                    onClick={() => setActiveModal('book_service', post.sponsorPartnerId || 'partner-1')}
                    className="w-full py-2.5 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold shadow-xs"
                  >
                    {post.sponsorCtaText || 'Đặt lịch ngay'}
                  </button>
                )}

                {/* Engagement Bar (Paw Reactions, Comments, Share, Bookmark) */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenReactionPickerPostId(
                            openReactionPickerPostId === post.id ? null : post.id
                          )
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          currentReaction
                            ? 'bg-[#FF6F61]/15 text-[#FF6F61] animate-paw-bounce'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
                        }`}
                      >
                        <span>{currentReaction ? currentReaction.emoji : '🐾'}</span>
                        <span>{post.engagement.pawCount}</span>
                      </button>

                      {/* 5-Reaction Picker Popover */}
                      {openReactionPickerPostId === post.id && (
                        <div className="absolute bottom-10 left-0 bg-white rounded-full shadow-xl border border-stone-200 px-2.5 py-1.5 flex items-center gap-2 z-20">
                          {REACTION_PICKER.map((item) => (
                            <button
                              key={item.type}
                              onClick={() => {
                                reactToPost(post.id, item.type);
                                setOpenReactionPickerPostId(null);
                              }}
                              title={item.label}
                              className="hover:scale-125 transition-transform text-lg"
                            >
                              {item.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.engagement.commentCount}</span>
                    </button>

                    <button
                      onClick={() =>
                        usePawtyStore
                          .getState()
                          .showToast('Đã sao chép liên kết chia sẻ 🔗', 'Kèm watermark Pawty VN.')
                      }
                      className="p-1.5 rounded-full bg-stone-100 text-stone-600"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleBookmarkPost(post.id, 'Mẹo chăm sóc')}
                    className={`p-2 rounded-full ${
                      post.isBookmarked
                        ? 'bg-[#FF6F61]/15 text-[#FF6F61]'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Comments Drawer (Expert highlighted first) */}
                {(openCommentsPostId === post.id || post.comments.some((c) => c.isExpert)) && (
                  <div className="pt-2 space-y-2 border-t border-stone-100">
                    {sortedComments.map((cmt) => (
                      <div
                        key={cmt.id}
                        className={`p-2.5 rounded-2xl text-xs ${
                          cmt.isExpert
                            ? 'bg-[#A3E4D7]/30 border border-[#A3E4D7]'
                            : 'bg-stone-50 border border-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#2D3436]">{cmt.authorName}</span>
                            {cmt.isExpert && (
                              <span className="px-2 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-[10px] font-extrabold">
                                ✓ {cmt.expertTitle || 'Chuyên gia'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400">{cmt.createdAt}</span>
                        </div>
                        <p className="text-stone-700 mt-1 leading-snug">{cmt.textContent}</p>
                      </div>
                    ))}

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={openCommentsPostId === post.id ? draftComment : ''}
                        onFocus={() => setOpenCommentsPostId(post.id)}
                        onChange={(e) => setDraftComment(e.target.value)}
                        placeholder="Viết bình luận chia sẻ cùng chủ nuôi..."
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-100 text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (openCommentsPostId === post.id && draftComment.trim()) {
                            addCommentToPost(post.id, draftComment);
                            setDraftComment('');
                          }
                        }}
                        className="p-2 rounded-xl bg-[#FF6F61] text-white"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DISCOVER / TRENDING HASHTAGS (Tầng 2 Section 8.2) */}
      {exploreSubTab === 'discover' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-stone-200/80 space-y-3">
            <h2 className="font-display text-sm font-bold text-[#2D3436]">
              🔥 Hashtag Trending Hôm Nay
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                '#BossNghịch',
                '#MèoNgủ',
                '#GoldenRetriever',
                '#MèoAnh',
                '#GroomingSG',
                '#VinhomesQ9',
                '#TiêmPhòng',
                '#DắtDạo',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setExploreSubTab('feed');
                  }}
                  className="px-3 py-1.5 rounded-2xl bg-[#FDFBF7] border border-stone-200 text-xs font-bold text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-stone-200/80 space-y-3">
            <h2 className="font-display text-sm font-bold text-[#2D3436]">
              ⭐ Dành riêng cho Sen nuôi {activePet.breed}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {pets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openPublicPetProfile(p)}
                  className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200 cursor-pointer hover:border-[#FF6F61]"
                >
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-full h-28 rounded-xl object-cover mb-2"
                  />
                  <p className="text-xs font-extrabold">{p.name}</p>
                  <p className="text-[11px] text-stone-500 truncate">{p.breed}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-teal-800 bg-[#A3E4D7]/40 px-2 py-0.5 rounded-full">
                    🐾 {p.followerCount} followers
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#A3E4D7]/30 border border-[#A3E4D7] space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-teal-900">
              💡 Mẹo hôm nay (Chuyên gia kiểm duyệt)
            </span>
            <p className="text-xs font-bold text-[#2D3436]">
              Khung giờ vàng dắt cún tại đô thị: 6h00–7h30 sáng & sau 17h30 chiều để bảo vệ đệm thịt
              bàn chân khỏi bỏng nhiệt mặt đường nhựa.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: COMMUNITY GROUPS (Tầng 2 Section 7) */}
      {exploreSubTab === 'groups' && (
        <div className="space-y-3">
          {groups.map((grp) => (
            <div
              key={grp.id}
              className="bg-white rounded-3xl p-4 border border-stone-200/80 space-y-2.5"
            >
              <div className="flex items-start gap-3">
                <img
                  src={grp.avatarUrl}
                  alt={grp.name}
                  className="w-13 h-13 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 uppercase">
                    {grp.type} · {grp.area}
                  </span>
                  <h3 className="font-display text-sm font-bold text-[#2D3436] mt-0.5">
                    {grp.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{grp.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-500">
                  👥 {grp.memberCount} thành viên · Mod: {grp.moderatorNames[0]}
                </span>
                <button
                  onClick={() => toggleJoinGroup(grp.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                    grp.isJoined
                      ? 'bg-[#A3E4D7]/40 text-teal-950'
                      : 'bg-[#FF6F61] text-white shadow-xs'
                  }`}
                >
                  {grp.isJoined ? 'Đã tham gia ✓' : 'Tham gia nhóm'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 4: Q&A WITH VERIFIED EXPERTS */}
      {exploreSubTab === 'qa' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#A3E4D7]/40 to-white border border-[#A3E4D7] flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-bold text-teal-950">
                Hỏi Đáp Cùng Bác Sĩ Thú Y & Trainer
              </h3>
              <p className="text-xs text-teal-900 mt-0.5">
                Câu trả lời từ chuyên gia có huy hiệu xác minh luôn được ghim lên đầu.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('new_question')}
              className="px-3.5 py-2 rounded-2xl bg-[#2D3436] text-white text-xs font-bold shrink-0"
            >
              + Đặt câu hỏi
            </button>
          </div>

          {posts
            .filter((p) => p.contentType === 'question' || p.contentType === 'tip')
            .map((qPost) => (
              <div
                key={qPost.id}
                className="bg-white rounded-3xl p-4 border border-stone-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {qPost.contentType === 'question' ? '❓ Câu hỏi cộng đồng' : '💡 Mẹo Chuyên gia'}
                  </span>
                  <span className="text-[11px] text-stone-400">{qPost.location.name}</span>
                </div>
                <p className="text-xs font-bold text-[#2D3436] leading-relaxed">
                  {qPost.textContent}
                </p>
                {qPost.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-[#A3E4D7]/25 border border-[#A3E4D7] text-xs"
                  >
                    <p className="font-bold text-teal-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                      {c.authorName} ({c.expertTitle || 'Thành viên'})
                    </p>
                    <p className="text-stone-700 mt-1">{c.textContent}</p>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {/* VIEW 5: LAYER 4 PAWTY SERVICES (VERIFIED PARTNERS) */}
      {exploreSubTab === 'services' && (
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-[#A3E4D7]/25 border border-[#A3E4D7] text-xs text-teal-950">
            <strong>🛡️ Dịch vụ Tin cậy (Pawty Services):</strong> Chỉ mở các dịch vụ rủi ro thấp &
            trung bình (Grooming, Khám định kỳ, Dog Walking) từ cơ sở đã xác minh giấy phép.
          </div>

          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={partner.avatarUrl}
                  alt={partner.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-display text-sm font-bold text-[#2D3436]">
                      {partner.name}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Đã xác minh
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">{partner.address}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {partner.ratingAvg} (
                      {partner.reviewCount} đánh giá thật)
                    </span>
                    <span className="text-teal-700">
                      {formatDistanceLabel(partner.distanceMeters)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                {partner.services.slice(0, 3).map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-[#FDFBF7]"
                  >
                    <span className="font-semibold text-stone-700">
                      • {srv.name} ({srv.durationMin}p)
                    </span>
                    <span className="font-mono font-bold text-[#FF6F61]">
                      {formatVndCurrency(srv.priceVnd)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveModal('book_service', partner.id)}
                className="w-full py-2.5 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold shadow-xs"
              >
                Chọn dịch vụ & Đặt lịch ngay
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 6: PET-FRIENDLY PLACES MAP */}
      {exploreSubTab === 'places' && (
        <div className="space-y-3">
          {places.map((pl) => (
            <div
              key={pl.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs"
            >
              <img src={pl.imageUrl} alt={pl.name} className="w-full h-36 object-cover" />
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#A3E4D7]/50 text-teal-950">
                    🐾 Pet-Friendly Verified · {pl.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-[#FF6F61]">
                    📏 {formatDistanceLabel(pl.distanceMeters)}
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold text-[#2D3436]">{pl.name}</h3>
                <p className="text-xs text-stone-500">{pl.address}</p>
                <div className="flex flex-wrap gap-1.5">
                  {pl.features.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 7: POSTGIS RADAR SWIPE CARDS */}
      {exploreSubTab === 'radar' && (
        <div className="space-y-3">
          {/* Radar Filter Controls */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-teal-900 cursor-pointer">
              <input
                type="checkbox"
                checked={radarVaccinatedOnly}
                onChange={(e) => setRadarVaccinatedOnly(e.target.checked)}
                className="accent-teal-600 rounded"
              />
              <span>🟢 Chỉ Boss đã tiêm đủ (Safe Pet)</span>
            </label>

            <select
              value={radarMaxRadiusMeters}
              onChange={(e) => setRadarMaxRadiusMeters(Number(e.target.value))}
              className="px-2.5 py-1 rounded-xl bg-stone-100 text-xs font-bold"
            >
              <option value={500}>Bán kính 500m</option>
              <option value={1500}>Bán kính 1.5km</option>
              <option value={3000}>Bán kính 3km</option>
            </select>
          </div>

          {user.radarLockedUntil && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong>Radar tạm khóa đến {user.radarLockedUntil}:</strong> Tài khoản bị báo cáo
                không đến điểm hẹn dắt dạo 2 lần/tuần.
              </div>
            </div>
          )}

          {filteredRadar.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
              <p className="text-2xl">🐾</p>
              <p className="text-xs font-bold text-[#2D3436]">
                Đã quét hết các Boss trong bán kính {radarMaxRadiusMeters}m!
              </p>
              <p className="text-[11px] text-stone-500">
                Mở rộng bán kính lên 3km hoặc quay lại sau nhé.
              </p>
            </div>
          ) : (
            filteredRadar.slice(0, 1).map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-lg"
              >
                <div className="relative h-64">
                  <img
                    src={candidate.pet.avatarUrl}
                    alt={candidate.pet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold">
                      📍 {formatDistanceLabel(candidate.distanceMeters)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#A3E4D7] text-teal-950 text-[11px] font-extrabold">
                      🟢 Đã tiêm đủ 7 bệnh & Dại
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                    <h3 className="font-display text-xl font-bold">
                      {candidate.pet.name} · {candidate.pet.breed}
                    </h3>
                    <p className="text-xs opacity-90">
                      Chủ nuôi: {candidate.ownerName} · {candidate.neighborhood}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="p-2.5 rounded-2xl bg-[#FF6F61]/10 text-[#2D3436] text-xs font-semibold">
                    ✨ <strong>Độ hợp cạ {candidate.compatibilityScore}%:</strong>{' '}
                    {candidate.matchReason}
                  </div>

                  {/* Fight Prevention Behavior Transparency */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-stone-500 uppercase">
                      Minh bạch hành vi (Phòng tránh xung đột):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.pet.behaviors.map((bh) => (
                        <span
                          key={bh.id}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            bh.category === 'caution'
                              ? 'bg-amber-100 text-amber-950'
                              : 'bg-[#A3E4D7]/40 text-teal-950'
                          }`}
                        >
                          {bh.category === 'caution' ? '⚠️ ' : '✓ '}
                          {bh.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => swipeRadarCandidate(candidate.id, 'left')}
                      className="py-3 rounded-2xl border-2 border-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50"
                    >
                      <X className="w-4 h-4" /> Bỏ qua
                    </button>
                    <button
                      onClick={() => swipeRadarCandidate(candidate.id, 'right')}
                      className="py-3 rounded-2xl bg-[#FF6F61] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
                    >
                      <Heart className="w-4 h-4 fill-current" /> Rủ đi dạo chung!
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

