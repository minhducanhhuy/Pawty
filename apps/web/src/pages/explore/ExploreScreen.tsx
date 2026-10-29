import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Move,
  Play,
  RotateCcw,
  Search,
  Send,
  Star,
  TrendingUp,
  User,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { formatDistanceLabel, formatVndCurrency } from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { WEB_THEMES } from '../../mocks/seedData';

type PostCategoryFilter = 'all' | 'moment' | 'tip' | 'question';
type TinderIntentMode = 'dating' | 'playdate' | 'community';

const POST_CATEGORY_LABELS: Record<PostCategoryFilter, string> = {
  all: 'Tất cả',
  moment: 'Nhật ký',
  tip: 'Mẹo chăm',
  question: 'Hỏi đáp',
};

const FRIENDLY_NICKNAMES: Record<string, string> = {
  'Mai Nguyễn': 'Bạn thân của cún',
  'Minh Phạm': 'Mê Corgi chân ngắn',
  'BS. Trần Minh Khoa': 'Bác sĩ thú y',
  'Lan Anh': 'Yêu mèo Anh',
};

export const ExploreScreen: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    pets,
    posts,
    reactToPost,
    addCommentToPost,
    toggleBookmarkPost,
    partners,
    radarCandidates,
    swipeRadarCandidate,
    setActiveModal,
    openPublicPetProfile,
    showToast,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;

  // Search History & Trending State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    '#GoldenRetriever',
    'Mẹo trị rụng lông mùa nóng',
    'Công viên nội khu',
    'BS. Trần Minh Khoa',
  ]);
  const trendingTerms = [
    '#CorgiChayBo',
    '#HenDaoCuoiTuan',
    '#ThucAnHatKhongNguCoc',
    '#SpaThuCungQuan9',
    '#PhongBenhDai',
  ];

  const [categoryFilter, setCategoryFilter] = useState<PostCategoryFilter>('all');
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});
  const [lightboxState, setLightboxState] = useState<{
    urls: string[];
    idx: number;
    author: string;
    caption: string;
  } | null>(null);

  // Tinder State (Intent + Pointer Drag Swipe)
  const [tinderIntent, setTinderIntent] = useState<TinderIntentMode>('playdate');
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);
  const [matchedOwnerName, setMatchedOwnerName] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (categoryFilter !== 'all' && p.contentType !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.textContent.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.hashtags.some((h) => h.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [posts, categoryFilter, searchQuery]);

  const applySearch = (term: string) => {
    const clean = term.trim();
    setSearchQuery(clean);
    if (clean) {
      setSearchHistory((prev) =>
        [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8)
      );
    }
    setIsSearchOpen(false);
  };

  const getCategoryBadgeLabel = (type: string) => {
    switch (type) {
      case 'tip':
        return 'Mẹo chăm';
      case 'question':
        return 'Hỏi đáp';
      default:
        return 'Nhật ký';
    }
  };

  // ============================================================================
  // TAB 2: HẸN HÒ (DEDICATED TINDER DRAG-AND-DROP TAB)
  // ============================================================================
  if (activeTab === 'tinder') {
    const topCandidate = radarCandidates[0] || null;
    const isVip = user.vipPlan !== 'basic';

    const handlePointerDown = (e: React.PointerEvent) => {
      setDragStartX(e.clientX);
    };
    const handlePointerMove = (e: React.PointerEvent) => {
      if (dragStartX === null) return;
      setDragOffsetX(e.clientX - dragStartX);
    };
    const handlePointerUp = () => {
      if (dragStartX === null || !topCandidate) {
        setDragStartX(null);
        setDragOffsetX(0);
        return;
      }
      if (dragOffsetX > 90) {
        swipeRadarCandidate(topCandidate.id, 'right');
        setMatchedOwnerName(topCandidate.ownerName);
      } else if (dragOffsetX < -90) {
        swipeRadarCandidate(topCandidate.id, 'left');
      }
      setDragStartX(null);
      setDragOffsetX(0);
    };

    return (
      <div className="p-4 pb-6 space-y-3.5 select-none">
        {/* Step 1: Mandatory Connection Intent Selector */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="p-3.5 rounded-2xl border space-y-2"
        >
          <p style={{ color: theme.text }} className="text-xs font-extrabold">
            Mong muốn kết nối của bạn hôm nay:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'dating', label: 'Hẹn hò', desc: 'Kết nối chủ nuôi độc thân yêu thú cưng' },
                { id: 'playdate', label: 'Bạn chơi chung', desc: 'Tìm bạn cún/mèo đi dạo công viên' },
                { id: 'community', label: 'Giao lưu', desc: 'Kết bạn hàng xóm chia sẻ kinh nghiệm' },
              ] as const
            ).map((item) => {
              const active = tinderIntent === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTinderIntent(item.id)}
                  style={{
                    backgroundColor: active ? theme.primary : theme.bg,
                    borderColor: active ? theme.primary : theme.border,
                    color: active ? '#FFFFFF' : theme.text,
                  }}
                  className="py-2 px-2 rounded-xl border text-xs font-bold transition-colors"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p style={{ color: theme.textSoft }} className="text-[11px]">
            {tinderIntent === 'dating' &&
              'Đang hiển thị những người độc thân yêu thú cưng muốn hẹn hò quanh bạn.'}
            {tinderIntent === 'playdate' &&
              'Đang hiển thị các bé thú cưng đã tiêm phòng đầy đủ sẵn sàng đi dạo công viên.'}
            {tinderIntent === 'community' &&
              'Đang hiển thị hàng xóm nuôi thú cưng muốn giao lưu kinh nghiệm.'}
          </p>
        </div>

        {/* Step 2: Tinder Plus Premium Tools */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              if (!isVip) {
                setActiveModal('vip_upgrade');
                return;
              }
              showToast('Đã hoàn tác', 'Đã khôi phục thẻ vừa quẹt.');
            }}
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            className="py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <RotateCcw style={{ color: theme.primary }} className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>

          <button
            onClick={() => setActiveModal('vip_upgrade')}
            style={{
              backgroundColor: theme.primarySoft,
              borderColor: theme.primary,
              color: theme.primary,
            }}
            className="py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Đã thích bạn (3)</span>
          </button>

          <button
            onClick={() => {
              if (!isVip) {
                setActiveModal('vip_upgrade');
                return;
              }
              showToast('Đổi vị trí Passport', 'Đã chuyển radar sang Thảo Điền, Quận 2.');
            }}
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            className="py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <MapPin style={{ color: theme.primary }} className="w-3.5 h-3.5" />
            <span>Đổi vị trí</span>
          </button>
        </div>

        {/* Step 3: Drag-and-Drop Swipe Card (NO bottom buttons) */}
        {topCandidate ? (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: `translateX(${dragOffsetX}px) rotate(${dragOffsetX * 0.04}deg)`,
              transition: dragStartX === null ? 'transform 0.2s ease' : 'none',
            }}
            className="rounded-3xl overflow-hidden border shadow-sm cursor-grab active:cursor-grabbing relative"
          >
            <div className="relative">
              <img
                src={topCandidate.pet.coverPhotoUrl}
                alt={topCandidate.pet.name}
                className="w-full h-64 object-cover pointer-events-none"
              />
              {dragOffsetX > 35 && (
                <div className="absolute top-5 left-5 border-4 border-emerald-600 text-emerald-600 bg-white/90 px-3 py-1 rounded-xl font-black text-lg -rotate-12">
                  THÍCH
                </div>
              )}
              {dragOffsetX < -35 && (
                <div className="absolute top-5 right-5 border-4 border-red-600 text-red-600 bg-white/90 px-3 py-1 rounded-xl font-black text-lg rotate-12">
                  BỎ QUA
                </div>
              )}
            </div>

            <div className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 style={{ color: theme.text }} className="text-base font-extrabold">
                      {topCandidate.ownerName} & Bé {topCandidate.pet.name}
                    </h3>
                    <span
                      style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                    >
                      {FRIENDLY_NICKNAMES[topCandidate.ownerName] || 'Bạn yêu thú cưng'}
                    </span>
                  </div>
                  <p style={{ color: theme.textSoft }} className="text-xs mt-0.5">
                    Cách bạn {topCandidate.distanceMeters}m · {topCandidate.neighborhood}
                  </p>
                </div>
                <button
                  onClick={() => openPublicPetProfile(topCandidate.pet)}
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Hồ sơ</span>
                </button>
              </div>

              {/* 1-Tick Vaccination Safety Badge */}
              <div
                style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã tiêm chủng & Phòng dại đầy đủ</span>
              </div>

              <p style={{ color: theme.text }} className="text-xs leading-relaxed">
                {topCandidate.matchReason}
              </p>

              {/* Gesture Guide Bar (replaces buttons) */}
              <div
                style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.textSoft }}
                className="p-2.5 rounded-xl border text-center text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Move style={{ color: theme.primary }} className="w-4 h-4" />
                <span>Kéo thả thẻ sang phải để Thích · Kéo sang trái để Bỏ qua</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="p-8 rounded-2xl border text-center space-y-2"
          >
            <p style={{ color: theme.text }} className="text-sm font-bold">
              Đã xem hết hồ sơ trong mục này
            </p>
            <p style={{ color: theme.textSoft }} className="text-xs">
              Hãy thử chuyển đổi mong muốn kết nối ở phía trên.
            </p>
          </div>
        )}

        {/* Match Celebration -> Straight to Chat */}
        {matchedOwnerName && (
          <div
            style={{ backgroundColor: theme.surface, borderColor: theme.primary }}
            className="p-4 rounded-2xl border-2 text-center space-y-2"
          >
            <p style={{ color: theme.primary }} className="text-xs font-extrabold uppercase">
              Tương hợp thành công!
            </p>
            <p style={{ color: theme.text }} className="text-sm font-bold">
              Bạn và {matchedOwnerName} đã thích nhau!
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setMatchedOwnerName(null)}
                style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                className="flex-1 py-2 rounded-xl border text-xs font-bold"
              >
                Quẹt tiếp
              </button>
              <button
                onClick={() => {
                  setMatchedOwnerName(null);
                  setActiveTab('chat');
                }}
                style={{ backgroundColor: theme.primary }}
                className="flex-1 py-2 rounded-xl text-white text-xs font-bold"
              >
                Nhắn tin ngay
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // TAB 3: DỊCH VỤ (DEDICATED SERVICES TAB)
  // ============================================================================
  if (activeTab === 'services') {
    return (
      <div className="p-4 pb-6 space-y-3">
        {partners.map((partner) => (
          <div
            key={partner.id}
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="rounded-2xl p-4 border space-y-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={partner.avatarUrl}
                alt={partner.name}
                className="w-14 h-14 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 style={{ color: theme.text }} className="text-sm font-bold">
                    {partner.name}
                  </h3>
                  <span
                    style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Đối tác uy tín
                  </span>
                </div>
                <p style={{ color: theme.textSoft }} className="text-xs mt-0.5">
                  {partner.address}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs font-bold">
                  <span style={{ color: '#C88A2E' }} className="inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {partner.ratingAvg} (
                    {partner.reviewCount})
                  </span>
                  <span style={{ color: theme.primary }}>
                    Cách {formatDistanceLabel(partner.distanceMeters)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderColor: theme.border }} className="space-y-1.5 pt-2.5 border-t">
              {partner.services.slice(0, 3).map((srv) => (
                <div
                  key={srv.id}
                  style={{ backgroundColor: theme.bg }}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl"
                >
                  <span style={{ color: theme.text }} className="font-medium">
                    {srv.name} ({srv.durationMin} phút)
                  </span>
                  <span style={{ color: theme.primary }} className="font-bold">
                    {formatVndCurrency(srv.priceVnd)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal('book_service', partner.id)}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold"
            >
              Đặt lịch hẹn ngay
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ============================================================================
  // TAB 1 (DEFAULT): KHÁM PHÁ = BẢNG TIN MẠNG XÃ HỘI INSTAGRAM STYLE
  // ============================================================================
  return (
    <div className="p-4 pb-6 space-y-3.5">
      {/* Search Bar with Search History & Trending Overlay */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="relative flex items-center px-3.5 py-2.5 rounded-2xl border"
      >
        <Search style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsSearchOpen(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applySearch(searchQuery);
          }}
          placeholder="Tìm khoảnh khắc, #Corgi, bạn bè..."
          style={{ color: theme.text }}
          className="w-full bg-transparent text-xs font-medium focus:outline-none"
        />
        {searchQuery.length > 0 && (
          <button onClick={() => setSearchQuery('')} style={{ color: theme.textSoft }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {isSearchOpen && (
          <button
            onClick={() => setIsSearchOpen(false)}
            style={{ backgroundColor: theme.bg, color: theme.text }}
            className="ml-2 px-2 py-1 rounded-lg text-[11px] font-bold shrink-0"
          >
            Đóng
          </button>
        )}
      </div>

      {/* Search History & Trending Suggestions Panel */}
      {isSearchOpen && (
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="p-3.5 rounded-2xl border space-y-3"
        >
          <div className="flex items-center justify-between">
            <span style={{ color: theme.text }} className="text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Lịch sử tìm kiếm gần đây
            </span>
            {searchHistory.length > 0 && (
              <button
                onClick={() => setSearchHistory([])}
                style={{ color: theme.primary }}
                className="text-[11px] font-bold"
              >
                Xóa tất cả
              </button>
            )}
          </div>
          <div className="space-y-1">
            {searchHistory.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between py-1 text-xs"
              >
                <button
                  onClick={() => applySearch(item)}
                  style={{ color: theme.text }}
                  className="font-medium text-left flex-1"
                >
                  {item}
                </button>
                <button
                  onClick={() =>
                    setSearchHistory((prev) => prev.filter((x) => x !== item))
                  }
                  style={{ color: theme.textSoft }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <span style={{ color: theme.text }} className="text-xs font-bold flex items-center gap-1.5 mb-2">
              <TrendingUp style={{ color: theme.primary }} className="w-3.5 h-3.5" /> Đề xuất & Thịnh hành hiện tại
            </span>
            <div className="flex flex-wrap gap-1.5">
              {trendingTerms.map((tag) => (
                <button
                  key={tag}
                  onClick={() => applySearch(tag)}
                  style={{
                    backgroundColor: theme.primarySoft,
                    borderColor: theme.primary,
                    color: theme.primary,
                  }}
                  className="px-2.5 py-1 rounded-full border text-[11px] font-bold inline-flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Single-Row Category Filter */}
      <div className="grid grid-cols-4 gap-1.5">
        {(['all', 'moment', 'tip', 'question'] as PostCategoryFilter[]).map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                backgroundColor: active ? theme.primarySoft : theme.surface,
                borderColor: active ? theme.primary : theme.border,
                color: active ? theme.primary : theme.textSoft,
              }}
              className="py-2 px-1 rounded-xl border text-xs font-bold text-center transition-colors truncate"
            >
              {POST_CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Instagram-Style Feed Posts */}
      {filteredPosts.map((post) => {
        const isLiked = Boolean(post.userReaction);
        const totalReactions = post.engagement.pawCount;
        const nickname = FRIENDLY_NICKNAMES[post.authorName] || 'Bạn thân thú cưng';
        const mediaUrls = post.media.map((m) => m.url);

        return (
          <article
            key={post.id}
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="rounded-2xl p-4 border space-y-3"
          >
            {/* Author Header: Click Avatar/Name to view Public Profile */}
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={() => {
                  const targetPet = pets.find((p) => p.id === post.petIds[0]) || pets[0];
                  if (targetPet) openPublicPetProfile(targetPet);
                }}
                className="flex items-center gap-2.5 cursor-pointer min-w-0"
              >
                <img
                  src={post.authorAvatar || post.petAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span style={{ color: theme.text }} className="text-xs font-extrabold">
                      {post.authorName}
                    </span>
                    <span
                      style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                    >
                      {nickname}
                    </span>
                  </div>
                  {/* Small Subtitle: ONLY Category Label + Time Posted */}
                  <p style={{ color: theme.textSoft }} className="text-[11px] mt-0.5 font-medium">
                    {getCategoryBadgeLabel(post.contentType)} · {post.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Body */}
            <p style={{ color: theme.text }} className="text-xs whitespace-pre-line leading-relaxed">
              {post.textContent}
            </p>

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => applySearch(tag)}
                    style={{ color: theme.primary }}
                    className="text-xs font-bold hover:underline"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Post Media (Tap to Zoom Fullscreen Lightbox) */}
            {mediaUrls.length > 0 && (
              <div
                onClick={() =>
                  setLightboxState({
                    urls: mediaUrls,
                    idx: 0,
                    author: post.authorName,
                    caption: post.textContent,
                  })
                }
                className="relative rounded-xl overflow-hidden max-h-72 cursor-pointer group"
              >
                <img
                  src={mediaUrls[0]}
                  alt={post.authorName}
                  className="w-full h-60 object-cover group-hover:scale-[1.01] transition-transform"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/65 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  <span>{mediaUrls.length > 1 ? `1/${mediaUrls.length} ảnh` : 'Phóng to'}</span>
                </div>
              </div>
            )}

            {/* Instagram-Style Unified Action Bar: Heart + Comment + Share on Left, Bookmark on Right */}
            <div
              style={{ borderColor: theme.border }}
              className="pt-2.5 border-t flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => reactToPost(post.id, 'paw')}
                  style={{
                    backgroundColor: isLiked ? theme.primarySoft : theme.bg,
                    color: isLiked ? theme.primary : theme.text,
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{totalReactions}</span>
                </button>

                <button
                  onClick={() =>
                    setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)
                  }
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.engagement.commentCount}</span>
                </button>

                <button
                  onClick={() => {
                    setShareCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 8) + 1 }));
                    showToast('Đã sao chép liên kết', 'Đã sao chép liên kết chia sẻ bài viết.');
                  }}
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{shareCounts[post.id] || 8} Chia sẻ</span>
                </button>
              </div>

              <button
                onClick={() => toggleBookmarkPost(post.id, 'Đã lưu')}
                style={{ color: post.isBookmarked ? theme.primary : theme.textSoft }}
                className="p-1.5 rounded-xl transition-colors"
                aria-label="Lưu bài viết"
              >
                <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Comments Section */}
            {openCommentsPostId === post.id && (
              <div style={{ borderColor: theme.border }} className="pt-2.5 border-t space-y-2">
                {post.comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    className="p-2.5 rounded-xl border text-xs"
                  >
                    <span style={{ color: theme.text }} className="font-bold">
                      {cmt.authorName}:{' '}
                    </span>
                    <span style={{ color: theme.textSoft }}>{cmt.textContent}</span>
                  </div>
                ))}

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={draftComment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (draftComment.trim()) {
                        addCommentToPost(post.id, draftComment);
                        setDraftComment('');
                      }
                    }}
                    style={{ backgroundColor: theme.primary }}
                    className="p-2 rounded-xl text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {/* Fullscreen Lightbox Overlay */}
      {lightboxState && (
        <div
          onClick={() => setLightboxState(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4"
        >
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-bold">{lightboxState.author}</span>
            <button
              onClick={() => setLightboxState(null)}
              className="px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Đóng
            </button>
          </div>
          <div className="my-auto flex items-center justify-center">
            <img
              src={lightboxState.urls[lightboxState.idx]}
              alt={lightboxState.author}
              className="max-h-[70vh] max-w-full object-contain rounded-xl"
            />
          </div>
          <p className="text-xs text-white/90 line-clamp-3">{lightboxState.caption}</p>
        </div>
      )}
    </div>
  );
};
