import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, MAX_FREE_PETS } from '../context/MobilePawtyContext';
import { MobilePet } from '../data/mobileSeedData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MOMENT_ITEM_SIZE = Math.floor((SCREEN_WIDTH - 32 - 12) / 2);

export const MobileProfileScreen: React.FC = () => {
  const {
    theme,
    ownerName,
    ownerHandle,
    ownerBio,
    ownerArea,
    ownerNoteBubble,
    pets,
    activePetId,
    setActivePetId,
    addNewPetProfile,
    deletePetProfile,
    togglePetVaccinationAndRabies,
    posts,
    isVip,
    activeVipPlanId,
    openLightboxMedia,
    setActiveModal,
  } = useMobilePawty();

  const [isAddingPetInline, setIsAddingPetInline] = useState(false);

  // Inline Add Pet Form State (Free up to 3 pets)
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'Chó' | 'Mèo'>('Chó');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('6.5');
  const [newPetAge, setNewPetAge] = useState('1 tuổi');

  const myPosts = posts.filter((p) => p.authorHandle === ownerHandle);
  const displayPosts = myPosts.length > 0 ? myPosts : posts.slice(0, 4);

  // Active pet details
  const activePet: MobilePet =
    pets.find((p) => p.id === activePetId) || pets[0] || ({} as MobilePet);

  const ownerAvatarUrl =
    activePet?.avatarUrl ||
    pets[0]?.avatarUrl ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

  const handleDeletePetConfirm = (pet: MobilePet) => {
    if (pets.length <= 1) {
      Alert.alert(
        'Không thể xóa',
        'Tài khoản cần giữ lại ít nhất 1 hồ sơ thú cưng.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa thú cưng',
      `Bạn có chắc chắn muốn xóa hồ sơ bé ${pet.name}? Mọi dữ liệu về sổ tiêm của bé sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bé',
          style: 'destructive',
          onPress: () => deletePetProfile(pet.id),
        },
      ]
    );
  };

  const handleSaveNewPet = () => {
    if (!newPetName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho bé thú cưng.');
      return;
    }

    addNewPetProfile({
      name: newPetName.trim(),
      species: newPetSpecies,
      breed: newPetBreed.trim() || (newPetSpecies === 'Chó' ? 'Poodle' : 'Mèo Anh Lông Ngắn'),
      weightKg: parseFloat(newPetWeight) || 5.0,
      ageLabel: newPetAge.trim() || '1 tuổi',
    });

    setNewPetName('');
    setNewPetBreed('');
    setNewPetWeight('6.5');
    setNewPetAge('1 tuổi');
    setIsAddingPetInline(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#FAF8F5' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. PET PARENT HERO CARD (GIA ĐÌNH SEN & BOSS - THIẾT KẾ ĐỘC BẢN) */}
      <View style={styles.parentCard}>
        {/* Floating Note Bubble */}
        <TouchableOpacity
          style={styles.noteBubbleWrap}
          onPress={() => setActiveModal('edit_profile')}
          activeOpacity={0.85}
        >
          <View style={styles.noteBubble}>
            <Text style={styles.noteBubbleIcon}>💬</Text>
            <Text style={styles.noteBubbleText} numberOfLines={1}>
              {ownerNoteBubble || 'Cùng Boss dạo mát mỗi chiều...'}
            </Text>
          </View>
          <View style={styles.noteBubbleTail} />
        </TouchableOpacity>

        {/* Profile Info Header */}
        <View style={styles.parentHeaderRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setActiveModal('edit_profile')}
            activeOpacity={0.85}
          >
            <Image source={{ uri: ownerAvatarUrl }} style={styles.parentAvatar} />
            <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
              <Feather name="heart" size={11} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.parentInfoCol}>
            <View style={styles.parentNameRow}>
              <Text style={styles.parentNameText}>{ownerName}</Text>
              {isVip && (
                <View style={[styles.vipBadge, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="award" size={11} color={theme.primary} />
                  <Text style={[styles.vipBadgeText, { color: theme.primary }]}>
                    {activeVipPlanId === 'vip_gold' ? 'GOLD' : 'PLUS'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.parentHandleText}>{ownerHandle}</Text>

            <View style={styles.parentMetaRow}>
              <View style={styles.parentMetaItem}>
                <Feather name="map-pin" size={12} color="#7E6E60" />
                <Text style={styles.parentMetaText}>{ownerArea || 'Hồ Chí Minh'}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.parentMetaItem}>
                <Feather name="shield" size={12} color="#2D8A68" />
                <Text style={[styles.parentMetaText, { color: '#2D8A68' }]}>
                  Đã xác minh
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio Text */}
        {ownerBio ? (
          <Text style={styles.parentBioText}>{ownerBio}</Text>
        ) : null}

        {/* Single Main Action Button: Chỉnh sửa thông tin Sen & Boss */}
        <TouchableOpacity
          style={[styles.editInfoBtn, { backgroundColor: '#F4EFEB' }]}
          onPress={() => setActiveModal('edit_profile')}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={14} color="#332B25" />
          <Text style={styles.editInfoBtnText}>Chỉnh sửa thông tin Sen & Boss</Text>
        </TouchableOpacity>
      </View>

      {/* 2. PET PASSPORT SHOWCASE (HỒ SƠ THÚ CƯNG CHUYÊN SÂU - TRỌNG TÂM CỦA TRANG TÔI) */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithCount}>
          <Text style={styles.sectionTitle}>🐾 Hồ sơ Thú cưng</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {pets.length}/{MAX_FREE_PETS} bé
            </Text>
          </View>
        </View>

        {pets.length < MAX_FREE_PETS && (
          <TouchableOpacity
            style={[styles.addPetTopBtn, { backgroundColor: theme.primary }]}
            onPress={() => setIsAddingPetInline(!isAddingPetInline)}
            activeOpacity={0.85}
          >
            <Feather
              name={isAddingPetInline ? 'x' : 'plus'}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.addPetTopBtnText}>
              {isAddingPetInline ? 'Đóng form' : 'Thêm bé'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pet Selector Horizontal Bar */}
      <View style={styles.petSelectorBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petSelectorScroll}
        >
          {pets.map((pet) => {
            const isSelected = pet.id === activePet.id;
            return (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petSelectorChip,
                  isSelected && [
                    styles.petSelectorChipActive,
                    { borderColor: theme.primary, backgroundColor: theme.primarySoft },
                  ],
                ]}
                onPress={() => setActivePetId(pet.id)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: pet.avatarUrl }}
                  style={[
                    styles.petSelectorAvatar,
                    isSelected && { borderColor: theme.primary, borderWidth: 2 },
                  ]}
                />
                <View style={styles.petSelectorChipInfo}>
                  <Text
                    style={[
                      styles.petSelectorName,
                      isSelected && { color: theme.primary, fontWeight: '800' },
                    ]}
                    numberOfLines={1}
                  >
                    {pet.name}
                  </Text>
                  <Text style={styles.petSelectorSpecies}>
                    {pet.species === 'Chó' ? '🐶 Cún' : '🐱 Mèo'}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.selectedCheckDot, { backgroundColor: theme.primary }]}>
                    <Feather name="check" size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Inline Add Pet Form */}
      {isAddingPetInline && (
        <View style={styles.inlineAddCard}>
          <View style={styles.inlineAddHeader}>
            <Text style={styles.inlineAddTitle}>
              Thêm bé cưng mới ({pets.length + 1}/{MAX_FREE_PETS})
            </Text>
            <Text style={styles.inlineAddSub}>
              Hoàn toàn miễn phí, có sổ tiêm riêng cho từng bé
            </Text>
          </View>

          {/* Species Choice */}
          <View style={styles.speciesRow}>
            <TouchableOpacity
              style={[
                styles.speciesChoiceBtn,
                newPetSpecies === 'Chó' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setNewPetSpecies('Chó')}
            >
              <Text style={styles.speciesChoiceIcon}>🐶</Text>
              <Text
                style={[
                  styles.speciesChoiceText,
                  newPetSpecies === 'Chó' && { color: '#FFFFFF' },
                ]}
              >
                Loài Chó
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.speciesChoiceBtn,
                newPetSpecies === 'Mèo' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setNewPetSpecies('Mèo')}
            >
              <Text style={styles.speciesChoiceIcon}>🐱</Text>
              <Text
                style={[
                  styles.speciesChoiceText,
                  newPetSpecies === 'Mèo' && { color: '#FFFFFF' },
                ]}
              >
                Loài Mèo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <View style={styles.formRow}>
            <TextInput
              style={[styles.formInput, { flex: 1 }]}
              placeholder="Tên bé (VD: Coca, Miu)"
              placeholderTextColor="#A89E94"
              value={newPetName}
              onChangeText={setNewPetName}
            />
            <TextInput
              style={[styles.formInput, { width: 105 }]}
              placeholder="Cân nặng (kg)"
              placeholderTextColor="#A89E94"
              keyboardType="decimal-pad"
              value={newPetWeight}
              onChangeText={setNewPetWeight}
            />
          </View>

          <View style={styles.formRow}>
            <TextInput
              style={[styles.formInput, { flex: 1 }]}
              placeholder="Giống loài (VD: Poodle, Mèo Ta)"
              placeholderTextColor="#A89E94"
              value={newPetBreed}
              onChangeText={setNewPetBreed}
            />
            <TextInput
              style={[styles.formInput, { width: 105 }]}
              placeholder="Tuổi (VD: 1 tuổi)"
              placeholderTextColor="#A89E94"
              value={newPetAge}
              onChangeText={setNewPetAge}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveNewPetBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveNewPet}
            activeOpacity={0.85}
          >
            <Feather name="check" size={16} color="#FFFFFF" />
            <Text style={styles.saveNewPetBtnText}>Lưu hồ sơ bé mới</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIVE PET PASSPORT CARD */}
      {activePet && activePet.id ? (
        <View style={styles.passportCard}>
          {/* Pet Top Visual Banner */}
          <View style={styles.passportImageWrap}>
            <Image
              source={{ uri: activePet.avatarUrl }}
              style={styles.passportImage}
            />
            <View style={styles.passportOverlay}>
              <View style={styles.passportBadgeLeft}>
                <Text style={styles.passportSpeciesPill}>
                  {activePet.species === 'Chó' ? '🐶 Chó' : '🐱 Mèo'} · {activePet.breed}
                </Text>
              </View>
              <View style={styles.passportBadgeRight}>
                <Text style={styles.passportGenderPill}>
                  {activePet.gender === 'Đực' ? '♂ Đực' : '♀ Cái'}
                </Text>
              </View>
            </View>
          </View>

          {/* Pet Details Section */}
          <View style={styles.passportBody}>
            {/* Name & Age */}
            <View style={styles.petNameRow}>
              <View>
                <Text style={styles.passportPetName}>{activePet.name}</Text>
                <Text style={styles.passportSubText}>
                  {activePet.breed} · {activePet.ageLabel || '1 tuổi'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.quickEditPetBtn, { backgroundColor: '#F5EFE9' }]}
                onPress={() => {
                  setActivePetId(activePet.id);
                  setActiveModal('edit_profile');
                }}
                activeOpacity={0.8}
              >
                <Feather name="edit-3" size={13} color="#4A3F35" />
                <Text style={styles.quickEditPetBtnText}>Sửa</Text>
              </TouchableOpacity>
            </View>

            {/* 3 Metric Mini Cards */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Feather name="activity" size={14} color="#7E6E60" />
                <Text style={styles.metricNum}>{activePet.weightKg} kg</Text>
                <Text style={styles.metricLabel}>Cân nặng</Text>
              </View>

              <View style={styles.metricCard}>
                <Feather name="calendar" size={14} color="#7E6E60" />
                <Text style={styles.metricNum}>{activePet.ageLabel || '1 tuổi'}</Text>
                <Text style={styles.metricLabel}>Tuổi đời</Text>
              </View>

              <View style={styles.metricCard}>
                <Feather name="award" size={14} color="#7E6E60" />
                <Text style={styles.metricNum}>{activePet.furColor || 'Vàng kem'}</Text>
                <Text style={styles.metricLabel}>Màu lông</Text>
              </View>
            </View>

            {/* SỔ TIÊM CHỦNG SAFE PET (MINT CARD) */}
            <TouchableOpacity
              style={[
                styles.vaccineCard,
                activePet.isVaccinatedAndRabies
                  ? styles.vaccineCardGood
                  : styles.vaccineCardWarn,
              ]}
              onPress={() => togglePetVaccinationAndRabies(activePet.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.vaccineIconBox,
                  {
                    backgroundColor: activePet.isVaccinatedAndRabies
                      ? '#D5F3EB'
                      : '#FDEAE5',
                  },
                ]}
              >
                <Feather
                  name={
                    activePet.isVaccinatedAndRabies
                      ? 'check-circle'
                      : 'alert-triangle'
                  }
                  size={18}
                  color={
                    activePet.isVaccinatedAndRabies ? '#1D7A5C' : '#D05139'
                  }
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.vaccineHeaderLine}>
                  <Text style={styles.vaccineTitle}>
                    {activePet.isVaccinatedAndRabies
                      ? 'Chứng nhận An toàn Safe Pet'
                      : 'Cần cập nhật sổ tiêm chủng'}
                  </Text>
                  <Text
                    style={[
                      styles.vaccineActionHint,
                      {
                        color: activePet.isVaccinatedAndRabies
                          ? '#1D7A5C'
                          : '#D05139',
                      },
                    ]}
                  >
                    Chạm để đổi
                  </Text>
                </View>
                <Text style={styles.vaccineSub}>
                  {activePet.isVaccinatedAndRabies
                    ? 'Đã tiêm vắc-xin 7 bệnh và phòng dại định kỳ đầy đủ'
                    : 'Chưa có xác nhận tiêm phòng dại hoặc vắc-xin 7 bệnh'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* BEHAVIOR & HABITS (PHÒNG TRÁNH XUNG ĐỘT KHI ĐI DẠO) */}
            <View style={styles.habitsSection}>
              <Text style={styles.habitsTitle}>
                Thói quen & Lưu ý khi gặp gỡ
              </Text>
              <View style={styles.chipsWrap}>
                {(activePet.goodHabits || ['Thân thiện', 'Thích đi dạo']).map(
                  (habit, idx) => (
                    <View key={`good-${idx}`} style={styles.goodChip}>
                      <Feather name="smile" size={11} color="#217B5D" />
                      <Text style={styles.goodChipText}>{habit}</Text>
                    </View>
                  )
                )}
                {(activePet.cautionHabits || ['Hơi sợ xe máy']).map(
                  (habit, idx) => (
                    <View key={`caution-${idx}`} style={styles.cautionChip}>
                      <Feather name="alert-circle" size={11} color="#B85D38" />
                      <Text style={styles.cautionChipText}>{habit}</Text>
                    </View>
                  )
                )}
              </View>

              {activePet.bio ? (
                <Text style={styles.petBioNoteText}>
                  "{activePet.bio}"
                </Text>
              ) : null}
            </View>

            {/* PET ACTIONS FOOTER */}
            <View style={styles.petActionButtonsRow}>
              <TouchableOpacity
                style={[styles.petEditFullBtn, { backgroundColor: theme.primarySoft }]}
                onPress={() => {
                  setActivePetId(activePet.id);
                  setActiveModal('edit_profile');
                }}
                activeOpacity={0.85}
              >
                <Feather name="edit" size={14} color={theme.primary} />
                <Text style={[styles.petEditFullBtnText, { color: theme.primary }]}>
                  Chỉnh sửa hồ sơ bé {activePet.name}
                </Text>
              </TouchableOpacity>

              {pets.length > 1 && (
                <TouchableOpacity
                  style={styles.petDeleteFullBtn}
                  onPress={() => handleDeletePetConfirm(activePet)}
                  activeOpacity={0.85}
                >
                  <Feather name="trash-2" size={14} color="#C9382B" />
                  <Text style={styles.petDeleteFullBtnText}>Xóa bé</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : null}

      {/* 3. FURRY FAMILY MOMENTS (NHẬT KÝ KHOẢNH KHẮC) */}
      <View style={styles.momentsSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithCount}>
            <Text style={styles.sectionTitle}>📸 Khoảnh khắc gia đình</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{myPosts.length} bài</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addMomentBtn, { borderColor: theme.border }]}
            onPress={() => setActiveModal('new_moment')}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={13} color="#332B25" />
            <Text style={styles.addMomentBtnText}>Đăng mới</Text>
          </TouchableOpacity>
        </View>

        {displayPosts.length > 0 ? (
          <View style={styles.momentsGrid}>
            {displayPosts.map((post) => {
              const urls = post.mediaUrls || [];
              const firstImg = urls[0] || activePet?.avatarUrl;
              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.momentCell}
                  activeOpacity={0.9}
                  onPress={() =>
                    openLightboxMedia({
                      postId: post.id,
                      mediaUrls: urls,
                      initialIndex: 0,
                      mediaType: post.mediaType,
                      videoDuration: post.videoDuration,
                      caption: post.content,
                      authorName: post.authorName,
                    })
                  }
                >
                  <Image source={{ uri: firstImg }} style={styles.momentImg} />
                  {urls.length > 1 && (
                    <View style={styles.momentBadge}>
                      <Feather name="layers" size={11} color="#FFFFFF" />
                      <Text style={styles.momentBadgeText}>{urls.length}</Text>
                    </View>
                  )}
                  {post.mediaType === 'video' && (
                    <View style={styles.momentBadge}>
                      <Feather name="play" size={11} color="#FFFFFF" />
                    </View>
                  )}
                  {post.reactions ? (
                    <View style={styles.momentLikesPill}>
                      <Feather name="heart" size={10} color="#FF6F61" />
                      <Text style={styles.momentLikesText}>
                        {post.reactions.love + post.reactions.paws}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyMomentsCard}>
            <Text style={styles.emptyMomentsIcon}>📸</Text>
            <Text style={styles.emptyMomentsTitle}>Chưa có khoảnh khắc nào</Text>
            <Text style={styles.emptyMomentsSub}>
              Hãy chụp ảnh dắt dạo cùng Boss và lưu lại những kỷ niệm đáng yêu!
            </Text>
            <TouchableOpacity
              style={[styles.emptyShareBtn, { backgroundColor: theme.primary }]}
              onPress={() => setActiveModal('new_moment')}
            >
              <Feather name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.emptyShareBtnText}>Chia sẻ khoảnh khắc đầu tiên</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* 1. Pet Parent Hero Card */
  parentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEAE3',
    marginBottom: 20,
    shadowColor: '#1C1815',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  noteBubbleWrap: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginLeft: 4,
  },
  noteBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF6F0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E8E1D7',
  },
  noteBubbleIcon: {
    fontSize: 12,
  },
  noteBubbleText: {
    fontSize: 11,
    color: '#5C5046',
    fontWeight: '600',
  },
  noteBubbleTail: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    marginLeft: 18,
    marginTop: -3,
  },
  parentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  parentAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#FAF7F2',
    backgroundColor: '#EFEBE4',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  parentInfoCol: {
    flex: 1,
    gap: 3,
  },
  parentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  parentNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1815',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  vipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  parentHandleText: {
    fontSize: 13,
    color: '#8A7D71',
    fontWeight: '600',
  },
  parentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  parentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  parentMetaText: {
    fontSize: 12,
    color: '#7E6E60',
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C8BEB3',
  },
  parentBioText: {
    fontSize: 13,
    color: '#4A3F35',
    lineHeight: 18,
    marginTop: 10,
  },
  editInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 14,
    marginTop: 14,
  },
  editInfoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#332B25',
  },

  /* 2. Section Headers */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1815',
  },
  countBadge: {
    backgroundColor: '#EFEBE4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C5046',
  },
  addPetTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addPetTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Pet Selector Horizontal Bar */
  petSelectorBar: {
    marginBottom: 14,
  },
  petSelectorScroll: {
    gap: 10,
  },
  petSelectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEBE4',
  },
  petSelectorChipActive: {
    borderWidth: 1.5,
  },
  petSelectorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFEBE4',
  },
  petSelectorChipInfo: {
    justifyContent: 'center',
  },
  petSelectorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C231D',
    maxWidth: 80,
  },
  petSelectorSpecies: {
    fontSize: 10,
    color: '#8A7D71',
    fontWeight: '500',
  },
  selectedCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },

  /* Inline Add Pet Form */
  inlineAddCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F0E7DC',
    marginBottom: 16,
    gap: 10,
  },
  inlineAddHeader: {
    marginBottom: 2,
  },
  inlineAddTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1815',
  },
  inlineAddSub: {
    fontSize: 12,
    color: '#8A7D71',
    marginTop: 2,
  },
  speciesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  speciesChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F7F3EE',
    borderWidth: 1,
    borderColor: '#E8E1D7',
  },
  speciesChoiceIcon: {
    fontSize: 14,
  },
  speciesChoiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formInput: {
    height: 40,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1C1815',
  },
  saveNewPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 14,
    marginTop: 4,
  },
  saveNewPetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Active Pet Passport Card */
  passportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EFEAE3',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#1C1815',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  passportImageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#EFEBE4',
  },
  passportImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  passportOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passportBadgeLeft: {
    backgroundColor: 'rgba(28, 24, 21, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  passportSpeciesPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passportBadgeRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  passportGenderPill: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1815',
  },
  passportBody: {
    padding: 16,
    gap: 14,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passportPetName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1815',
  },
  passportSubText: {
    fontSize: 12,
    color: '#7E6E60',
    fontWeight: '600',
    marginTop: 2,
  },
  quickEditPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickEditPetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
  },

  /* 3 Metric Mini Cards */
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#EFEBE4',
  },
  metricNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1815',
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#8A7D71',
    fontWeight: '600',
  },

  /* Safe Pet Vaccine Card */
  vaccineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  vaccineCardGood: {
    backgroundColor: '#F0FAF6',
    borderColor: '#C6EFE1',
  },
  vaccineCardWarn: {
    backgroundColor: '#FEF5F2',
    borderColor: '#FBD4CA',
  },
  vaccineIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaccineHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vaccineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1815',
  },
  vaccineActionHint: {
    fontSize: 10,
    fontWeight: '800',
  },
  vaccineSub: {
    fontSize: 11,
    color: '#5C5046',
    lineHeight: 15,
    marginTop: 2,
  },

  /* Habits and Behaviors */
  habitsSection: {
    gap: 6,
  },
  habitsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C5046',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  goodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goodChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#217B5D',
  },
  cautionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF0E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cautionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B85D38',
  },
  petBioNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6E6257',
    marginTop: 4,
    lineHeight: 16,
  },

  /* Pet Action Footer */
  petActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  petEditFullBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 14,
  },
  petEditFullBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  petDeleteFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
  },
  petDeleteFullBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C9382B',
  },

  /* 3. Furry Family Moments */
  momentsSection: {
    marginTop: 4,
  },
  addMomentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  addMomentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#332B25',
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  momentCell: {
    width: MOMENT_ITEM_SIZE,
    height: MOMENT_ITEM_SIZE * 1.15,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EFEBE4',
    position: 'relative',
  },
  momentImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  momentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(28, 24, 21, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  momentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  momentLikesPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  momentLikesText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1815',
  },
  emptyMomentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE3',
    marginTop: 8,
    gap: 6,
  },
  emptyMomentsIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyMomentsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1815',
  },
  emptyMomentsSub: {
    fontSize: 12,
    color: '#8A7D71',
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyShareBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
