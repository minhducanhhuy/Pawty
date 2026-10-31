import React, { useRef, useState } from 'react';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, MAX_FREE_PETS } from '../context/MobilePawtyContext';
import { MobilePet } from '../data/mobileSeedData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MOMENT_GRID_SIZE = Math.floor((SCREEN_WIDTH - 32 - 16) / 3);

const OWNER_COVER_URL =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';

export const MobileProfileScreen: React.FC = () => {
  const {
    theme,
    ownerName,
    ownerHandle,
    ownerBio,
    ownerArea,
    ownerNoteBubble,
    pets,
    setActivePetId,
    addNewPetProfile,
    deletePetProfile,
    togglePetVaccinationAndRabies,
    posts,
    openLightboxMedia,
    setActiveModal,
  } = useMobilePawty();

  const horizontalScrollRef = useRef<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Per-pet like state (stores like count and whether current user liked)
  const [petLikes, setPetLikes] = useState<
    Record<string, { count: number; isLiked: boolean }>
  >({
    [pets[0]?.id || 'pet-1']: { count: 148, isLiked: false },
    [pets[1]?.id || 'pet-2']: { count: 96, isLiked: false },
    [pets[2]?.id || 'pet-3']: { count: 52, isLiked: false },
  });

  // Owner profile active sub-tab for moments
  const [ownerMediaTab, setOwnerMediaTab] = useState<'moments' | 'saved'>('moments');

  // Inline Add Pet Form State
  const [isAddingPetInline, setIsAddingPetInline] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'Chó' | 'Mèo'>('Chó');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('6.5');
  const [newPetAge, setNewPetAge] = useState('1 tuổi');

  const myPosts = posts.filter((p) => p.authorHandle === ownerHandle);
  const displayPosts = myPosts.length > 0 ? myPosts : posts.slice(0, 6);

  const ownerAvatarUrl =
    pets[0]?.avatarUrl ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

  // Total pages = 1 (Owner) + pets.length
  const totalPages = 1 + pets.length;

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page >= 0 && page < totalPages) {
      setCurrentPageIndex(page);
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    horizontalScrollRef.current?.scrollTo({
      x: pageIndex * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentPageIndex(pageIndex);
  };

  const handleTogglePetLike = (petId: string) => {
    setPetLikes((prev) => {
      const current = prev[petId] || { count: 88, isLiked: false };
      const nextLiked = !current.isLiked;
      return {
        ...prev,
        [petId]: {
          count: nextLiked ? current.count + 1 : Math.max(0, current.count - 1),
          isLiked: nextLiked,
        },
      };
    });
  };

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
          onPress: () => {
            deletePetProfile(pet.id);
            scrollToPage(0);
          },
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

    // Scroll to the newly added pet
    setTimeout(() => {
      scrollToPage(pets.length + 1);
    }, 300);
  };

  return (
    <View style={styles.rootContainer}>
      {/* TOP PAGINATION BAR: Chuyển đổi giữa Trang Chủ & Từng Bé Thú Cưng */}
      <View style={styles.topPaginationBar}>
        <TouchableOpacity
          style={styles.pageArrowBtn}
          onPress={() => scrollToPage(currentPageIndex - 1)}
          disabled={currentPageIndex === 0}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-left"
            size={18}
            color={currentPageIndex === 0 ? '#C4B9AD' : '#1C1815'}
          />
        </TouchableOpacity>

        {/* Dynamic Page Pill Indicator */}
        <View style={styles.paginationDotsWrap}>
          {/* Page 0: Owner */}
          <TouchableOpacity
            style={[
              styles.pagePillDot,
              currentPageIndex === 0 && styles.pagePillDotActive,
            ]}
            onPress={() => scrollToPage(0)}
          >
            <Text
              style={[
                styles.pagePillText,
                currentPageIndex === 0 && styles.pagePillTextActive,
              ]}
            >
              Chủ nuôi
            </Text>
          </TouchableOpacity>

          {/* Page 1..N: Each Pet */}
          {pets.map((pet, idx) => {
            const pageNum = idx + 1;
            const isActive = currentPageIndex === pageNum;
            return (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.pagePillDot,
                  isActive && styles.pagePillDotActive,
                ]}
                onPress={() => scrollToPage(pageNum)}
              >
                <Text
                  style={[
                    styles.pagePillText,
                    isActive && styles.pagePillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {pet.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Inline Add Button if space */}
          {pets.length < MAX_FREE_PETS && (
            <TouchableOpacity
              style={styles.addMiniPillBtn}
              onPress={() => {
                scrollToPage(0);
                setIsAddingPetInline(true);
              }}
            >
              <Feather name="plus" size={12} color="#FF6F61" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.pageArrowBtn}
          onPress={() => scrollToPage(currentPageIndex + 1)}
          disabled={currentPageIndex === totalPages - 1}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-right"
            size={18}
            color={
              currentPageIndex === totalPages - 1 ? '#C4B9AD' : '#1C1815'
            }
          />
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL PAGING CONTAINER */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.horizontalScroll}
      >
        {/* ================================================================= */}
        {/* PAGE 0: OWNER PROFILE (TÍCH HỢP HÌNH 1 & HÌNH 2 + MOMENTS GRID)  */}
        {/* ================================================================= */}
        <View style={styles.pageWrapper}>
          <ScrollView
            style={styles.ownerScroll}
            contentContainerStyle={styles.ownerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Cover Background Image (Hình 1 & 2) */}
            <View style={styles.ownerCoverWrap}>
              <Image source={{ uri: OWNER_COVER_URL }} style={styles.ownerCoverImg} />
              <View style={styles.ownerCoverGradient} />
            </View>

            {/* 2. Overlapping Centered Rounded Avatar & Edit Profile Button */}
            <View style={styles.avatarSectionRow}>
              {/* Spacer on left for symmetry */}
              <View style={styles.avatarSideSpacer} />

              {/* Avatar Center */}
              <TouchableOpacity
                style={styles.ownerAvatarWrap}
                onPress={() => setActiveModal('edit_profile')}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: ownerAvatarUrl }}
                  style={styles.ownerAvatarImg}
                />
              </TouchableOpacity>

              {/* Edit Profile Pill Button on right (Hình 1) */}
              <View style={styles.avatarSideBtnBox}>
                <TouchableOpacity
                  style={[styles.editProfilePillBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setActiveModal('edit_profile')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.editProfilePillText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Owner Information: Tên, Nghề nghiệp/Châm ngôn, Vị trí */}
            <View style={styles.ownerInfoCenterBox}>
              <Text style={styles.ownerFullNameText}>{ownerName}</Text>
              <Text style={styles.ownerJobTitleText}>
                {ownerNoteBubble || 'UI UX designer & Pet Parent'}
              </Text>

              <View style={styles.ownerLocationRow}>
                <Feather name="map-pin" size={13} color="#E15B4C" />
                <Text style={styles.ownerLocationText}>
                  {ownerArea || 'Quận 7, TP. Hồ Chí Minh'}
                </Text>
              </View>

              {ownerBio ? (
                <Text style={styles.ownerBioSummaryText}>{ownerBio}</Text>
              ) : null}
            </View>

            {/* 4. Thẻ 3 Con Số Thống Kê Cân Xứng (Hình 1: followers | following | likes) */}
            <View style={styles.ownerStatsCard}>
              <View style={styles.statColumn}>
                <Text style={styles.statNumberText}>1.2K</Text>
                <Text style={styles.statLabelText}>người theo dõi</Text>
              </View>

              <View style={styles.statDividerVertical} />

              <View style={styles.statColumn}>
                <Text style={styles.statNumberText}>268</Text>
                <Text style={styles.statLabelText}>đang theo dõi</Text>
              </View>

              <View style={styles.statDividerVertical} />

              <View style={styles.statColumn}>
                <Text style={styles.statNumberText}>4.5K</Text>
                <Text style={styles.statLabelText}>lượt thích</Text>
              </View>
            </View>

            {/* 5. Sub-tabs / Header Bài đăng khoảnh khắc */}
            <View style={styles.momentsTabRow}>
              <TouchableOpacity
                style={[
                  styles.momentTabItem,
                  ownerMediaTab === 'moments' && styles.momentTabItemActive,
                ]}
                onPress={() => setOwnerMediaTab('moments')}
              >
                <Text
                  style={[
                    styles.momentTabText,
                    ownerMediaTab === 'moments' && styles.momentTabTextActive,
                  ]}
                >
                  Khoảnh khắc ({myPosts.length})
                </Text>
                {ownerMediaTab === 'moments' && (
                  <View
                    style={[
                      styles.momentTabIndicator,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.momentTabItem,
                  ownerMediaTab === 'saved' && styles.momentTabItemActive,
                ]}
                onPress={() => setOwnerMediaTab('saved')}
              >
                <Text
                  style={[
                    styles.momentTabText,
                    ownerMediaTab === 'saved' && styles.momentTabTextActive,
                  ]}
                >
                  Được lưu
                </Text>
                {ownerMediaTab === 'saved' && (
                  <View
                    style={[
                      styles.momentTabIndicator,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* 6. Lưới Bài Đăng Khoảnh Khắc (Grid - Hình 1) */}
            {displayPosts.length > 0 ? (
              <View style={styles.momentsGridBox}>
                {displayPosts.map((post) => {
                  const urls = post.mediaUrls || [];
                  const thumb = urls[0] || ownerAvatarUrl;
                  return (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.gridThumbItem}
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
                      <Image source={{ uri: thumb }} style={styles.gridThumbImg} />
                      {urls.length > 1 && (
                        <View style={styles.gridBadgeTag}>
                          <Feather name="layers" size={10} color="#FFFFFF" />
                        </View>
                      )}
                      {post.mediaType === 'video' && (
                        <View style={styles.gridBadgeTag}>
                          <Feather name="play" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyMomentsBox}>
                <Feather name="camera" size={28} color="#C4B9AD" />
                <Text style={styles.emptyMomentsText}>
                  Chưa có khoảnh khắc nào được đăng
                </Text>
                <TouchableOpacity
                  style={[styles.emptyPostBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setActiveModal('new_moment')}
                >
                  <Text style={styles.emptyPostBtnText}>Đăng ảnh đầu tiên</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Inline Add Pet Form trigger on Owner page if open */}
            {isAddingPetInline && (
              <View style={styles.inlineAddFormCard}>
                <View style={styles.inlineAddHeaderRow}>
                  <Text style={styles.inlineAddTitle}>Thêm bé cưng mới</Text>
                  <TouchableOpacity
                    onPress={() => setIsAddingPetInline(false)}
                    style={styles.inlineCloseBtn}
                  >
                    <Feather name="x" size={16} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                {/* Species Choice */}
                <View style={styles.speciesChoiceRow}>
                  <TouchableOpacity
                    style={[
                      styles.speciesTabBtn,
                      newPetSpecies === 'Chó' && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setNewPetSpecies('Chó')}
                  >
                    <Text
                      style={[
                        styles.speciesTabText,
                        newPetSpecies === 'Chó' && { color: '#FFFFFF' },
                      ]}
                    >
                      Loài Chó
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.speciesTabBtn,
                      newPetSpecies === 'Mèo' && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setNewPetSpecies('Mèo')}
                  >
                    <Text
                      style={[
                        styles.speciesTabText,
                        newPetSpecies === 'Mèo' && { color: '#FFFFFF' },
                      ]}
                    >
                      Loài Mèo
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Inputs */}
                <View style={styles.formInputRow}>
                  <TextInput
                    style={[styles.inputField, { flex: 1 }]}
                    placeholder="Tên bé (VD: Coca, Lu)"
                    placeholderTextColor="#A89E94"
                    value={newPetName}
                    onChangeText={setNewPetName}
                  />
                  <TextInput
                    style={[styles.inputField, { width: 105 }]}
                    placeholder="Kg (6.5)"
                    placeholderTextColor="#A89E94"
                    keyboardType="decimal-pad"
                    value={newPetWeight}
                    onChangeText={setNewPetWeight}
                  />
                </View>

                <View style={styles.formInputRow}>
                  <TextInput
                    style={[styles.inputField, { flex: 1 }]}
                    placeholder="Giống loài (VD: Poodle)"
                    placeholderTextColor="#A89E94"
                    value={newPetBreed}
                    onChangeText={setNewPetBreed}
                  />
                  <TextInput
                    style={[styles.inputField, { width: 105 }]}
                    placeholder="Tuổi (1 tuổi)"
                    placeholderTextColor="#A89E94"
                    value={newPetAge}
                    onChangeText={setNewPetAge}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitNewPetBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveNewPet}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={15} color="#FFFFFF" />
                  <Text style={styles.submitNewPetBtnText}>Lưu hồ sơ bé mới</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ================================================================= */}
        {/* PAGES 1..N: HỒ SƠ TỪNG THÚ CƯNG (HÌNH 3 & HÌNH 4: FULL-BLEED PET) */}
        {/* ================================================================= */}
        {pets.map((pet) => {
          const petLikeInfo = petLikes[pet.id] || { count: 128, isLiked: false };

          return (
            <View key={pet.id} style={styles.pageWrapper}>
              <ScrollView
                style={styles.petPageScroll}
                contentContainerStyle={styles.petPageScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Full-bleed Hero Pet Image (Hình 4) */}
                <View style={styles.petHeroImageWrap}>
                  <Image
                    source={{ uri: pet.avatarUrl }}
                    style={styles.petHeroImage}
                  />

                  {/* Top Badge: Loài & Giống */}
                  <View style={styles.petHeroTopBadge}>
                    <Text style={styles.petHeroTopBadgeText}>
                      {pet.species === 'Chó' ? 'Loài Chó' : 'Loài Mèo'} · {pet.breed}
                    </Text>
                  </View>
                </View>

                {/* 2. Sliding White / Frosted Card Overlay (Hình 3 & 4) */}
                <View style={styles.petDetailsCard}>
                  {/* Header: Name, Distance & Like Heart Button with Like Count */}
                  <View style={styles.petHeaderLine}>
                    <View style={styles.petNameAndDistBox}>
                      <Text style={styles.petMainNameText}>{pet.name}</Text>
                      <View style={styles.petDistanceRow}>
                        <Feather name="map-pin" size={12} color="#7E6E60" />
                        <Text style={styles.petDistanceText}>
                          {ownerArea || 'Cách bạn 1.5 km'}
                        </Text>
                      </View>
                    </View>

                    {/* Like Button & Likes Count (Yêu cầu 3) */}
                    <TouchableOpacity
                      style={[
                        styles.petLikeInteractiveBtn,
                        petLikeInfo.isLiked && styles.petLikeInteractiveBtnActive,
                      ]}
                      onPress={() => handleTogglePetLike(pet.id)}
                      activeOpacity={0.85}
                    >
                      <Feather
                        name="heart"
                        size={18}
                        color={petLikeInfo.isLiked ? '#FF6F61' : '#7E6E60'}
                      />
                      <Text
                        style={[
                          styles.petLikeCountText,
                          petLikeInfo.isLiked && { color: '#FF6F61' },
                        ]}
                      >
                        {petLikeInfo.count}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 3 Metric Rounded Pill Cards (Hình 3 & 4: Sex | Age | Weight) */}
                  <View style={styles.petSpecsPillRow}>
                    <View style={styles.specPillBox}>
                      <Text style={styles.specPillLabel}>Giới tính</Text>
                      <Text style={styles.specPillValue}>{pet.gender || 'Đực'}</Text>
                    </View>

                    <View style={styles.specPillBox}>
                      <Text style={styles.specPillLabel}>Tuổi đời</Text>
                      <Text style={styles.specPillValue}>
                        {pet.ageLabel || '1 tuổi'}
                      </Text>
                    </View>

                    <View style={styles.specPillBox}>
                      <Text style={styles.specPillLabel}>Cân nặng</Text>
                      <Text style={styles.specPillValue}>{pet.weightKg} kg</Text>
                    </View>
                  </View>

                  {/* SỔ TIÊM CHỦNG SAFE PET (MÀU MINT AN TOÀN) */}
                  <TouchableOpacity
                    style={[
                      styles.safePetCard,
                      pet.isVaccinatedAndRabies
                        ? styles.safePetCardGood
                        : styles.safePetCardWarn,
                    ]}
                    onPress={() => togglePetVaccinationAndRabies(pet.id)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.safePetIconBox,
                        {
                          backgroundColor: pet.isVaccinatedAndRabies
                            ? '#C8EFE1'
                            : '#FDDAD2',
                        },
                      ]}
                    >
                      <Feather
                        name={
                          pet.isVaccinatedAndRabies ? 'shield' : 'alert-triangle'
                        }
                        size={17}
                        color={
                          pet.isVaccinatedAndRabies ? '#167E66' : '#C93B2B'
                        }
                      />
                    </View>

                    <View style={styles.safePetTextBox}>
                      <Text style={styles.safePetTitle}>
                        {pet.isVaccinatedAndRabies
                          ? 'Chứng nhận Safe Pet'
                          : 'Chưa xác nhận sổ tiêm'}
                      </Text>
                      <Text style={styles.safePetSub}>
                        {pet.isVaccinatedAndRabies
                          ? 'Đã tiêm phòng 7 bệnh & vắc-xin phòng dại'
                          : 'Chạm để cập nhật sổ tiêm ngừa đầy đủ'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* DESCRIPTION / ABOUT SECTION (Hình 3 & 4) */}
                  <View style={styles.petAboutSection}>
                    <Text style={styles.petAboutHeading}>Về bé {pet.name}:</Text>
                    <Text style={styles.petAboutBodyText}>
                      {pet.bio ||
                        `Bé ${pet.name} rất thông minh, thân thiện và háo hức khi được đi dạo ngoài trời cùng bạn bè.`}
                    </Text>

                    {/* Behavior chips */}
                    <View style={styles.habitChipsContainer}>
                      {(pet.goodHabits || ['Thân thiện', 'Thích đi dạo']).map(
                        (h, i) => (
                          <View key={`g-${i}`} style={styles.goodHabitChip}>
                            <Feather name="check" size={11} color="#167E66" />
                            <Text style={styles.goodHabitText}>{h}</Text>
                          </View>
                        )
                      )}
                      {(pet.cautionHabits || ['Cần giữ dây']).map((c, i) => (
                        <View key={`c-${i}`} style={styles.cautionHabitChip}>
                          <Text style={styles.cautionHabitText}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* ACTION BUTTONS (Hình 4: Arrange a meeting / Chỉnh sửa) */}
                  <View style={styles.petActionRow}>
                    <TouchableOpacity
                      style={[
                        styles.arrangeMeetingBtn,
                        { backgroundColor: '#FAD8A0' },
                      ]}
                      onPress={() => {
                        Alert.alert(
                          'Hẹn dạo cùng bé',
                          `Lời mời dắt dạo cùng bé ${pet.name} đã sẵn sàng ở nhánh Tin nhắn!`,
                          [{ text: 'Đã rõ' }]
                        );
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.arrangeMeetingBtnText}>
                        Hẹn dạo cùng bé
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.petSecondaryBtn}
                      onPress={() => {
                        setActivePetId(pet.id);
                        setActiveModal('edit_profile');
                      }}
                      activeOpacity={0.85}
                    >
                      <Feather name="edit-2" size={14} color="#332B25" />
                    </TouchableOpacity>

                    {pets.length > 1 && (
                      <TouchableOpacity
                        style={styles.petDeleteMiniBtn}
                        onPress={() => handleDeletePetConfirm(pet)}
                        activeOpacity={0.85}
                      >
                        <Feather name="trash-2" size={14} color="#C93B2B" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },

  /* Top Pagination Bar */
  topPaginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE4',
  },
  pageArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F2',
  },
  paginationDotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pagePillDot: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFEAE3',
  },
  pagePillDotActive: {
    backgroundColor: '#FF6F61',
    borderColor: '#FF6F61',
  },
  pagePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E6E60',
  },
  pagePillTextActive: {
    color: '#FFFFFF',
  },
  addMiniPillBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF0EE',
    borderWidth: 1,
    borderColor: '#FFD7D2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Horizontal ScrollView */
  horizontalScroll: {
    flex: 1,
  },
  pageWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  /* PAGE 0: OWNER PROFILE STYLES */
  ownerScroll: {
    flex: 1,
  },
  ownerScrollContent: {
    paddingBottom: 40,
  },
  ownerCoverWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E5DDD3',
  },
  ownerCoverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ownerCoverGradient: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  /* Avatar Row with Edit Button */
  avatarSectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -48,
    marginBottom: 8,
  },
  avatarSideSpacer: {
    width: 80,
  },
  ownerAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#EFEBE4',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ownerAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarSideBtnBox: {
    width: 80,
    alignItems: 'flex-end',
  },
  editProfilePillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfilePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Owner Info Center Box */
  ownerInfoCenterBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 16,
  },
  ownerFullNameText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1C1815',
    letterSpacing: 0.2,
  },
  ownerJobTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6257',
    marginTop: 2,
  },
  ownerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  ownerLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E6E60',
  },
  ownerBioSummaryText: {
    fontSize: 12,
    color: '#5C5046',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 8,
    paddingHorizontal: 12,
  },

  /* 3 Stats Card (Hình 1 & 2) */
  ownerStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    shadowColor: '#1C1815',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1815',
  },
  statLabelText: {
    fontSize: 11,
    color: '#7E6E60',
    fontWeight: '600',
    marginTop: 2,
  },
  statDividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: '#EFEBE4',
  },

  /* Moments Tabs & Grid */
  momentsTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE3',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  momentTabItem: {
    paddingVertical: 10,
    position: 'relative',
  },
  momentTabItemActive: {},
  momentTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A7D71',
  },
  momentTabTextActive: {
    color: '#1C1815',
    fontWeight: '800',
  },
  momentTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    borderRadius: 2,
  },
  momentsGridBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  gridThumbItem: {
    width: MOMENT_GRID_SIZE,
    height: MOMENT_GRID_SIZE * 1.15,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EFEBE4',
    position: 'relative',
  },
  gridThumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridBadgeTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(28, 24, 21, 0.65)',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  emptyMomentsBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyMomentsText: {
    fontSize: 13,
    color: '#8A7D71',
  },
  emptyPostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyPostBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Inline Add Pet Form Card */
  inlineAddFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F0E7DC',
    gap: 10,
  },
  inlineAddHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineAddTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1815',
  },
  inlineCloseBtn: {
    padding: 4,
  },
  speciesChoiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  speciesTabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F7F3EE',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  formInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputField: {
    height: 40,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1C1815',
  },
  submitNewPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 14,
    marginTop: 4,
  },
  submitNewPetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* PAGES 1..N: PET PROFILE (HÌNH 3 & HÌNH 4) */
  petPageScroll: {
    flex: 1,
  },
  petPageScrollContent: {
    paddingBottom: 40,
  },
  petHeroImageWrap: {
    width: '100%',
    height: 340,
    position: 'relative',
    backgroundColor: '#E5DDD3',
  },
  petHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  petHeroTopBadge: {
    position: 'absolute',
    top: 14,
    left: 16,
    backgroundColor: 'rgba(28, 24, 21, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  petHeroTopBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Pet Details Sliding Card */
  petDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  petHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  petNameAndDistBox: {
    flex: 1,
  },
  petMainNameText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1815',
  },
  petDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  petDistanceText: {
    fontSize: 12,
    color: '#7E6E60',
    fontWeight: '600',
  },
  petLikeInteractiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFEAE3',
  },
  petLikeInteractiveBtnActive: {
    backgroundColor: '#FFF0EE',
    borderColor: '#FFD7D2',
  },
  petLikeCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E6E60',
  },

  /* 3 Metric Pills (Hình 3 & 4) */
  petSpecsPillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  specPillBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE3',
    gap: 2,
  },
  specPillLabel: {
    fontSize: 11,
    color: '#8A7D71',
    fontWeight: '600',
  },
  specPillValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1815',
  },

  /* Safe Pet Card */
  safePetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  safePetCardGood: {
    backgroundColor: '#F0FAF6',
    borderColor: '#C6EFE1',
  },
  safePetCardWarn: {
    backgroundColor: '#FEF5F2',
    borderColor: '#FBD4CA',
  },
  safePetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safePetTextBox: {
    flex: 1,
  },
  safePetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1815',
  },
  safePetSub: {
    fontSize: 11,
    color: '#5C5046',
    marginTop: 1,
  },

  /* About Section */
  petAboutSection: {
    gap: 6,
  },
  petAboutHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1815',
  },
  petAboutBodyText: {
    fontSize: 13,
    color: '#4A3F35',
    lineHeight: 18,
  },
  habitChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  goodHabitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F6F0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  goodHabitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#167E66',
  },
  cautionHabitChip: {
    backgroundColor: '#FDF0E9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cautionHabitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B85D38',
  },

  /* Pet Action Row */
  petActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  arrangeMeetingBtn: {
    flex: 1,
    height: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrangeMeetingBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2117',
  },
  petSecondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: '#F4EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petDeleteMiniBtn: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
