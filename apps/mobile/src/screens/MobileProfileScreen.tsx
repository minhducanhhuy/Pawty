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
const MOMENT_CARD_SIZE = Math.floor((SCREEN_WIDTH - 32 - 12) / 2);

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80';

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

  // 3 Profile Tabs directly inspired by Sample Image 1: 'pets' (Hồ sơ Boss) | 'media' (Khoảnh khắc) | 'vaccine' (Sổ tiêm)
  const [activeTab, setActiveTab] = useState<'pets' | 'media' | 'vaccine'>('pets');
  const [isAddingPetInline, setIsAddingPetInline] = useState(false);

  // Inline Add Pet Form State (Free up to 3 pets)
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'Chó' | 'Mèo'>('Chó');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('6.5');
  const [newPetAge, setNewPetAge] = useState('1 tuổi');

  const myPosts = posts.filter((p) => p.authorHandle === ownerHandle);
  const displayPosts = myPosts.length > 0 ? myPosts : posts.slice(0, 6);

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
      breed:
        newPetBreed.trim() ||
        (newPetSpecies === 'Chó' ? 'Poodle' : 'Mèo Anh Lông Ngắn'),
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
      style={[styles.container, { backgroundColor: '#F6F9F8' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* =========================================================================
          1. HERO COVER & PROFILE IDENTITY (TỔNG HÒA INSPIRATION TỪ HÌNH 1 & HÌNH 2)
          ========================================================================= */}
      <View style={styles.heroSection}>
        {/* Cover Photo */}
        <View style={styles.coverWrap}>
          <Image source={{ uri: DEFAULT_COVER }} style={styles.coverImage} />
          <View style={styles.coverGradientOverlay} />
        </View>

        {/* Floating Center Avatar with Glowing Ring (Directly from Sample Image 1) */}
        <View style={styles.avatarRow}>
          {/* Note Bubble (Left balanced) */}
          <TouchableOpacity
            style={styles.floatingBubble}
            onPress={() => setActiveModal('edit_profile')}
            activeOpacity={0.85}
          >
            <Text style={styles.floatingBubbleIcon}>💬</Text>
            <Text style={styles.floatingBubbleText} numberOfLines={1}>
              {ownerNoteBubble || 'Dắt Boss dạo mát'}
            </Text>
          </TouchableOpacity>

          {/* Centered Large Avatar */}
          <TouchableOpacity
            style={styles.avatarCenterBtn}
            onPress={() => setActiveModal('edit_profile')}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: ownerAvatarUrl }}
              style={[styles.avatarImg, { borderColor: theme.primary }]}
            />
            <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
              <Feather name="heart" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Edit Profile Pill Button on Right (Directly from Sample Image 1) */}
          <TouchableOpacity
            style={[styles.editProfilePillBtn, { backgroundColor: '#134E4A' }]}
            onPress={() => setActiveModal('edit_profile')}
            activeOpacity={0.85}
          >
            <Feather name="edit-2" size={12} color="#FFFFFF" />
            <Text style={styles.editProfilePillText}>Sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Centered Name, Role and Location (From Sample Image 1 & 2) */}
        <View style={styles.ownerIdentityBlock}>
          <View style={styles.ownerNameLine}>
            <Text style={styles.ownerNameTitle}>{ownerName}</Text>
            {isVip && (
              <View style={[styles.vipPillBadge, { backgroundColor: theme.primarySoft }]}>
                <Feather name="award" size={11} color={theme.primary} />
                <Text style={[styles.vipPillText, { color: theme.primary }]}>
                  {activeVipPlanId === 'vip_gold' ? 'GOLD' : 'PLUS'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.ownerRoleSub}>
            Sen cưng của {pets.map((p) => p.name).join(' & ')} · Yêu thú cưng
          </Text>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color="#E11D48" />
            <Text style={styles.locationText}>{ownerArea || 'Hồ Chí Minh, Việt Nam'}</Text>
          </View>

          {ownerBio ? (
            <Text style={styles.ownerBioParagraph}>{ownerBio}</Text>
          ) : null}
        </View>

        {/* Floating White Card with 3 Key Stats (Directly from Sample Image 2) */}
        <View style={styles.statsCardWrapper}>
          <View style={styles.statsCard}>
            <TouchableOpacity
              style={styles.statColumn}
              onPress={() => setActiveTab('pets')}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>{pets.length}</Text>
              <Text style={styles.statLabel}>Thú cưng</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statColumn}
              onPress={() => setActiveTab('media')}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>{myPosts.length}</Text>
              <Text style={styles.statLabel}>Khoảnh khắc</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statColumn}
              onPress={() => setActiveTab('vaccine')}
              activeOpacity={0.7}
            >
              <View style={styles.safePetStatRow}>
                <Feather name="shield" size={15} color="#0D9488" />
                <Text style={[styles.statNumber, { color: '#0D9488' }]}>Safe Pet</Text>
              </View>
              <Text style={styles.statLabel}>Sổ tiêm chuẩn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================================
          2. TAB NAVIGATION (TOPICS / MEDIA / LIKES TỪ HÌNH 1 ĐƯỢC CHUYỂN HÓA CHO PAWTY)
          ========================================================================= */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'pets' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('pets')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabNavText,
              activeTab === 'pets' && [styles.tabNavTextActive, { color: '#0F766E' }],
            ]}
          >
            🐾 Hồ sơ Boss ({pets.length})
          </Text>
          {activeTab === 'pets' && (
            <View style={[styles.tabActiveIndicator, { backgroundColor: '#0F766E' }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'media' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('media')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabNavText,
              activeTab === 'media' && [styles.tabNavTextActive, { color: '#0F766E' }],
            ]}
          >
            📸 Khoảnh khắc ({displayPosts.length})
          </Text>
          {activeTab === 'media' && (
            <View style={[styles.tabActiveIndicator, { backgroundColor: '#0F766E' }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'vaccine' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('vaccine')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabNavText,
              activeTab === 'vaccine' && [styles.tabNavTextActive, { color: '#0F766E' }],
            ]}
          >
            🩺 Sổ tiêm chủng
          </Text>
          {activeTab === 'vaccine' && (
            <View style={[styles.tabActiveIndicator, { backgroundColor: '#0F766E' }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          3. TAB 1: HỒ SƠ BOSS (TÍCH HỢP TỪ HÌNH 2 MY PLANTS CARDS & HÌNH 3 PET PASSPORT)
          ========================================================================= */}
      {activeTab === 'pets' && (
        <View style={styles.petsSectionContainer}>
          {/* Header Row: Title & Add Pet Button */}
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingTitle}>Danh sách Boss cưng</Text>
            {pets.length < MAX_FREE_PETS && (
              <TouchableOpacity
                style={[styles.addPetActionBtn, { backgroundColor: '#0F766E' }]}
                onPress={() => setIsAddingPetInline(!isAddingPetInline)}
                activeOpacity={0.85}
              >
                <Feather
                  name={isAddingPetInline ? 'x' : 'plus'}
                  size={13}
                  color="#FFFFFF"
                />
                <Text style={styles.addPetActionBtnText}>
                  {isAddingPetInline ? 'Đóng form' : '+ Thêm bé'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Horizontal Pet Cards Carousel (Directly from Sample Image 2 "My Plants") */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petCardsCarousel}
          >
            {pets.map((pet) => {
              const isSelected = pet.id === activePet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCarouselCard,
                    isSelected && [
                      styles.petCarouselCardActive,
                      { borderColor: '#0D9488', backgroundColor: '#F0FDF4' },
                    ],
                  ]}
                  onPress={() => setActivePetId(pet.id)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: pet.avatarUrl }} style={styles.petCardThumb} />
                  <Text style={styles.petCardThumbName} numberOfLines={1}>
                    {pet.name}
                  </Text>
                  <Text style={styles.petCardThumbBreed} numberOfLines={1}>
                    {pet.breed}
                  </Text>
                  {isSelected && (
                    <View style={styles.petCardActiveBadge}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Inline Add Pet Form (when toggled) */}
          {isAddingPetInline && (
            <View style={styles.inlineAddPetContainer}>
              <Text style={styles.inlineFormTitle}>
                Thêm thành viên mới ({pets.length + 1}/{MAX_FREE_PETS})
              </Text>
              <Text style={styles.inlineFormSubtitle}>
                Mỗi tài khoản được quản lý miễn phí tối đa 3 thú cưng
              </Text>

              {/* Species Toggle */}
              <View style={styles.speciesToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.speciesToggleBtn,
                    newPetSpecies === 'Chó' && {
                      backgroundColor: '#0F766E',
                      borderColor: '#0F766E',
                    },
                  ]}
                  onPress={() => setNewPetSpecies('Chó')}
                >
                  <Text style={styles.speciesToggleEmoji}>🐶</Text>
                  <Text
                    style={[
                      styles.speciesToggleLabel,
                      newPetSpecies === 'Chó' && { color: '#FFFFFF' },
                    ]}
                  >
                    Loài Chó
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.speciesToggleBtn,
                    newPetSpecies === 'Mèo' && {
                      backgroundColor: '#0F766E',
                      borderColor: '#0F766E',
                    },
                  ]}
                  onPress={() => setNewPetSpecies('Mèo')}
                >
                  <Text style={styles.speciesToggleEmoji}>🐱</Text>
                  <Text
                    style={[
                      styles.speciesToggleLabel,
                      newPetSpecies === 'Mèo' && { color: '#FFFFFF' },
                    ]}
                  >
                    Loài Mèo
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Input Rows */}
              <View style={styles.formInputGrid}>
                <TextInput
                  style={[styles.formTextInput, { flex: 1 }]}
                  placeholder="Tên bé (VD: Lu, Coca)"
                  placeholderTextColor="#94A3B8"
                  value={newPetName}
                  onChangeText={setNewPetName}
                />
                <TextInput
                  style={[styles.formTextInput, { width: 105 }]}
                  placeholder="Kg (VD: 6.5)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={newPetWeight}
                  onChangeText={setNewPetWeight}
                />
              </View>

              <View style={styles.formInputGrid}>
                <TextInput
                  style={[styles.formTextInput, { flex: 1 }]}
                  placeholder="Giống loài (VD: Poodle, Golden)"
                  placeholderTextColor="#94A3B8"
                  value={newPetBreed}
                  onChangeText={setNewPetBreed}
                />
                <TextInput
                  style={[styles.formTextInput, { width: 105 }]}
                  placeholder="Tuổi (1 tuổi)"
                  placeholderTextColor="#94A3B8"
                  value={newPetAge}
                  onChangeText={setNewPetAge}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveNewPetButton, { backgroundColor: '#0F766E' }]}
                onPress={handleSaveNewPet}
                activeOpacity={0.85}
              >
                <Feather name="check" size={15} color="#FFFFFF" />
                <Text style={styles.saveNewPetButtonText}>Lưu hồ sơ bé mới</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DETAILED PET PASSPORT CARD (THIẾT KẾ ĐỘC BẢN TỪ HÌNH 3) */}
          {activePet && activePet.id ? (
            <View style={styles.petPassportHeroCard}>
              {/* Pet Large Visual Banner with curved background tint */}
              <View style={styles.passportHeroBanner}>
                <Image
                  source={{ uri: activePet.avatarUrl }}
                  style={styles.passportHeroImage}
                />
                <View style={styles.passportHeroOverlay}>
                  <View style={styles.passportSpeciesTag}>
                    <Text style={styles.passportSpeciesTagText}>
                      {activePet.species === 'Chó' ? '🐶 Chó' : '🐱 Mèo'} · {activePet.breed}
                    </Text>
                  </View>
                  <View style={styles.passportDistanceTag}>
                    <Feather name="map-pin" size={11} color="#0F766E" />
                    <Text style={styles.passportDistanceTagText}>
                      {ownerArea || 'Gần bạn'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Pet Details Card Body */}
              <View style={styles.passportDetailsBody}>
                {/* Pet Name & Paw Icon (Directly from Sample Image 3) */}
                <View style={styles.petTitleRow}>
                  <View>
                    <View style={styles.nameAndPawInline}>
                      <Text style={styles.passportPetNameText}>{activePet.name}</Text>
                      <Text style={styles.passportPawEmoji}>🐾</Text>
                    </View>
                    <Text style={styles.passportBreedSubtitle}>
                      {activePet.breed} · {activePet.ageLabel || '1 tuổi'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editThisPetBtn}
                    onPress={() => {
                      setActivePetId(activePet.id);
                      setActiveModal('edit_profile');
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="edit-3" size={13} color="#0F766E" />
                    <Text style={styles.editThisPetBtnText}>Sửa</Text>
                  </TouchableOpacity>
                </View>

                {/* 3 ROUNDED ATTRIBUTE PILLS (DIRECTLY FROM SAMPLE IMAGE 3: Sex | Age | Weight) */}
                <View style={styles.attributePillsRow}>
                  <View style={styles.attributePillItem}>
                    <Text style={styles.attributePillLabel}>Sex / Giới tính</Text>
                    <Text style={styles.attributePillValue}>
                      {activePet.gender === 'Đực' ? 'Đực ♂' : 'Cái ♀'}
                    </Text>
                  </View>

                  <View style={styles.attributePillItem}>
                    <Text style={styles.attributePillLabel}>Age / Tuổi</Text>
                    <Text style={styles.attributePillValue}>
                      {activePet.ageLabel || '1 tuổi'}
                    </Text>
                  </View>

                  <View style={styles.attributePillItem}>
                    <Text style={styles.attributePillLabel}>Weight / Cân nặng</Text>
                    <Text style={styles.attributePillValue}>
                      {activePet.weightKg} kg
                    </Text>
                  </View>
                </View>

                {/* SAFE PET VACCINE BADGE (CERTIFICATE) */}
                <TouchableOpacity
                  style={[
                    styles.vaccineCertCard,
                    activePet.isVaccinatedAndRabies
                      ? styles.vaccineCertGood
                      : styles.vaccineCertWarn,
                  ]}
                  onPress={() => togglePetVaccinationAndRabies(activePet.id)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.vaccineIconCircle,
                      {
                        backgroundColor: activePet.isVaccinatedAndRabies
                          ? '#CCFBF1'
                          : '#FFE4E6',
                      },
                    ]}
                  >
                    <Feather
                      name={
                        activePet.isVaccinatedAndRabies
                          ? 'shield'
                          : 'alert-triangle'
                      }
                      size={18}
                      color={
                        activePet.isVaccinatedAndRabies ? '#0F766E' : '#E11D48'
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.vaccineTitleLine}>
                      <Text style={styles.vaccineTitleText}>
                        {activePet.isVaccinatedAndRabies
                          ? 'Chứng nhận An Toàn Safe Pet'
                          : 'Chưa đủ chứng nhận tiêm chủng'}
                      </Text>
                      <Text
                        style={[
                          styles.vaccineStatusHint,
                          {
                            color: activePet.isVaccinatedAndRabies
                              ? '#0F766E'
                              : '#E11D48',
                          },
                        ]}
                      >
                        Chạm để đổi
                      </Text>
                    </View>
                    <Text style={styles.vaccineSubText}>
                      {activePet.isVaccinatedAndRabies
                        ? 'Đã tiêm phòng 7 bệnh & Vắc-xin phòng dại định kỳ đầy đủ.'
                        : 'Cần cập nhật sổ tiêm phòng dại để ghép đôi an toàn.'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* FAVORITE HABITS & TREATS CHIPS (DIRECTLY FROM SAMPLE IMAGE 2 "Favorite Plants") */}
                <View style={styles.habitsChipsSection}>
                  <Text style={styles.habitsSectionTitle}>
                    Sở thích & Thói quen dắt dạo
                  </Text>
                  <View style={styles.chipsFlowWrap}>
                    <View style={styles.habitPillChip}>
                      <Text style={styles.habitChipEmoji}>🍖</Text>
                      <Text style={styles.habitChipText}>
                        {activePet.favoriteFood || 'Gan sấy & Pate'}
                      </Text>
                    </View>

                    {(activePet.goodHabits || ['Thân thiện', 'Thích dạo công viên']).map(
                      (h, idx) => (
                        <View key={`good-${idx}`} style={styles.habitPillChip}>
                          <Text style={styles.habitChipEmoji}>🌳</Text>
                          <Text style={styles.habitChipText}>{h}</Text>
                        </View>
                      )
                    )}

                    {(activePet.cautionHabits || ['Hơi sợ tiếng còi xe']).map(
                      (c, idx) => (
                        <View
                          key={`caution-${idx}`}
                          style={[styles.habitPillChip, styles.cautionPillChip]}
                        >
                          <Text style={styles.habitChipEmoji}>⚠️</Text>
                          <Text style={[styles.habitChipText, { color: '#BE123C' }]}>
                            {c}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </View>

                {/* ABOUT / NARRATIVE SECTION (DIRECTLY FROM SAMPLE IMAGE 3 "About:") */}
                <View style={styles.aboutSection}>
                  <Text style={styles.aboutTitle}>About / Giới thiệu tính cách:</Text>
                  <Text style={styles.aboutContent}>
                    {activePet.bio ||
                      'Bé rất thông minh, hoạt bát và ngoan ngoãn. Thích chạy nhảy ngoài bãi cỏ, chia sẻ đồ chơi và hòa đồng với cún nhỏ.'}
                  </Text>
                </View>

                {/* ACTION BUTTONS FOR ACTIVE PET */}
                <View style={styles.petActionRow}>
                  <TouchableOpacity
                    style={[styles.petFullEditBtn, { backgroundColor: '#F0FDFA' }]}
                    onPress={() => {
                      setActivePetId(activePet.id);
                      setActiveModal('edit_profile');
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="edit" size={13} color="#0F766E" />
                    <Text style={styles.petFullEditBtnText}>
                      Chỉnh sửa hồ sơ bé {activePet.name}
                    </Text>
                  </TouchableOpacity>

                  {pets.length > 1 && (
                    <TouchableOpacity
                      style={styles.petDeleteBtn}
                      onPress={() => handleDeletePetConfirm(activePet)}
                      activeOpacity={0.85}
                    >
                      <Feather name="trash-2" size={13} color="#E11D48" />
                      <Text style={styles.petDeleteBtnText}>Xóa bé</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* =========================================================================
          4. TAB 2: KHOẢNH KHẮC & MEDIA (DIRECTLY FROM SAMPLE IMAGE 1 "Media" GRID)
          ========================================================================= */}
      {activeTab === 'media' && (
        <View style={styles.mediaTabSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingTitle}>Nhật ký hình ảnh & video</Text>
            <TouchableOpacity
              style={[styles.addPetActionBtn, { backgroundColor: '#0F766E' }]}
              onPress={() => setActiveModal('new_moment')}
              activeOpacity={0.85}
            >
              <Feather name="camera" size={13} color="#FFFFFF" />
              <Text style={styles.addPetActionBtnText}>+ Đăng bài</Text>
            </TouchableOpacity>
          </View>

          {displayPosts.length > 0 ? (
            <View style={styles.mediaGrid}>
              {displayPosts.map((post) => {
                const urls = post.mediaUrls || [];
                const firstImg = urls[0] || activePet?.avatarUrl;
                const likesCount = post.reactions
                  ? post.reactions.love + post.reactions.paws
                  : 12;

                return (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.mediaCardItem}
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
                    <Image source={{ uri: firstImg }} style={styles.mediaCardImg} />
                    {urls.length > 1 && (
                      <View style={styles.mediaCardBadge}>
                        <Feather name="layers" size={10} color="#FFFFFF" />
                        <Text style={styles.mediaCardBadgeText}>{urls.length}</Text>
                      </View>
                    )}
                    {post.mediaType === 'video' && (
                      <View style={styles.mediaCardBadge}>
                        <Feather name="play" size={10} color="#FFFFFF" />
                      </View>
                    )}
                    <View style={styles.mediaCardLikesOverlay}>
                      <Feather name="heart" size={10} color="#FF6F61" />
                      <Text style={styles.mediaCardLikesText}>{likesCount}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyMediaBox}>
              <Text style={styles.emptyMediaEmoji}>📸</Text>
              <Text style={styles.emptyMediaTitle}>Chưa có khoảnh khắc nào</Text>
              <Text style={styles.emptyMediaSub}>
                Chia sẻ những khoảnh khắc vui đùa thường ngày cùng các Boss cưng!
              </Text>
              <TouchableOpacity
                style={[styles.emptyUploadBtn, { backgroundColor: '#0F766E' }]}
                onPress={() => setActiveModal('new_moment')}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.emptyUploadBtnText}>Chia sẻ khoảnh khắc đầu tiên</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* =========================================================================
          5. TAB 3: SỔ TIÊM CHỦNG ĐIỆN TỬ (SAFE PET HEALTH LEDGER)
          ========================================================================= */}
      {activeTab === 'vaccine' && (
        <View style={styles.vaccineTabSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingTitle}>Sổ tiêm chủng Safe Pet</Text>
            <View style={styles.safeShieldPill}>
              <Feather name="shield" size={12} color="#0D9488" />
              <Text style={styles.safeShieldPillText}>Đạt chuẩn ghép đôi</Text>
            </View>
          </View>

          <View style={styles.vaccineIntroCard}>
            <Text style={styles.vaccineIntroTitle}>
              Chính sách An toàn Thú cưng Đô thị
            </Text>
            <Text style={styles.vaccineIntroDesc}>
              Để đảm bảo an toàn tuyệt đối khi dắt dạo và ghép đôi tại công viên chung cư, mỗi Boss cần có chứng nhận tiêm phòng 7 bệnh và phòng dại định kỳ.
            </Text>
          </View>

          {pets.map((pet) => (
            <View key={`cert-${pet.id}`} style={styles.petCertCard}>
              <View style={styles.petCertTopRow}>
                <Image source={{ uri: pet.avatarUrl }} style={styles.petCertAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.petCertName}>{pet.name}</Text>
                  <Text style={styles.petCertMeta}>
                    {pet.species === 'Chó' ? 'Loài Chó' : 'Loài Mèo'} · {pet.breed} · {pet.weightKg} kg
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.certToggleBtn,
                    pet.isVaccinatedAndRabies
                      ? { backgroundColor: '#CCFBF1' }
                      : { backgroundColor: '#FFE4E6' },
                  ]}
                  onPress={() => togglePetVaccinationAndRabies(pet.id)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={pet.isVaccinatedAndRabies ? 'check-circle' : 'alert-circle'}
                    size={14}
                    color={pet.isVaccinatedAndRabies ? '#0F766E' : '#E11D48'}
                  />
                  <Text
                    style={[
                      styles.certToggleBtnText,
                      {
                        color: pet.isVaccinatedAndRabies ? '#0F766E' : '#E11D48',
                      },
                    ]}
                  >
                    {pet.isVaccinatedAndRabies ? 'Đã xác minh' : 'Chưa xác minh'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.certChecklist}>
                <View style={styles.certItemRow}>
                  <Feather
                    name={pet.isVaccinatedAndRabies ? 'check' : 'x'}
                    size={12}
                    color={pet.isVaccinatedAndRabies ? '#0D9488' : '#94A3B8'}
                  />
                  <Text style={styles.certItemText}>
                    Vắc-xin phòng bệnh dại (Hiệu lực 12 tháng)
                  </Text>
                </View>

                <View style={styles.certItemRow}>
                  <Feather
                    name={pet.isVaccinatedAndRabies ? 'check' : 'x'}
                    size={12}
                    color={pet.isVaccinatedAndRabies ? '#0D9488' : '#94A3B8'}
                  />
                  <Text style={styles.certItemText}>
                    Vắc-xin phòng 5 bệnh / 7 bệnh truyền nhiễm
                  </Text>
                </View>

                <View style={styles.certItemRow}>
                  <Feather
                    name={pet.isVaccinatedAndRabies ? 'check' : 'x'}
                    size={12}
                    color={pet.isVaccinatedAndRabies ? '#0D9488' : '#94A3B8'}
                  />
                  <Text style={styles.certItemText}>
                    Tẩy giun & nhỏ gáy định kỳ (Phòng ve rận)
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },

  /* 1. Hero Cover & Profile Identity */
  heroSection: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  coverWrap: {
    width: '100%',
    height: 155,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradientOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -45,
    zIndex: 10,
  },
  floatingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: 105,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  floatingBubbleIcon: {
    fontSize: 10,
  },
  floatingBubbleText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '700',
  },
  avatarCenterBtn: {
    position: 'relative',
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3.5,
    backgroundColor: '#F1F5F9',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editProfilePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#134E4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  editProfilePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  ownerIdentityBlock: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    gap: 3,
  },
  ownerNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerNameTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  vipPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  vipPillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  ownerRoleSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  ownerBioParagraph: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
    paddingHorizontal: 12,
  },

  /* Floating White Card with 3 Stats */
  statsCardWrapper: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  safePetStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  /* 2. Tab Navigation */
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 14,
  },
  tabNavBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabNavBtnActive: {},
  tabNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabNavTextActive: {
    fontWeight: '900',
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 1.5,
  },

  /* 3. Tab 1: Pets Section */
  petsSectionContainer: {
    paddingHorizontal: 16,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  addPetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
  },
  addPetActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Horizontal Pet Carousel Cards (From Sample Image 2) */
  petCardsCarousel: {
    gap: 10,
    paddingBottom: 4,
    marginBottom: 14,
  },
  petCarouselCard: {
    width: 95,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  petCarouselCardActive: {
    borderWidth: 2,
  },
  petCardThumb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  petCardThumbName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  petCardThumbBreed: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  petCardActiveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Inline Add Pet Form */
  inlineAddPetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CCFBF1',
    marginBottom: 16,
    gap: 10,
  },
  inlineFormTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  inlineFormSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  speciesToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  speciesToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  speciesToggleEmoji: {
    fontSize: 14,
  },
  speciesToggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  formInputGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  formTextInput: {
    height: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#0F172A',
  },
  saveNewPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 12,
    marginTop: 4,
  },
  saveNewPetButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Detailed Pet Passport Hero Card (From Sample Image 3) */
  petPassportHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  passportHeroBanner: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  passportHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  passportHeroOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passportSpeciesTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  passportSpeciesTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passportDistanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  passportDistanceTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },

  passportDetailsBody: {
    padding: 16,
    gap: 14,
  },
  petTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameAndPawInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passportPetNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  passportPawEmoji: {
    fontSize: 18,
  },
  passportBreedSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  editThisPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  editThisPetBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },

  /* 3 Rounded Attribute Pills (Directly from Sample Image 3: Sex | Age | Weight) */
  attributePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attributePillItem: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  attributePillLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  attributePillValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Vaccine Certificate Card */
  vaccineCertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  vaccineCertGood: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  vaccineCertWarn: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  vaccineIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaccineTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vaccineTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  vaccineStatusHint: {
    fontSize: 10,
    fontWeight: '800',
  },
  vaccineSubText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
    marginTop: 2,
  },

  /* Habits Chips (From Sample Image 2) */
  habitsChipsSection: {
    gap: 6,
  },
  habitsSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  chipsFlowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitPillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cautionPillChip: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  habitChipEmoji: {
    fontSize: 11,
  },
  habitChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  /* About / Narrative (From Sample Image 3) */
  aboutSection: {
    gap: 4,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  aboutContent: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  /* Pet Action Footer */
  petActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  petFullEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 12,
  },
  petFullEditBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  petDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
  },
  petDeleteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
  },

  /* 4. Tab 2: Media Grid (From Sample Image 1) */
  mediaTabSection: {
    paddingHorizontal: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaCardItem: {
    width: MOMENT_CARD_SIZE,
    height: MOMENT_CARD_SIZE * 1.15,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  mediaCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mediaCardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mediaCardLikesOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  mediaCardLikesText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyMediaBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 6,
  },
  emptyMediaEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyMediaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyMediaSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyUploadBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* 5. Tab 3: Vaccine Section */
  vaccineTabSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  safeShieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  safeShieldPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  vaccineIntroCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 4,
  },
  vaccineIntroTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  vaccineIntroDesc: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  petCertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  petCertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  petCertAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  petCertName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  petCertMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  certToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  certToggleBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  certChecklist: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  certItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  certItemText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
});
