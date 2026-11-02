import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '../../components/FeatherIcon';
import { TinderCandidate, getCandidateSlides } from '../../types/mobileTypes';

interface TinderProfileDetailModalProps {
  visible: boolean;
  candidate: TinderCandidate | null;
  activePhotoIdx: number;
  onClose: () => void;
  onPass: () => void;
  onLike: () => void;
  onOpenOwnerProfile?: (handle: string) => void;
  onShare: (name: string) => void;
}

const FALLBACK_PET_IMG =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80';

export const TinderProfileDetailModal: React.FC<TinderProfileDetailModalProps> = ({
  visible,
  candidate,
  activePhotoIdx,
  onClose,
  onPass,
  onLike,
  onOpenOwnerProfile,
  onShare,
}) => {
  const insets = useSafeAreaInsets();

  if (!candidate) return null;

  // Xử lý Safe Area Insets chuẩn Android & iOS
  const androidStatusHeight = StatusBar.currentHeight || 28;
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, androidStatusHeight) : insets.top;
  const bottomInset =
    Platform.OS === 'android' ? Math.max(insets.bottom, 24) : Math.max(insets.bottom, 16);

  // Danh sách slides: Ảnh chủ nuôi -> Ảnh các bé thú cưng
  const slides = useMemo(() => getCandidateSlides(candidate), [candidate]);

  const currentPhoto =
    slides[activePhotoIdx % Math.max(slides.length, 1)]?.imageUrl || FALLBACK_PET_IMG;

  // Tiêu đề đầu trang: Ưu tiên tên các bé thú cưng
  const petHeaderTitle = useMemo(() => {
    if (candidate.pets && candidate.pets.length > 0) {
      return candidate.pets.map((p) => p.name).join(' & ');
    }
    return candidate.ownerName.replace(/\s*\(@[^)]+\)/g, '').trim();
  }, [candidate]);

  const cleanOwnerName = useMemo(() => {
    if (!candidate?.ownerName) return '';
    return candidate.ownerName.replace(/\s*\(@[^)]+\)/g, '').replace(/@\w+/g, '').trim();
  }, [candidate]);

  const cleanOwnerNickname = useMemo(() => {
    if (!candidate?.ownerNickname) return '';
    const clean = candidate.ownerNickname.replace(/\s*\(@[^)]+\)/g, '').replace(/@\w+/g, '').trim();
    return clean.toLowerCase() === cleanOwnerName.toLowerCase() ? '' : clean;
  }, [candidate, cleanOwnerName]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" />

        {/* Top Header Bar with Close & Share Button (Bù trừ StatusBar Android) */}
        <View style={[styles.headerBar, { paddingTop: topInset, height: 56 + topInset }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Đóng hồ sơ chi tiết"
          >
            <Feather name="chevron-down" size={24} color="#2C2520" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {petHeaderTitle}
          </Text>
          <TouchableOpacity
            style={styles.shareHeaderBtn}
            onPress={() => onShare(candidate.ownerName)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Chia sẻ hồ sơ"
          >
            <Feather name="share-2" size={18} color="#2C2520" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Photo: Album ảnh các bé thú cưng */}
          <View style={styles.heroPhotoWrapper}>
            <Image source={{ uri: currentPhoto }} style={styles.heroPhoto} resizeMode="cover" />
            <View style={styles.photoCountBadge}>
              <Feather name="image" size={12} color="#FFFFFF" />
              <Text style={styles.photoCountText}>
                {(activePhotoIdx % slides.length) + 1} / {slides.length}
              </Text>
            </View>
          </View>

          {/* 1. ƯU TIÊN THÔNG TIN THÚ CƯNG LÊN ĐẦU */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRowBetween}>
              <View style={styles.sectionTitleRow}>
                <Feather name="shield" size={16} color="#2E7D5B" />
                <Text style={styles.sectionTitle}>
                  Hồ sơ thú cưng ({candidate.pets.length} bé)
                </Text>
              </View>
              <View style={styles.petSafeBadge}>
                <Feather name="check" size={11} color="#165A42" />
                <Text style={styles.petSafeBadgeText}>An tâm dạo chung</Text>
              </View>
            </View>

            <View style={styles.petCardsList}>
              {candidate.pets.length > 0 ? (
                candidate.pets.map((pet) => (
                  <View key={pet.id} style={styles.petItemCard}>
                    <Image
                      source={{
                        uri: pet.imageUrl || FALLBACK_PET_IMG,
                      }}
                      style={styles.petAvatar}
                    />
                    <View style={styles.petDetailsCol}>
                      <View style={styles.petTopRow}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <View style={styles.speciesPill}>
                          <Text style={styles.speciesPillText}>{pet.species}</Text>
                        </View>
                      </View>
                      <Text style={styles.petMeta}>
                        {pet.breed} · {pet.ageLabel} · {pet.weightKg} kg
                      </Text>

                      {/* Trạng thái tiêm phòng */}
                      <View
                        style={[
                          styles.vaccineBadge,
                          !pet.isVaccinatedAndRabies && styles.vaccineBadgePending,
                        ]}
                      >
                        <Feather
                          name={pet.isVaccinatedAndRabies ? 'check-circle' : 'info'}
                          size={12}
                          color={pet.isVaccinatedAndRabies ? '#2E7D5B' : '#B85D43'}
                        />
                        <Text
                          style={[
                            styles.vaccineBadgeText,
                            !pet.isVaccinatedAndRabies && { color: '#B85D43' },
                          ]}
                        >
                          {pet.isVaccinatedAndRabies
                            ? 'Chủ nuôi khai báo đã tiêm chủng & dại'
                            : 'Chưa có xác nhận đầy đủ'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyPetText}>
                  Chủ nuôi chưa bổ sung hồ sơ thú cưng chi tiết.
                </Text>
              )}
            </View>
          </View>

          {/* 2. MỤC ĐÍCH KẾT NỐI & DẠO CHUNG */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRowBetween}>
              <View style={styles.sectionTitleRow}>
                <Feather name="search" size={16} color="#FF6F61" />
                <Text style={styles.sectionTitle}>Mục đích kết nối</Text>
              </View>
              <View style={styles.distanceBadge}>
                <Feather name="map-pin" size={11} color="#2E7D5B" />
                <Text style={styles.distanceBadgeText}>Cách {candidate.distanceKm} km</Text>
              </View>
            </View>

            <Text style={styles.lookingForBigText}>{candidate.lookingFor}</Text>
            {candidate.bio ? <Text style={styles.bioSubText}>{candidate.bio}</Text> : null}
          </View>

          {/* 3. THÔNG TIN CHỦ NHÂN (GỌN GÀNG Ở PHÍA DƯỚI) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRowBetween}>
              <View style={styles.sectionTitleRow}>
                <Feather name="user" size={16} color="#6C6055" />
                <Text style={styles.sectionTitle}>Thông tin chủ nuôi (Hẹn hò)</Text>
              </View>

              
            </View>

            <View style={styles.ownerBriefRow}>
              <Image source={{ uri: candidate.avatarUrl }} style={styles.ownerAvatarSmall} />
              <View style={styles.ownerBriefTextCol}>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerNameText}>{cleanOwnerName}</Text>
                  {candidate.ownerAge ? (
                    <Text style={styles.ownerAgeText}>· {candidate.ownerAge} tuổi</Text>
                  ) : null}
                  {candidate.gender && (
                    <View style={styles.genderTag}>
                      <Text style={styles.genderTagText}>{candidate.gender}</Text>
                    </View>
                  )}
                </View>
                {cleanOwnerNickname ? (
                  <Text style={styles.nicknameText}>"{cleanOwnerNickname}"</Text>
                ) : null}
              </View>
            </View>

            {/* Phong cách sống */}
            {candidate.lifestyle && (
              <View style={styles.lifestyleSubSection}>
                <Text style={styles.lifestyleSubTitle}>Phong cách sống & Thói quen:</Text>
                <View style={styles.lifestyleGrid}>
                  {candidate.lifestyle.smoking ? (
                    <View style={styles.lifestyleChip}>
                      <Feather name="slash" size={11} color="#5C5046" />
                      <Text style={styles.lifestyleChipText}>{candidate.lifestyle.smoking}</Text>
                    </View>
                  ) : null}
                  {candidate.lifestyle.workout ? (
                    <View style={styles.lifestyleChip}>
                      <Feather name="activity" size={11} color="#5C5046" />
                      <Text style={styles.lifestyleChipText}>{candidate.lifestyle.workout}</Text>
                    </View>
                  ) : null}
                  {candidate.lifestyle.drinking ? (
                    <View style={styles.lifestyleChip}>
                      <Feather name="coffee" size={11} color="#5C5046" />
                      <Text style={styles.lifestyleChipText}>{candidate.lifestyle.drinking}</Text>
                    </View>
                  ) : null}
                  {candidate.lifestyle.zodiac ? (
                    <View style={styles.lifestyleChip}>
                      <Feather name="star" size={11} color="#5C5046" />
                      <Text style={styles.lifestyleChipText}>{candidate.lifestyle.zodiac}</Text>
                    </View>
                  ) : null}
                  {candidate.lifestyle.chatStyle ? (
                    <View style={styles.lifestyleChip}>
                      <Feather name="message-circle" size={11} color="#5C5046" />
                      <Text style={styles.lifestyleChipText}>{candidate.lifestyle.chatStyle}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>

          {/* 4. Thẻ chia sẻ hồ sơ */}
          <TouchableOpacity
            style={styles.shareBannerCard}
            onPress={() => onShare(candidate.ownerName)}
            activeOpacity={0.8}
          >
            <View style={styles.shareBannerIconBox}>
              <Feather name="share-2" size={16} color="#FF6F61" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shareBannerTitle}>Chia sẻ hồ sơ {petHeaderTitle}</Text>
              <Text style={styles.shareBannerSub}>Gửi liên kết cho bạn bè nuôi thú cưng</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#7A6E63" />
          </TouchableOpacity>

          {/* Khoảng đệm an toàn chân trang cuộn (Bù trừ Navigation Bar Android + Floating Bar) */}
          <View style={{ height: bottomInset + 88 }} />
        </ScrollView>

        {/* Floating Bottom Quick Action Bar inside Details Modal (Bù trừ Navigation Bar Android) */}
        <View style={[styles.bottomFloatingBar, { bottom: bottomInset + 12 }]}>
          <TouchableOpacity
            style={[styles.floatingActionBtn, styles.floatingPassBtn]}
            onPress={() => {
              onClose();
              onPass();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Bỏ qua"
          >
            <Feather name="x" size={26} color="#C9302C" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingActionBtn, styles.floatingLikeBtn]}
            onPress={() => {
              onClose();
              onLike();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Thích hồ sơ"
          >
            <Feather name="heart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE5DB',
    backgroundColor: '#FAF7F2',
    zIndex: 20,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  shareHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },
  heroPhotoWrapper: {
    height: 360,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1B18',
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitleRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A3F35',
  },
  petSafeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  petSafeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#165A42',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D5B',
  },
  petCardsList: {
    gap: 10,
  },
  petItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  petAvatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#EBE4D8',
  },
  petDetailsCol: {
    flex: 1,
  },
  petTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2C2520',
  },
  speciesPill: {
    backgroundColor: '#EFE9E0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  speciesPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C5046',
  },
  petMeta: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
    marginBottom: 6,
  },
  vaccineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vaccineBadgePending: {
    backgroundColor: '#FDF3F2',
  },
  vaccineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  emptyPetText: {
    fontSize: 13,
    color: '#7A6E63',
    fontStyle: 'italic',
  },
  lookingForBigText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1815',
    lineHeight: 21,
    marginBottom: 4,
  },
  bioSubText: {
    fontSize: 13,
    color: '#5C5046',
    lineHeight: 19,
  },
  ownerBriefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  ownerAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBE4D8',
  },
  ownerBriefTextCol: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1815',
  },
  ownerAgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A6E63',
  },
  genderTag: {
    backgroundColor: '#EFE9E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C5046',
  },
  ownerHandleText: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
  },
  nicknameText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#8A7E73',
    marginTop: 2,
  },
  viewOwnerProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0EBE3',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewOwnerProfileBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C2520',
  },
  lifestyleSubSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
  },
  lifestyleSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6E63',
    marginBottom: 6,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  lifestyleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F6F2EC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  lifestyleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A3F35',
  },
  shareBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  shareBannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  shareBannerSub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
  bottomFloatingBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    zIndex: 30,
  },
  floatingActionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingPassBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE8DE',
  },
  floatingLikeBtn: {
    backgroundColor: '#FF6F61',
  },
});
