import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Feather } from '../../components/FeatherIcon';
import { TinderCandidate } from '../../data/mobileSeedData';

interface TinderProfileDetailModalProps {
  visible: boolean;
  candidate: TinderCandidate | null;
  activePhotoIdx: number;
  onClose: () => void;
  onPass: () => void;
  onLike: () => void;
  onOpenOwnerProfile: (handle: string) => void;
  onShare: (name: string) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  if (!candidate) return null;

  const photos =
    candidate.photoUrls && candidate.photoUrls.length > 0
      ? candidate.photoUrls
      : [candidate.avatarUrl];

  const currentPhoto = photos[activePhotoIdx % Math.max(photos.length, 1)] || candidate.avatarUrl;

  const isDating = candidate.intent === 'dating';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Top Header Bar with Close Button (vùng chạm >= 44x44) */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Đóng hồ sơ chi tiết"
          >
            <Feather name="chevron-down" size={24} color="#2C2520" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {candidate.ownerName}
          </Text>
          <TouchableOpacity
            style={styles.shareHeaderBtn}
            onPress={() => onShare(candidate.ownerName)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
          {/* Hero Photo Carousel Header */}
          <View style={styles.heroPhotoWrapper}>
            <Image source={{ uri: currentPhoto }} style={styles.heroPhoto} resizeMode="cover" />
            <View style={styles.photoCountBadge}>
              <Feather name="image" size={12} color="#FFFFFF" />
              <Text style={styles.photoCountText}>
                {(activePhotoIdx % photos.length) + 1} / {photos.length}
              </Text>
            </View>
          </View>

          {/* 1. Header Overview Card */}
          <View style={styles.sectionCard}>
            <View style={styles.nameAgeRow}>
              <Text style={styles.ownerBigName}>
                {candidate.ownerName}
                {candidate.ownerAge ? ` ${candidate.ownerAge}` : ''}
              </Text>
              {candidate.gender && (
                <View style={styles.genderTag}>
                  <Text style={styles.genderTagText}>{candidate.gender}</Text>
                </View>
              )}
            </View>

            <View style={styles.distanceRow}>
              <Feather name="map-pin" size={13} color="#2E7D5B" />
              <Text style={styles.distanceText}>
                Cách xa {candidate.distanceKm} km
              </Text>
            </View>

            {candidate.ownerNickname && (
              <Text style={styles.nicknameText}>"{candidate.ownerNickname}"</Text>
            )}
          </View>

          {/* 2. Đang tìm kiếm Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Feather name="search" size={16} color="#FF6F61" />
              <Text style={styles.sectionTitle}>Đang tìm kiếm</Text>
            </View>
            <Text style={styles.lookingForBigText}>{candidate.lookingFor}</Text>
            {candidate.bio && <Text style={styles.bioSubText}>{candidate.bio}</Text>}
          </View>

          {/* 3. Danh sách Thú cưng (Từng bé riêng biệt kèm trạng thái tiêm vắc-xin khai báo) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Feather name="shield" size={16} color="#2E7D5B" />
              <Text style={styles.sectionTitle}>
                Thú cưng đang nuôi ({candidate.pets.length} bé)
              </Text>
            </View>

            <View style={styles.petCardsList}>
              {candidate.pets.length > 0 ? (
                candidate.pets.map((pet) => (
                  <View key={pet.id} style={styles.petItemCard}>
                    <Image
                      source={{
                        uri:
                          pet.imageUrl ||
                          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
                      }}
                      style={styles.petAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.petTopRow}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <View style={styles.speciesPill}>
                          <Text style={styles.speciesPillText}>{pet.species}</Text>
                        </View>
                      </View>
                      <Text style={styles.petMeta}>
                        {pet.breed} · {pet.ageLabel} · {pet.weightKg} kg
                      </Text>

                      {/* Trạng thái tiêm phòng dựa trên khai báo của chủ nuôi */}
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

          {/* 4. Giới thiệu chủ nuôi & Liên kết trang cá nhân */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRowBetween}>
              <View style={styles.sectionTitleRow}>
                <Feather name="user" size={16} color="#6C6055" />
                <Text style={styles.sectionTitle}>Thông tin chủ nuôi</Text>
              </View>

              {/* Nút "Xem hồ sơ chủ nuôi" thay thế nút "Trả lời" cũ */}
              <TouchableOpacity
                style={styles.viewOwnerProfileBtn}
                onPress={() => onOpenOwnerProfile(candidate.ownerHandle)}
              >
                <Feather name="external-link" size={13} color="#2C2520" />
                <Text style={styles.viewOwnerProfileBtnText}>Xem hồ sơ chủ nuôi</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ownerMetaRow}>
              <Feather name="at-sign" size={14} color="#7A6E63" />
              <Text style={styles.ownerMetaText}>{candidate.ownerHandle}</Text>
            </View>
            <View style={styles.ownerMetaRow}>
              <Feather name="heart" size={14} color="#7A6E63" />
              <Text style={styles.ownerMetaText}>
                {candidate.intentLabel || 'Kết nối cộng đồng yêu cún mèo'}
              </Text>
            </View>
          </View>

