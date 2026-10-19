import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PetProfile, NativeAd } from '../../types';
import { NATIVE_ADS } from '../../data/mockData';
import { MatchModal } from './MatchModal';
import { RadarFilterModal } from './RadarFilterModal';
import {
  MapPin,
  SlidersHorizontal,
  Flame,
  Heart,
  X,
  Star,
  RotateCcw,
  Info,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';

export const RadarScreen: React.FC = () => {
  const {
    user,
    currentPet,
    nearbyPets,
    handleSwipe,
    matchedPet,
    setMatchedPet,
    radarFilter,
    setRadarFilter,
    setViewingPetProfile,
    setIsVipModalOpen,
    setIsSosModalOpen,
    triggerPushNotice,
    setActiveTab,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedCardsHistory, setSwipedCardsHistory] = useState<PetProfile[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Filter nearby pets based on user PostGIS radar settings
  const filteredPets = useMemo(() => {
    return nearbyPets.filter((pet) => {
      // Don't show current pet
      if (pet.id === currentPet.id) return false;

      // Distance filter
      const distance = pet.distanceMeters || 1000;
      if (distance > radarFilter.radiusMeters) return false;

      // Species filter
      if (radarFilter.species !== 'all' && pet.species !== radarFilter.species) return false;

      // Size filter
      if (radarFilter.size !== 'all' && pet.size !== radarFilter.size) return false;

      // Verified filter
      if (radarFilter.verifiedOnly && !pet.isVaccinated) return false;

      return true;
    });
  }, [nearbyPets, currentPet.id, radarFilter]);

  // Merge pets with Native Ads for realistic monetization
  const deckItems: (PetProfile | NativeAd)[] = useMemo(() => {
    const items: (PetProfile | NativeAd)[] = [];
    filteredPets.forEach((pet, index) => {
      items.push(pet);
      // Insert Native Ad after card 2 and card 5
      if (index === 1 && NATIVE_ADS[0]) {
        items.push(NATIVE_ADS[0]);
      } else if (index === 4 && NATIVE_ADS[1]) {
        items.push(NATIVE_ADS[1]);
      }
    });
    return items;
  }, [filteredPets]);

  const currentItem = deckItems[currentIndex];
  const nextItem = deckItems[currentIndex + 1];

  const handleAction = (action: 'like' | 'dislike' | 'super') => {
    if (!currentItem) return;

    // If it's an ad, just advance
    if ('isAd' in currentItem) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setSwipeDirection(action === 'like' || action === 'super' ? 'right' : 'left');

    setTimeout(() => {
      setSwipedCardsHistory((prev) => [...prev, currentItem]);
      handleSwipe(currentItem, action === 'dislike' ? 'dislike' : 'like');
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 200);
  };

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSwipedCardsHistory((prev) => prev.slice(0, -1));
    }
  };

  const remainingSwipes = Math.max(0, user.maxFreeSwipesPerDay - user.dailySwipesCount);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFBF7] relative select-none">
      {/* Top Header Bar */}
      <header className="shrink-0 px-3.5 py-2 flex items-center justify-between border-b border-slate-100 bg-white/85 backdrop-blur-md z-20">
        {/* Left: Brand Logo & User Pet Avatar */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => setActiveTab('profile')}
            className="relative cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-[#FF6F61] shadow-xs group-hover:scale-105 transition-transform">
              <img src={currentPet.avatarUrl} alt={currentPet.name} className="w-full h-full object-cover" />
            </div>
            {user.isVip && (
              <div className="absolute -top-1.5 -left-1 w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>
          <img
            src="/assets/pawty-logo-full.png"
            alt="Pawty"
            className="h-6.5 w-auto object-contain cursor-pointer"
            onClick={() => setCurrentIndex(0)}
          />
        </div>

        {/* Center/Right: Location Badge & Actions */}
        <div className="flex items-center gap-1.5">
          <div
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-[#FF6F61]" />
            <span className="truncate max-w-[85px] font-fredoka">{user.location.condoComplex.split(' ')[0]}...</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {(radarFilter.radiusMeters / 1000).toFixed(1)}k
            </span>
          </div>

          {/* SOS Lost Pet Button */}
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="relative px-2.5 py-1.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm shadow-red-500/30 transition-transform active:scale-95 animate-pulse"
            title="SOS Báo mất Boss khẩn cấp"
          >
            <span>🚨</span>
            <span className="font-fredoka">SOS</span>
          </button>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
            title="Lọc radar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {(radarFilter.species !== 'all' || radarFilter.verifiedOnly) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6F61]" />
            )}
          </button>
        </div>
      </header>

      {/* Swipe Quota Banner for Non-VIP */}
      {!user.isVip && (
        <div className="shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 border-b border-amber-200/50 flex items-center justify-between text-[11px]">
          <span className="text-amber-800 font-medium flex items-center gap-1">
            <span>⚡</span>
            <span>Còn <strong>{remainingSwipes}/20</strong> lượt quẹt tự do hôm nay</span>
          </span>
          <button
            onClick={() => setIsVipModalOpen(true)}
            className="text-[#FF6F61] font-bold hover:underline font-fredoka flex items-center gap-0.5"
          >
            <span>Lên VIP (49k)</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Main Swiper Deck Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden">
        {currentItem ? (
          <div className="relative w-full max-w-[360px] h-[520px] max-h-[66vh] flex items-center justify-center">
            {/* Next Card underneath (Preview) */}
            {nextItem && (
              <div className="absolute inset-0 rounded-[32px] overflow-hidden scale-95 opacity-60 translate-y-3 pointer-events-none shadow-lg bg-slate-200 border border-slate-300">
                {'isAd' in nextItem ? (
                  <img src={nextItem.imageUrl} alt={nextItem.title} className="w-full h-full object-cover" />
                ) : (
                  <img src={nextItem.photos[0] || nextItem.avatarUrl} alt={nextItem.name} className="w-full h-full object-cover" />
                )}
              </div>
            )}

            {/* Current Top Card */}
            <div
              className={`absolute inset-0 rounded-[32px] overflow-hidden shadow-2xl border-2 border-white/60 bg-white transition-transform duration-200 flex flex-col ${
                swipeDirection === 'right'
                  ? 'translate-x-48 rotate-12 opacity-0'
                  : swipeDirection === 'left'
                  ? '-translate-x-48 -rotate-12 opacity-0'
                  : ''
              }`}
            >
              {/* Check if Native Ad or Pet */}
              {'isAd' in currentItem ? (
                /* Native Ad Card (Monetization 3) */
                <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-slate-900 text-white">
                  <img
                    src={currentItem.imageUrl}
                    alt={currentItem.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Ad Header */}
                  <div className="relative z-10 p-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow">
                      Được Tài Trợ • Native Ad
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[11px] font-bold">
                      {currentItem.distance}
                    </span>
                  </div>

                  {/* Ad Content */}
                  <div className="relative z-10 p-5 space-y-2">
                    <div className="inline-block px-3 py-1 rounded-xl bg-[#FF6F61] text-white font-fredoka font-bold text-xs shadow-md">
                      {currentItem.discountBadge}
                    </div>
                    <h3 className="font-fredoka text-xl font-black text-white leading-tight">
                      {currentItem.title}
                    </h3>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {currentItem.tagline}
                    </p>
                    <p className="text-[11px] text-[#A3E4D7] font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{currentItem.locationName}</span>
                    </p>

                    <button
                      onClick={() => {
                        triggerPushNotice({
                          title: '🎁 Đã lưu mã Voucher thành công!',
                          body: 'Mã PAWTY35 đã được thêm vào ví ưu đãi của bạn. Xuất trình khi tới tiệm!',
                          type: 'system',
                        });
                        handleAction('like');
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{currentItem.ctaText}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Pet Card */
                <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
                  <img
                    src={currentItem.photos[0] || currentItem.avatarUrl}
                    alt={currentItem.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Subtle Gradient Shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

                  {/* Top Card Badges */}
                  <div className="relative z-10 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 border border-white/20">
                        <MapPin className="w-3 h-3 text-[#FF6F61]" />
                        <span>Cách {currentItem.distanceMeters || 250}m</span>
                      </span>

                      {currentItem.isVaccinated && (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Đã Tiêm</span>
                        </span>
                      )}
                    </div>

                    {/* View full 2-tab profile button */}
                    <button
                      onClick={() => setViewingPetProfile(currentItem)}
                      className="p-2 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-colors shadow-md"
                      title="Xem nhật ký bựa & sổ tiêm chủng"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Pet Details */}
                  <div className="relative z-10 p-4 space-y-2 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-fredoka text-2xl font-black tracking-tight text-white drop-shadow-md">
                            {currentItem.name}
                          </h2>
                          <span className="text-sm font-semibold text-slate-200">
                            {currentItem.ageYears > 0 ? `${currentItem.ageYears} tuổi` : `${currentItem.ageMonths} tháng`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {currentItem.breed} • {currentItem.gender === 'male' ? 'Đực' : 'Cái'}
                          {currentItem.isNeutered && ' (Đã triệt sản)'}
                        </p>
                      </div>

                      {/* Owner Preview Pill */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold">
                        <img
                          src={currentItem.ownerAvatar}
                          alt={currentItem.ownerName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="truncate max-w-[80px]">{currentItem.ownerName}</span>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-200/90 line-clamp-2 leading-relaxed">
                      "{currentItem.bio}"
                    </p>

                    {/* Personality Tags Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-[#A3E4D7]/30 backdrop-blur-md text-[#E8F8F5] text-[10px] font-bold border border-[#A3E4D7]/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty Radar State */
          <div className="w-full max-w-xs text-center py-10 px-4 space-y-4 bg-white/70 rounded-3xl border border-slate-200/70 shadow-sm backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF6F61]/20 to-[#A3E4D7]/30 flex items-center justify-center text-3xl mx-auto animate-bounce">
              🐾
            </div>
            <div>
              <h3 className="font-fredoka text-lg font-bold text-slate-900">
                Đã Quét Hết Boss Lân Cận!
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Không còn Boss nào trong bán kính {(radarFilter.radiusMeters / 1000).toFixed(1)}km. Hãy mở rộng bán kính hoặc quay lại sau nhé Sen!
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setRadarFilter((prev) => ({ ...prev, radiusMeters: 3000, species: 'all' }))}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/20"
              >
                Mở rộng bán kính lên 3.0km 🚀
              </button>
              <button
                onClick={() => setCurrentIndex(0)}
                className="w-full py-2 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Quẹt lại từ đầu
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        {currentItem && (
          <div className="w-full max-w-[340px] flex items-center justify-around mt-4 pt-1 z-10">
            {/* Rewind */}
            <button
              onClick={handleRewind}
              disabled={currentIndex === 0}
              className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-amber-500 shadow-md flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title="Quay lại thẻ trước"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Dislike (Pass) */}
            <button
              onClick={() => handleAction('dislike')}
              className="w-14 h-14 rounded-full bg-white hover:bg-rose-50 border-2 border-rose-200 text-rose-500 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-90"
              title="Bỏ qua (Quẹt trái)"
            >
              <X className="w-7 h-7 stroke-[2.5]" />
            </button>

            {/* Super Paw */}
            <button
              onClick={() => handleAction('super')}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#A3E4D7] to-emerald-400 text-emerald-950 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Siêu Thích (Super Paw)"
            >
              <Star className="w-5 h-5 fill-current" />
            </button>

            {/* Like */}
            <button
              onClick={() => handleAction('like')}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF6F61] to-[#FF8E82] text-white shadow-lg shadow-[#FF6F61]/35 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
              title="Thích Boss này (Quẹt phải)"
            >
              <Heart className="w-7 h-7 fill-white stroke-[2]" />
            </button>

            {/* Profile Info */}
            {'photos' in currentItem && (
              <button
                onClick={() => setViewingPetProfile(currentItem as PetProfile)}
                className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-md flex items-center justify-center transition-all active:scale-95"
                title="Xem tiểu sử chi tiết"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Match Pop-up Modal */}
      <MatchModal
        matchedPet={matchedPet}
        onClose={() => setMatchedPet(null)}
      />

      {/* Filter Modal */}
      <RadarFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};