          {/* 5. Phong cách sống (Hiển thị chi tiết cho Dating hoặc khi có dữ liệu) */}
          {candidate.lifestyle && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Feather name="tag" size={16} color="#FF6F61" />
                <Text style={styles.sectionTitle}>Phong cách sống</Text>
              </View>

              <View style={styles.lifestyleGrid}>
                {candidate.lifestyle.smoking && (
                  <View style={styles.lifestyleChip}>
                    <Feather name="slash" size={13} color="#5C5046" />
                    <Text style={styles.lifestyleChipText}>{candidate.lifestyle.smoking}</Text>
                  </View>
                )}
                {candidate.lifestyle.workout && (
                  <View style={styles.lifestyleChip}>
                    <Feather name="activity" size={13} color="#5C5046" />
                    <Text style={styles.lifestyleChipText}>{candidate.lifestyle.workout}</Text>
                  </View>
                )}
                {candidate.lifestyle.drinking && (
                  <View style={styles.lifestyleChip}>
                    <Feather name="coffee" size={13} color="#5C5046" />
                    <Text style={styles.lifestyleChipText}>{candidate.lifestyle.drinking}</Text>
                  </View>
                )}
                {candidate.lifestyle.zodiac && (
                  <View style={styles.lifestyleChip}>
                    <Feather name="star" size={13} color="#5C5046" />
                    <Text style={styles.lifestyleChipText}>{candidate.lifestyle.zodiac}</Text>
                  </View>
                )}
                {candidate.lifestyle.chatStyle && (
                  <View style={styles.lifestyleChip}>
                    <Feather name="message-circle" size={13} color="#5C5046" />
                    <Text style={styles.lifestyleChipText}>{candidate.lifestyle.chatStyle}</Text>
                  </View>
                )}
                {candidate.lifestyle.petSummary && (
                  <View style={styles.lifestyleChip}>
                    <Feather name="heart" size={13} color="#5C5046" />
                    <Text style={styles.lifestyleChipText}>{candidate.lifestyle.petSummary}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Card chia sẻ hồ sơ */}
          <TouchableOpacity
            style={styles.shareBannerCard}
            onPress={() => onShare(candidate.ownerName)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: candidate.avatarUrl }} style={styles.shareBannerAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shareBannerTitle}>Chia sẻ hồ sơ {candidate.ownerName}</Text>
              <Text style={styles.shareBannerSub}>Gửi liên kết hồ sơ cho hội bạn nuôi cún</Text>
            </View>
            <Feather name="share-2" size={16} color="#5C5046" />
          </TouchableOpacity>

          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Floating Bottom Quick Action Bar inside Details Modal */}
        <View style={styles.bottomFloatingBar}>
          <TouchableOpacity
            style={[styles.floatingActionBtn, styles.floatingPassBtn]}
            onPress={() => {
              onClose();
              onPass();
            }}
            activeOpacity={0.8}
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
          >
            <Feather name="heart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE5DB',
    backgroundColor: '#FAF7F2',
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
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerBigName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1815',
  },
  genderTag: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  genderTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C5046',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D5B',
  },
  nicknameText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#7A6E63',
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  sectionTitleRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A3F35',
  },
  lookingForBigText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1815',
    lineHeight: 22,
    marginBottom: 6,
  },
  bioSubText: {
    fontSize: 13,
    color: '#5C5046',
    lineHeight: 19,
  },
  petCardsList: {
    gap: 10,
    marginTop: 4,
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
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#EBE4D8',
  },
  petTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  emptyPetText: {
    fontSize: 13,
    color: '#7A6E63',
    fontStyle: 'italic',
  },
  viewOwnerProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0EBE3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewOwnerProfileBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C2520',
  },
  ownerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  ownerMetaText: {
    fontSize: 13,
    color: '#5C5046',
    fontWeight: '600',
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  lifestyleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F6F2EC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
  },
  lifestyleChipText: {
    fontSize: 12,
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
  shareBannerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    zIndex: 10,
  },
  floatingActionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
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

