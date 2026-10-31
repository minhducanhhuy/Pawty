import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from './FeatherIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useMobilePawty,
  THEME_PALETTES,
  ThemePresetId,
} from '../context/MobilePawtyContext';
import {
  SUGGESTED_HASHTAGS,
  SAMPLE_UPLOAD_GALLERY,
} from '../data/mobileSeedData';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const MobileModals: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);

  const {
    themeId,
    theme,
    setThemeId,
    activeModal,
    setActiveModal,
    ownerName,
    ownerHandle,
    ownerNickname,
    ownerBio,
    ownerArea,
    ownerNoteBubble,
    setOwnerNoteBubble,
    isPrivateProfile,
    togglePrivateProfile,
    activeDeviceSessionId,
    activeDeviceName,
    forceRevokeOtherDevices,
    updateOwnerAndPetProfile,
    activePet,
    deletePetProfile,
    createPost,
    isVip,
    activeVipPlanId,
    vipPlans,
    selectAndActivateVipPlan,
    userTinderSetup,
    updateUserTinderSetup,
    publicProfiles,
    resolvePublicProfile,
    viewedUserHandle,
    closePublicUserProfile,
    openUserProfileInTab,
    toggleFriendStatus,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    toggleFollowUser,
    startDirectChatWithUser,
    setActiveTab,
    tinderCandidates,
    posts,
    openLightboxMedia,
    showLikesYouDrawer,
    setShowLikesYouDrawer,
    matchedCandidateModal,
    closeMatchedCandidateModal,
    openChatWithMatchedCandidate,
    lightboxMedia,
    closeLightboxMedia,
    notifications,
    markNotificationRead,
    logoutUser,
    showToast,
  } = useMobilePawty();

  // 1. New Post Composer State (Unified Media + Custom Free Hashtags + Phone Gallery Picker)
  const [postCaption, setPostCaption] = useState('');
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([
    SAMPLE_UPLOAD_GALLERY[0].url,
    SAMPLE_UPLOAD_GALLERY[1].url,
  ]);
  const [isSelectedVideo, setIsSelectedVideo] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([
    '#GoldenRetriever',
    '#DiDaoChieu',
  ]);
  const [customHashtagDraft, setCustomHashtagDraft] = useState('');

  // 2. Edit Owner & Active Pet Profile State
  const [editOwnerName, setEditOwnerName] = useState(ownerName);
  const [editOwnerNickname, setEditOwnerNickname] = useState(ownerNickname);
  const [editOwnerBio, setEditOwnerBio] = useState(ownerBio);
  const [editOwnerArea, setEditOwnerArea] = useState(ownerArea);
  const [editOwnerNote, setEditOwnerNote] = useState(ownerNoteBubble);
  const [editPetName, setEditPetName] = useState(activePet.name);
  const [editPetSpecies, setEditPetSpecies] = useState<'Chó' | 'Mèo'>(activePet.species);
  const [editPetBreed, setEditPetBreed] = useState(activePet.breed);
  const [editPetGender, setEditPetGender] = useState<'Đực' | 'Cái'>(activePet.gender);
  const [editPetAge, setEditPetAge] = useState(activePet.ageLabel);
  const [editPetWeight, setEditPetWeight] = useState(String(activePet.weightKg));
  const [editPetVaccinated, setEditPetVaccinated] = useState(activePet.isVaccinatedAndRabies);

  // 3. User Tinder Setup State
  const [tinderAgeInput, setTinderAgeInput] = useState(String(userTinderSetup.age));
  const [tinderGenderInput, setTinderGenderInput] = useState<'Nam' | 'Nữ'>(
    userTinderSetup.gender
  );
  const [tinderLookingForInput, setTinderLookingForInput] = useState(userTinderSetup.lookingFor);
  const [tinderSmokingInput, setTinderSmokingInput] = useState(userTinderSetup.smoking);
  const [tinderWorkoutInput, setTinderWorkoutInput] = useState(userTinderSetup.workout);
  const [tinderDrinkingInput, setTinderDrinkingInput] = useState(userTinderSetup.drinking);
  const [tinderZodiacInput, setTinderZodiacInput] = useState(userTinderSetup.zodiac);
  const [tinderChatStyleInput, setTinderChatStyleInput] = useState(userTinderSetup.chatStyle);

  // 4. Book Service State

  // 5. Lightbox Index State
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    setEditOwnerName(ownerName);
    setEditOwnerNickname(ownerNickname);
    setEditOwnerBio(ownerBio);
    setEditOwnerArea(ownerArea);
    setEditOwnerNote(ownerNoteBubble);
    setEditPetName(activePet.name);
    setEditPetSpecies(activePet.species);
    setEditPetBreed(activePet.breed);
    setEditPetGender(activePet.gender);
    setEditPetAge(activePet.ageLabel);
    setEditPetWeight(String(activePet.weightKg));
    setEditPetVaccinated(activePet.isVaccinatedAndRabies);
  }, [
    ownerName,
    ownerNickname,
    ownerBio,
    ownerArea,
    ownerNoteBubble,
    activePet,
    activeModal,
  ]);

  useEffect(() => {
    setTinderAgeInput(String(userTinderSetup.age));
    setTinderGenderInput(userTinderSetup.gender);
    setTinderLookingForInput(userTinderSetup.lookingFor);
    setTinderSmokingInput(userTinderSetup.smoking);
    setTinderWorkoutInput(userTinderSetup.workout);
    setTinderDrinkingInput(userTinderSetup.drinking);
    setTinderZodiacInput(userTinderSetup.zodiac);
    setTinderChatStyleInput(userTinderSetup.chatStyle);
  }, [userTinderSetup, activeModal]);

  useEffect(() => {
    if (lightboxMedia) {
      setLightboxIdx(lightboxMedia.initialIndex || 0);
    }
  }, [lightboxMedia]);

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomHashtag = () => {
    const raw = customHashtagDraft.trim().replace(/\s+/g, '');
    if (!raw) return;
    const formatted = raw.startsWith('#') ? raw : `#${raw}`;
    if (!selectedHashtags.includes(formatted)) {
      setSelectedHashtags((prev) => [...prev, formatted]);
    }
    setCustomHashtagDraft('');
  };

  const handlePickMediaFromDevice = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUris = result.assets.map((asset) => asset.uri);
        const hasVideo = result.assets.some((asset) => asset.type === 'video');
        setSelectedMediaUrls(pickedUris);
        setIsSelectedVideo(hasVideo);
        showToast(`Đã chọn ${pickedUris.length} tệp từ điện thoại.`);
      }
    } catch {
      showToast('Không thể mở thư viện phương tiện trên máy.');
    }
  };

  const handleCaptureCameraMedia = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        showToast('Vui lòng cấp quyền Máy ảnh để chụp ảnh hoặc quay video.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedMediaUrls((prev) => [asset.uri, ...prev]);
        setIsSelectedVideo(asset.type === 'video');
        showToast('Đã thêm ảnh/video vừa chụp.');
      }
    } catch {
      showToast('Không thể mở máy ảnh trên thiết bị.');
    }
  };

  const toggleSampleMediaItem = (url: string, isVideo = false) => {
    if (isVideo) {
      setIsSelectedVideo(true);
      setSelectedMediaUrls([url]);
      return;
    }
    setIsSelectedVideo(false);
    setSelectedMediaUrls((prev) => {
      if (prev.includes(url)) {
        return prev.length > 1 ? prev.filter((u) => u !== url) : prev;
      }
      return [...prev, url];
    });
  };

  // 1. FULLSCREEN SWIPEABLE MEDIA LIGHTBOX MODAL
  if (lightboxMedia) {
    const urls = lightboxMedia.mediaUrls;
    const handleLightboxScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (idx >= 0 && idx < urls.length && idx !== lightboxIdx) {
        setLightboxIdx(idx);
      }
    };

    return (
      <Modal visible transparent animationType="fade" onRequestClose={closeLightboxMedia}>
        <View style={styles.lightboxBackdrop}>
          <View style={styles.lightboxHeader}>
            <TouchableOpacity
              onPress={closeLightboxMedia}
              style={styles.lightboxBackBtn}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <Text style={styles.lightboxAuthor}>
                {lightboxMedia.authorName || 'Xem phương tiện'}
              </Text>
              <Text style={styles.lightboxCounter}>
                {lightboxMedia.mediaType === 'video'
                  ? 'Đang phát Video ngắn'
                  : `Ảnh ${lightboxIdx + 1} / ${urls.length} (Chạm để đóng · Gạt xem tiếp)`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={closeLightboxMedia}
              style={styles.lightboxCloseBtn}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.lightboxBody}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleLightboxScroll}
              scrollEventThrottle={16}
              contentOffset={{ x: lightboxIdx * SCREEN_WIDTH, y: 0 }}
            >
              {urls.map((imgUri, idx) => (
                <TouchableOpacity
                  key={`lb-${idx}`}
                  style={styles.lightboxSlide}
                  activeOpacity={1}
                  onPress={closeLightboxMedia}
                >
                  <Image
                    source={{ uri: imgUri }}
                    style={styles.lightboxMainImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {lightboxMedia.mediaType === 'video' && (
              <View style={styles.lightboxVideoTag}>
                <Feather name="video" size={14} color="#FFFFFF" />
                <Text style={styles.lightboxVideoTagText}>Đang phát ở chế độ toàn màn hình</Text>
              </View>
            )}
          </View>

          {urls.length > 1 && (
            <View style={styles.lightboxThumbRow}>
              {urls.map((u, idx) => (
                <TouchableOpacity key={`${u}-${idx}`} onPress={() => setLightboxIdx(idx)}>
                  <Image
                    source={{ uri: u }}
                    style={[
                      styles.lightboxThumb,
                      idx === lightboxIdx && {
                        borderColor: theme.primary,
                        borderWidth: 2,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {lightboxMedia.caption ? (
            <TouchableOpacity activeOpacity={1} onPress={closeLightboxMedia} style={styles.lightboxFooter}>
              <Text style={styles.lightboxCaption} numberOfLines={3}>
                {lightboxMedia.caption}
              </Text>
              <Text style={styles.lightboxDismissHint}>Chạm vào màn hình để quay lại bảng tin</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={1} onPress={closeLightboxMedia} style={{ alignItems: 'center', paddingBottom: 12 }}>
              <Text style={styles.lightboxDismissHint}>Chạm vào màn hình để quay lại bảng tin</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    );
  }

  // 2. MATCHED CANDIDATE CELEBRATION MODAL
  if (matchedCandidateModal) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={closeMatchedCandidateModal}
      >
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { paddingBottom: bottomInset + 18 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Kết nối thành công!</Text>
              <TouchableOpacity
                onPress={closeMatchedCandidateModal}
                style={styles.closeBtn}
              >
                <Feather name="x" size={18} color="#5C5046" />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              <View style={styles.matchCenterBox}>
                <Image
                  source={{ uri: matchedCandidateModal.avatarUrl }}
                  style={styles.matchAvatarLarge}
                />
                <Text style={styles.publicName}>
                  Bạn và {matchedCandidateModal.ownerName} đã thích nhau!
                </Text>
                <Text style={styles.subHintText}>
                  {matchedCandidateModal.pets.length > 0
                    ? matchedCandidateModal.pets.every((p) => p.isVaccinatedAndRabies)
                      ? `Chủ nuôi đã khai báo tiêm ngừa cho ${matchedCandidateModal.pets.map((p) => p.name).join(' & ')}, sẵn sàng hẹn đi dạo.`
                      : `Các bé ${matchedCandidateModal.pets.map((p) => p.name).join(' & ')} đang chờ làm quen cùng bé nhà bạn.`
                    : 'Cả hai bạn đã sẵn sàng trò chuyện và làm quen!'}
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary, width: '100%' }]}
                  onPress={() => openChatWithMatchedCandidate(matchedCandidateModal)}
                >
                  <Feather name="message-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Nhắn tin làm quen ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // 3. LIKES YOU DRAWER MODAL
  if (showLikesYouDrawer) {
    const likedCandidates = tinderCandidates.filter((c) => c.hasLikedMe);
    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => setShowLikesYouDrawer(false)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { paddingBottom: bottomInset + 18 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Đã thích bạn ({likedCandidates.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowLikesYouDrawer(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={18} color="#5C5046" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody}>
              {!isVip ? (
                <View style={styles.lockedBox}>
                  <Feather name="lock" size={24} color={theme.primary} />
                  <Text style={styles.lockedTitle}>
                    Có {likedCandidates.length} người đã thả tim hồ sơ của bạn
                  </Text>
                  <Text style={styles.lockedSub}>
                    Nâng cấp gói Pawty Plus / Gold để xem rõ mặt và kết nối trò chuyện ngay lập tức.
                  </Text>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setShowLikesYouDrawer(false);
                      setActiveModal('vip_upgrade');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Mở khóa bằng Pawty Plus / Gold</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {likedCandidates.map((item) => (
                    <View key={item.id} style={styles.likedRow}>
                      <Image source={{ uri: item.avatarUrl }} style={styles.likedAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optionTitle}>
                          {item.ownerName}, {item.ownerAge}
                        </Text>
                        <Text style={styles.optionSub}>
                          {item.pets.map((p) => `${p.name} (${p.breed})`).join(', ')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.matchSmallBtn, { backgroundColor: theme.primary }]}
                        onPress={() => {
                          setShowLikesYouDrawer(false);
                          openChatWithMatchedCandidate(item);
                        }}
                      >
                        <Text style={styles.matchSmallBtnText}>Nhắn tin</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // 4. PUBLIC USER PROFILE MODAL — FULLSCREEN INSTAGRAM STYLE
  if (viewedUserHandle) {
    const profile = publicProfiles[viewedUserHandle] || resolvePublicProfile(viewedUserHandle);
    const userPosts = posts ? posts.filter((p) => p.authorHandle === profile.handle) : [];
    const galleryItems =
      userPosts.length > 0
        ? userPosts
        : profile.galleryUrls.map((url, idx) => ({
            id: `gal-${idx}`,
            mediaUrls: [url],
            mediaType: 'image' as const,
            authorName: profile.name,
            content: '',
          }));

    return (
      <Modal
        visible
        animationType="slide"
        onRequestClose={closePublicUserProfile}
      >
        <SafeAreaView style={styles.igFullScreenContainer} edges={['top', 'bottom']}>
          {/* TOP INSTAGRAM APP BAR */}
          <View style={styles.igTopAppBar}>
            <TouchableOpacity
              onPress={closePublicUserProfile}
              style={styles.igBackBtn}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={22} color="#1C1815" />
            </TouchableOpacity>

            <View style={styles.igHeaderUserRow}>
              {profile.isPrivate && (
                <View style={{ marginRight: 5 }}><Feather name="lock" size={13} color="#1C1815" /></View>
              )}
              <Text style={styles.igHeaderUsername}>{profile.handle}</Text>
            </View>

            <View style={styles.igHeaderRightActions}>
              <TouchableOpacity
                style={styles.igHeaderActionBtn}
                onPress={() => toggleFollowUser(profile.handle)}
                activeOpacity={0.7}
              >
                <Feather
                  name={profile.isFollowing ? 'bell-off' : 'bell'}
                  size={19}
                  color={profile.isFollowing ? theme.primary : '#1C1815'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.igHeaderActionBtn}
                onPress={() => showToast(`Chia sẻ trang cá nhân của ${profile.name}`)}
                activeOpacity={0.7}
              >
                <Feather name="share-2" size={19} color="#1C1815" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* INSTAGRAM AVATAR + STATS ROW */}
            <View style={styles.igProfileHeaderSection}>
              <View style={styles.igAvatarRow}>
                {/* Avatar with Instagram Ring */}
                <View style={[styles.igAvatarRing, { borderColor: theme.primary }]}>
                  <Image source={{ uri: profile.avatarUrl }} style={styles.igProfileAvatarImg} />
                </View>

                {/* 3 Stats Columns */}
                <View style={styles.igStatsColumnsWrap}>
                  <View style={styles.igStatCol}>
                    <Text style={styles.igStatNumber}>{galleryItems.length}</Text>
                    <Text style={styles.igStatText}>bài viết</Text>
                  </View>
                  <View style={styles.igStatCol}>
                    <Text style={styles.igStatNumber}>{profile.followersCount}</Text>
                    <Text style={styles.igStatText}>người theo dõi</Text>
                  </View>
                  <View style={styles.igStatCol}>
                    <Text style={styles.igStatNumber}>{profile.friendsCount}</Text>
                    <Text style={styles.igStatText}>đang theo dõi</Text>
                  </View>
                </View>
              </View>

              {/* Name & Title Badge */}
              <View style={styles.igNameBadgeRow}>
                <Text style={styles.igFullNameText}>{profile.name}</Text>
                <View style={[styles.igNicknameBadge, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="award" size={11} color={theme.primary} />
                  <Text style={[styles.igNicknameText, { color: theme.primary }]}>
                    {profile.nickname}
                  </Text>
                </View>
              </View>

              {/* Location Mini Tag */}
              <View style={styles.igLocationRow}>
                <Feather name="map-pin" size={12} color="#7A6E63" />
                <Text style={styles.igLocationText}>{profile.area}</Text>
              </View>

              {/* Bio */}
              <Text style={styles.igBioTextContent}>{profile.bio}</Text>

              {/* INSTAGRAM ACTION BUTTONS ROW */}
              <View style={styles.igActionBtnsRow}>
                {/* Nút 1: Theo dõi */}
                <TouchableOpacity
                  style={[
                    styles.igMainBtn,
                    profile.isFollowing
                      ? styles.igBtnFollowing
                      : [styles.igBtnFollow, { backgroundColor: theme.primary }],
                  ]}
                  onPress={() => toggleFollowUser(profile.handle)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={profile.isFollowing ? 'check' : 'bell'}
                    size={14}
                    color={profile.isFollowing ? '#1C1815' : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.igMainBtnText,
                      { color: profile.isFollowing ? '#1C1815' : '#FFFFFF' },
                    ]}
                  >
                    {profile.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                </TouchableOpacity>

                {/* Nút 2: Kết bạn */}
                <TouchableOpacity
                  style={[
                    styles.igMainBtn,
                    profile.friendStatus === 'accepted' || profile.isFriend
                      ? styles.igBtnFriendAccepted
                      : profile.friendStatus === 'pending'
                      ? styles.igBtnFriendPending
                      : styles.igBtnFriendDefault,
                  ]}
                  onPress={() => toggleFriendStatus(profile.handle)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={
                      profile.friendStatus === 'accepted' || profile.isFriend
                        ? 'check'
                        : profile.friendStatus === 'pending'
                        ? 'clock'
                        : 'user-plus'
                    }
                    size={14}
                    color={
                      profile.friendStatus === 'accepted' || profile.isFriend
                        ? '#2E7D5B'
                        : profile.friendStatus === 'pending'
                        ? '#856404'
                        : '#1C1815'
                    }
                  />
                  <Text
                    style={[
                      styles.igMainBtnText,
                      {
                        color:
                          profile.friendStatus === 'accepted' || profile.isFriend
                            ? '#2E7D5B'
                            : profile.friendStatus === 'pending'
                            ? '#856404'
                            : '#1C1815',
                      },
                    ]}
                  >
                    {profile.friendStatus === 'accepted' || profile.isFriend
                      ? 'Bạn bè'
                      : profile.friendStatus === 'pending'
                      ? 'Đã gửi lời mời'
                      : 'Kết bạn'}
                  </Text>
                </TouchableOpacity>

                {/* Nút 3: Nhắn tin (nếu là bạn bè) */}
                {(profile.friendStatus === 'accepted' || profile.isFriend) && (
                  <TouchableOpacity
                    style={styles.igDirectChatBtn}
                    onPress={() => {
                      closePublicUserProfile();
                      startDirectChatWithUser(profile.handle);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="message-circle" size={16} color="#1C1815" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* INSTAGRAM PET HIGHLIGHTS (Khoanh Tròn Thú Cưng) */}
            {profile.pets && profile.pets.length > 0 && (
              <View style={styles.igHighlightsSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
                  {profile.pets.map((p, idx) => (
                    <View key={`${p.name}-${idx}`} style={styles.igHighlightItem}>
                      <View style={[styles.igHighlightRing, { borderColor: p.isVaccinatedAndRabies ? '#2E7D5B' : '#E8DED1' }]}>
                        <View style={styles.igHighlightCircle}>
                          <Feather name="award" size={24} color={theme.primary} />
                        </View>
                        {p.isVaccinatedAndRabies && (
                          <View style={styles.igVaccineVerifiedBadge}>
                            <Feather name="check" size={9} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.igHighlightName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={styles.igHighlightMeta} numberOfLines={1}>
                        {p.species} · {p.weightKg}kg
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* INSTAGRAM GRID TAB BAR (Biểu tượng Lưới bài viết) */}
            <View style={styles.igMediaTabBar}>
              <View style={[styles.igMediaTabItem, styles.igMediaTabActive]}>
                <Feather name="grid" size={20} color="#1C1815" />
              </View>
              <View style={styles.igMediaTabItem}>
                <Feather name="user" size={20} color="#9C8E80" />
              </View>
            </View>

            {/* INSTAGRAM 3-COLUMN PHOTO GRID */}
            <View style={styles.igGridPhotoContainer}>
              {galleryItems.map((item, idx) => {
                const urls = item.mediaUrls || [item];
                return (
                  <TouchableOpacity
                    key={`ig-feed-${idx}`}
                    style={styles.igGridCell}
                    activeOpacity={0.9}
                    onPress={() =>
                      openLightboxMedia({
                        postId: item.id || `lightbox-${idx}`,
                        mediaUrls: urls,
                        initialIndex: 0,
                        mediaType: item.mediaType || 'image',
                        authorName: profile.name,
                        caption: item.content || `Khoảnh khắc của ${profile.name}`,
                      })
                    }
                  >
                    <Image source={{ uri: urls[0] }} style={styles.igGridCellImage} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  const isGeneralModalActive =
    activeModal === 'new_moment' ||
    activeModal === 'my_settings' ||
    activeModal === 'tinder_setup' ||
    activeModal === 'vip_upgrade' ||
    activeModal === 'edit_profile' ||
    activeModal === 'notifications';

  if (!isGeneralModalActive) return null;

  return (
    <Modal
      visible={isGeneralModalActive}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {activeModal === 'new_moment' && 'Đăng bài mới lên Khám phá'}
              {activeModal === 'my_settings' && 'Cài đặt của tôi & Quyền riêng tư'}
              {activeModal === 'tinder_setup' && 'Thiết lập Hồ sơ Kết nối'}
              {activeModal === 'vip_upgrade' && 'Gói thành viên Pawty Plus & Gold'}
              {activeModal === 'edit_profile' && 'Chỉnh sửa Trang cá nhân & Thú cưng'}
              {activeModal === 'notifications' && 'Thông báo hoạt động'}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#5C5046" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* MODAL 1: NEW EXPLORE POST (UNIFIED MEDIA PICKER + PHONE GALLERY + FREE HASHTAGS) */}
            {activeModal === 'new_moment' && (
              <View>
                <Text style={styles.label}>
                  Chọn ảnh hoặc video từ điện thoại ({selectedMediaUrls.length} tệp đang chọn)
                </Text>
                <View style={styles.twoCol}>
                  <TouchableOpacity
                    style={[
                      styles.deviceUploadBtn,
                      { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                    ]}
                    onPress={handlePickMediaFromDevice}
                  >
                    <Feather name="image" size={16} color={theme.primary} />
                    <Text style={[styles.deviceUploadBtnText, { color: theme.primary }]}>
                      Thư viện Ảnh / Video
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deviceCameraBtn}
                    onPress={handleCaptureCameraMedia}
                  >
                    <Feather name="camera" size={16} color="#2C2520" />
                    <Text style={styles.deviceCameraBtnText}>Máy ảnh / Quay</Text>
                  </TouchableOpacity>
                </View>

                {selectedMediaUrls.length > 0 && (
                  <View style={styles.selectedPreviewSection}>
                    <Text style={styles.subHintText}>
                      Gạt ngang để xem các ảnh/video đã chọn · Chạm vào dấu X để bỏ bớt
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.selectedMediaScroll}
                    >
                      {selectedMediaUrls.map((uri, idx) => (
                        <View key={`${uri}-${idx}`} style={styles.selectedPreviewCard}>
                          <Image source={{ uri }} style={styles.selectedPreviewImg} />
                          <View style={styles.selectedOrderBadge}>
                            <Text style={styles.selectedOrderText}>
                              {isSelectedVideo ? 'Video' : `${idx + 1}/${selectedMediaUrls.length}`}
                            </Text>
                          </View>
                          {selectedMediaUrls.length > 1 && (
                            <TouchableOpacity
                              style={styles.removeSelectedMediaBtn}
                              onPress={() =>
                                setSelectedMediaUrls((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <Feather name="x" size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.label}>
                  Hoặc chạm để chọn nhanh ảnh / video mẫu có sẵn
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaGalleryScroll}
                  contentContainerStyle={styles.mediaGalleryContent}
                >
                  {SAMPLE_UPLOAD_GALLERY.map((item) => {
                    const isVideoItem = item.type === 'video';
                    const idx = !isSelectedVideo ? selectedMediaUrls.indexOf(item.url) : -1;
                    const isSelected = isVideoItem
                      ? isSelectedVideo && selectedMediaUrls[0] === item.url
                      : idx !== -1;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.mediaPickCard,
                          isSelected && {
                            borderColor: theme.primary,
                            borderWidth: 2.5,
                          },
                        ]}
                        onPress={() => toggleSampleMediaItem(item.url, isVideoItem)}
                      >
                        <Image source={{ uri: item.url }} style={styles.mediaPickImg} />
                        {isSelected && !isVideoItem && (
                          <View
                            style={[
                              styles.mediaPickCheck,
                              { backgroundColor: theme.primary },
                            ]}
                          >
                            <Text style={styles.mediaPickOrderText}>{idx + 1}</Text>
                          </View>
                        )}
                        {isVideoItem && (
                          <View style={styles.videoDurationPill}>
                            <Feather name="video" size={10} color="#FFFFFF" />
                            <Text style={styles.videoDurationText}>Video</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.label}>Nội dung chia sẻ</Text>
                <TextInput
                  style={[styles.input, { height: 84, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Chia sẻ khoảnh khắc đáng yêu của bé..."
                  placeholderTextColor="#A3968A"
                  value={postCaption}
                  onChangeText={setPostCaption}
                />

                <Text style={styles.label}>Hashtag (Nhập tự do hoặc chọn gợi ý bên dưới)</Text>
                <View style={styles.customHashtagRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Nhập hashtag tự do (VD: #CorgiThuDuc)..."
                    placeholderTextColor="#A3968A"
                    value={customHashtagDraft}
                    onChangeText={setCustomHashtagDraft}
                    onSubmitEditing={handleAddCustomHashtag}
                  />
                  <TouchableOpacity
                    style={[styles.addHashtagBtn, { backgroundColor: theme.primary }]}
                    onPress={handleAddCustomHashtag}
                  >
                    <Feather name="plus" size={15} color="#FFFFFF" />
                    <Text style={styles.addHashtagBtnText}>Thêm</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.hashtagWrap, { marginTop: 10 }]}>
                  {Array.from(new Set([...selectedHashtags, ...SUGGESTED_HASHTAGS])).map((tag) => {
                    const active = selectedHashtags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.hashtagChip,
                          active && {
                            backgroundColor: theme.primarySoft,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => toggleHashtag(tag)}
                      >
                        <Text
                          style={[
                            styles.hashtagChipText,
                            active && { color: theme.primary, fontWeight: '800' },
                          ]}
                        >
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    createPost({
                      content: postCaption,
                      tags: selectedHashtags,
                      mediaUrls: selectedMediaUrls,
                      mediaType: isSelectedVideo ? 'video' : 'image',
                    });
                    setPostCaption('');
                  }}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Đăng bài lên Khám phá</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODAL 2: MY SETTINGS (PRIVATE PROFILE TOGGLE + SINGLE DEVICE + THEME + PLUS + LOGOUT) */}
            {activeModal === 'my_settings' && (
              <View style={{ gap: 14 }}>
                <View style={styles.settingSectionCard}>
                  <View style={styles.settingRowBetween}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <View style={styles.settingTitleRow}>
                        <Feather name="lock" size={15} color={theme.primary} />
                        <Text style={styles.settingTitle}>Chế độ Tài khoản Riêng tư</Text>
                      </View>
                      <Text style={styles.settingDesc}>
                        Khi bật, chỉ bạn bè đã kết bạn mới xem được bài viết và danh sách thú cưng của bạn.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.switchPill,
                        isPrivateProfile && { backgroundColor: theme.primary },
                      ]}
                      onPress={togglePrivateProfile}
                    >
                      <Text
                        style={[
                          styles.switchPillText,
                          isPrivateProfile && { color: '#FFFFFF' },
                        ]}
                      >
                        {isPrivateProfile ? 'Đang Bật' : 'Đang Tắt'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingSectionCard}>
                  <View style={styles.settingTitleRow}>
                    <Feather name="smartphone" size={15} color="#2E7D5B" />
                    <Text style={styles.settingTitle}>
                      Bảo mật Đăng nhập 1 Thiết bị duy nhất
                    </Text>
                  </View>
                  <Text style={styles.settingDesc}>
                    Thiết bị: {activeDeviceName} ({activeDeviceSessionId}). Tài khoản chỉ được đăng nhập trên 1 thiết bị tại một thời điểm.
                  </Text>
                  <TouchableOpacity
                    style={styles.revokeDeviceBtn}
                    onPress={forceRevokeOtherDevices}
                  >
                    <Feather name="shield" size={14} color="#2E7D5B" />
                    <Text style={styles.revokeDeviceBtnText}>
                      Làm mới phiên & Đăng xuất mọi thiết bị khác
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.settingSectionCard}>
                  <Text style={styles.settingTitle}>Màu sắc giao diện cá nhân hóa</Text>
                  <View style={[styles.twoCol, { marginTop: 10, flexWrap: 'wrap' }]}>
                    {(Object.keys(THEME_PALETTES) as ThemePresetId[]).map((id) => {
                      const t = THEME_PALETTES[id];
                      const active = themeId === id;
                      return (
                        <TouchableOpacity
                          key={id}
                          style={[
                            styles.themePickCard,
                            active && {
                              borderColor: t.primary,
                              backgroundColor: '#FAF7F2',
                            },
                          ]}
                          onPress={() => setThemeId(id)}
                        >
                          <View style={[styles.themeColorDot, { backgroundColor: t.primary }]} />
                          <Text style={styles.themePickText}>{t.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                

                <TouchableOpacity
                  style={styles.settingNavRow}
                  onPress={() => setActiveModal('tinder_setup')}
                >
                  <View style={styles.settingTitleRow}>
                    <Feather name="heart" size={16} color={theme.primary} />
                    <Text style={styles.settingTitle}>Thiết lập Hồ sơ Kết nối</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#8E8074" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutFullBtn}
                  onPress={() => {
                    setActiveModal(null);
                    logoutUser();
                  }}
                >
                  <Feather name="log-out" size={16} color="#C9302C" />
                  <Text style={styles.logoutFullBtnText}>Đăng xuất khỏi thiết bị này</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODAL 3: USER TINDER SETUP PROFILE */}
            {activeModal === 'tinder_setup' && (
              <View>
                <Text style={styles.subHintText}>
                  Thiết lập thông tin cá nhân & phong cách sống hiển thị trên thẻ của bạn ở mục Kết nối.
                </Text>

                <View style={styles.twoCol}>
                  <View style={{ width: 100 }}>
                    <Text style={styles.label}>Tuổi của bạn</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={tinderAgeInput}
                      onChangeText={setTinderAgeInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.twoCol}>
                      {(['Nữ', 'Nam'] as const).map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[
                            styles.chipBtn,
                            tinderGenderInput === g && {
                              backgroundColor: theme.primary,
                              borderColor: theme.primary,
                            },
                          ]}
                          onPress={() => setTinderGenderInput(g)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              tinderGenderInput === g && { color: '#FFFFFF' },
                            ]}
                          >
                            {g}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>Đang tìm kiếm (Hiển thị nổi bật)</Text>
                <TextInput
                  style={styles.input}
                  value={tinderLookingForInput}
                  onChangeText={setTinderLookingForInput}
                  placeholder="VD: Tìm bạn dắt thú cưng đi dạo & Hẹn hò cà phê"
                />

                <Text style={styles.label}>Bạn có hay hút thuốc không?</Text>
                <TextInput
                  style={styles.input}
                  value={tinderSmokingInput}
                  onChangeText={setTinderSmokingInput}
                  placeholder="VD: Không hút thuốc / Đang cố gắng bỏ"
                />

                <Text style={styles.label}>Thói quen tập luyện</Text>
                <TextInput
                  style={styles.input}
                  value={tinderWorkoutInput}
                  onChangeText={setTinderWorkoutInput}
                  placeholder="VD: Hằng ngày / Thỉnh thoảng"
                />

                <Text style={styles.label}>Về việc uống bia rượu</Text>
                <TextInput
                  style={styles.input}
                  value={tinderDrinkingInput}
                  onChangeText={setTinderDrinkingInput}
                  placeholder="VD: Uống giao lưu vào cuối tuần / Không uống"
                />

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Cung hoàng đạo</Text>
                    <TextInput
                      style={styles.input}
                      value={tinderZodiacInput}
                      onChangeText={setTinderZodiacInput}
                      placeholder="VD: Thiên Bình"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Phong cách trò chuyện</Text>
                    <TextInput
                      style={styles.input}
                      value={tinderChatStyleInput}
                      onChangeText={setTinderChatStyleInput}
                      placeholder="VD: Nghiện nhắn tin"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    updateUserTinderSetup({
                      age: parseInt(tinderAgeInput, 10) || 25,
                      gender: tinderGenderInput,
                      lookingFor: tinderLookingForInput,
                      smoking: tinderSmokingInput,
                      workout: tinderWorkoutInput,
                      drinking: tinderDrinkingInput,
                      zodiac: tinderZodiacInput,
                      chatStyle: tinderChatStyleInput,
                      promptQuote: userTinderSetup.promptQuote,
                    });
                    setActiveModal(null);
                  }}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Lưu Hồ sơ Kết nối</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODAL 4: REDESIGNED PAWTY PLUS & GOLD PLANS */}
            {activeModal === 'vip_upgrade' && (
              <View style={{ gap: 12 }}>
                <Text style={styles.subHintText}>
                  Mọi tài khoản đều được nuôi tối đa 3 bé thú cưng miễn phí. Nâng cấp Plus hoặc Gold để mở khóa đặc quyền Kết nối (Tinder) và ưu tiên đặt lịch dịch vụ.
                </Text>

                {vipPlans.map((plan) => {
                  const isCurrent = activeVipPlanId === plan.id && isVip;
                  return (
                    <View
                      key={plan.id}
                      style={[
                        styles.cleanPlanCard,
                        isCurrent && {
                          borderColor: theme.primary,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <View style={styles.cleanPlanTopRow}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.planTitleBadgeRow}>
                            <Text style={[styles.cleanPlanName, { color: plan.highlightColor }]}>
                              {plan.name}
                            </Text>
                            <View
                              style={[
                                styles.popularBadge,
                                { backgroundColor: theme.primarySoft },
                              ]}
                            >
                              <Text style={[styles.popularBadgeText, { color: theme.primary }]}>
                                {plan.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cleanPlanPrice}>
                            {plan.priceLabel} · {plan.durationLabel}
                          </Text>
                        </View>
                        {isCurrent && (
                          <View
                            style={[
                              styles.currentPlanTag,
                              { backgroundColor: theme.primarySoft },
                            ]}
                          >
                            <Text style={[styles.currentPlanTagText, { color: theme.primary }]}>
                              Đang dùng
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.cleanPlanBulletList}>
                        {plan.features.map((feat) => (
                          <Text key={feat} style={styles.cleanPlanBullet}>
                            • {feat}
                          </Text>
                        ))}
                      </View>

                      {!isCurrent && (
                        <TouchableOpacity
                          style={[
                            styles.selectPlanBtn,
                            { backgroundColor: plan.highlightColor || theme.primary },
                          ]}
                          onPress={() => selectAndActivateVipPlan(plan.id)}
                        >
                          <Text style={styles.selectPlanBtnText}>
                            Chọn gói {plan.name} ({plan.priceLabel})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* MODAL 5: EDIT OWNER & ACTIVE PET PROFILE (WITH DELETE PET) */}
            {activeModal === 'edit_profile' && (
              <View>
                <Text style={styles.label}>Ghi chú bong bóng trên ảnh đại diện (Instagram Note)</Text>
                <TextInput
                  style={styles.input}
                  value={editOwnerNote}
                  onChangeText={setEditOwnerNote}
                  placeholder="Hỏi bạn bè bất cứ điều gì..."
                />

                <Text style={styles.label}>Họ và tên của bạn</Text>
                <TextInput
                  style={styles.input}
                  value={editOwnerName}
                  onChangeText={setEditOwnerName}
                />

                <Text style={styles.label}>Khu vực sinh sống</Text>
                <TextInput
                  style={styles.input}
                  value={editOwnerArea}
                  onChangeText={setEditOwnerArea}
                />

                <Text style={styles.label}>Giới thiệu bản thân</Text>
                <TextInput
                  style={[styles.input, { height: 64, textAlignVertical: 'top' }]}
                  multiline
                  value={editOwnerBio}
                  onChangeText={setEditOwnerBio}
                />

                <Text style={[styles.label, { marginTop: 6 }]}>
                  Chỉnh sửa thú cưng đang chọn: {activePet.name}
                </Text>
                <View style={styles.twoCol}>
                  <TouchableOpacity
                    style={[
                      styles.chipBtn,
                      editPetSpecies === 'Chó' && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setEditPetSpecies('Chó')}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        editPetSpecies === 'Chó' && { color: '#FFFFFF' },
                      ]}
                    >
                      Loài Chó
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chipBtn,
                      editPetSpecies === 'Mèo' && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setEditPetSpecies('Mèo')}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        editPetSpecies === 'Mèo' && { color: '#FFFFFF' },
                      ]}
                    >
                      Loài Mèo
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Tên thú cưng</Text>
                    <TextInput
                      style={styles.input}
                      value={editPetName}
                      onChangeText={setEditPetName}
                    />
                  </View>
                  <View style={{ width: 110 }}>
                    <Text style={styles.label}>Cân nặng (kg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={editPetWeight}
                      onChangeText={setEditPetWeight}
                    />
                  </View>
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Giống loài</Text>
                    <TextInput
                      style={styles.input}
                      value={editPetBreed}
                      onChangeText={setEditPetBreed}
                    />
                  </View>
                  <View style={{ width: 110 }}>
                    <Text style={styles.label}>Độ tuổi</Text>
                    <TextInput
                      style={styles.input}
                      value={editPetAge}
                      onChangeText={setEditPetAge}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.unifiedTickBox,
                    editPetVaccinated && {
                      backgroundColor: '#EAF7F1',
                      borderColor: '#3E8E6C',
                    },
                  ]}
                  onPress={() => setEditPetVaccinated(!editPetVaccinated)}
                >
                  <View
                    style={[
                      styles.tickSquare,
                      editPetVaccinated && {
                        backgroundColor: '#3E8E6C',
                        borderColor: '#3E8E6C',
                      },
                    ]}
                  >
                    {editPetVaccinated && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tickTitle}>
                      Đã tiêm chủng & Phòng bệnh dại đầy đủ
                    </Text>
                    <Text style={styles.tickSub}>
                      Hiển thị dấu tích xanh trực tiếp trên hồ sơ của bé {editPetName}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setOwnerNoteBubble(editOwnerNote);
                    updateOwnerAndPetProfile({
                      ownerName: editOwnerName,
                      ownerNickname: editOwnerNickname,
                      ownerBio: editOwnerBio,
                      ownerArea: editOwnerArea,
                      isPrivateProfile,
                      petId: activePet.id,
                      petName: editPetName,
                      petSpecies: editPetSpecies,
                      petBreed: editPetBreed,
                      petGender: editPetGender,
                      petBirthDate: activePet.birthDate,
                      petAgeLabel: editPetAge,
                      petWeightKg: parseFloat(editPetWeight) || activePet.weightKg,
                      petFurColor: activePet.furColor,
                      petMicrochipOrMark: activePet.microchipOrMark,
                      petFavoriteFood: activePet.favoriteFood,
                      petAllergies: activePet.allergies,
                      petIsVaccinatedAndRabies: editPetVaccinated,
                      petGoodHabits: activePet.goodHabits,
                      petCautionHabits: activePet.cautionHabits,
                    });
                  }}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Lưu hồ sơ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deletePetModalBtn}
                  onPress={() => {
                    deletePetProfile(activePet.id);
                    setActiveModal(null);
                  }}
                >
                  <Feather name="trash-2" size={15} color="#C9302C" />
                  <Text style={styles.deletePetModalBtnText}>
                    Xóa hồ sơ bé {activePet.name}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MODAL 7: NOTIFICATIONS */}
            {activeModal === 'notifications' && (
              <View style={{ gap: 10 }}>
                {notifications.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={[
                      styles.notifItem,
                      !n.isRead && {
                        backgroundColor: theme.primarySoft,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => markNotificationRead(n.id)}
                  >
                    <View style={styles.notifTopRow}>
                      <Text style={styles.optionTitle}>{n.title}</Text>
                      <Text style={styles.notifTime}>{n.timeLabel}</Text>
                    </View>
                    <Text style={styles.optionSub}>{n.body}</Text>
                    {n.type === 'friend_request' && n.actionPayload?.status === 'pending' && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: theme.primary,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                          onPress={() => n.actionPayload?.senderHandle && acceptFriendRequest(n.actionPayload.senderHandle, n.id)}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                            Chấp nhận
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#ECE6DF',
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                          onPress={() => n.actionPayload?.senderHandle && declineFriendRequest(n.actionPayload.senderHandle, n.id)}
                        >
                          <Text style={{ color: '#5C5046', fontSize: 12, fontWeight: '700' }}>
                            Từ chối
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {n.type === 'new_post' && (
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          alignSelf: 'flex-start',
                          backgroundColor: theme.primarySoft,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                        onPress={() => {
                          setActiveModal(null);
                          setActiveTab('explore');
                        }}
                      >
                        <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>
                          Xem bài viết ngay →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 24, 21, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F5F1EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
    marginBottom: 6,
  },
  subHintText: {
    fontSize: 12,
    color: '#7A6E63',
    marginBottom: 10,
    lineHeight: 17,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: '#2C2520',
    marginBottom: 12,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  deviceUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  deviceUploadBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deviceCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3EFEA',
    borderWidth: 1,
    borderColor: '#E2D9CE',
  },
  deviceCameraBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
  },
  selectedPreviewSection: {
    marginBottom: 12,
  },
  selectedMediaScroll: {
    gap: 10,
  },
  selectedPreviewCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EFE9E1',
  },
  selectedPreviewImg: {
    width: '100%',
    height: '100%',
  },
  selectedOrderBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(28, 24, 21, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedOrderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  removeSelectedMediaBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(201, 48, 44, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaGalleryScroll: {
    marginBottom: 14,
  },
  mediaGalleryContent: {
    gap: 8,
  },
  mediaPickCard: {
    width: 82,
    height: 82,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    position: 'relative',
  },
  mediaPickImg: {
    width: '100%',
    height: '100%',
  },
  mediaPickCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPickOrderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  videoDurationPill: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(28, 24, 21, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  videoDurationText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customHashtagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addHashtagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
  },
  addHashtagBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  hashtagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hashtagChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  hashtagChipText: {
    fontSize: 12,
    color: '#5C5046',
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  settingSectionCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  settingRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  settingDesc: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 4,
    lineHeight: 17,
  },
  switchPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#E5DDD3',
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A3F35',
  },
  revokeDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EAF7F1',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  revokeDeviceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  themePickCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5DDD3',
  },
  themeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themePickText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C2520',
  },
  settingNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  logoutFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FDF3F2',
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3D6D3',
  },
  logoutFullBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C9302C',
  },
  cleanPlanCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    gap: 10,
  },
  cleanPlanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cleanPlanName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1815',
  },
  cleanPlanPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C6055',
    marginTop: 2,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  currentPlanTag: {
    backgroundColor: '#ECE6DF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  currentPlanTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C2520',
  },
  cleanPlanBulletList: {
    gap: 4,
  },
  cleanPlanBullet: {
    fontSize: 12,
    color: '#4A3F35',
    lineHeight: 18,
  },
  selectPlanBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  selectPlanBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  optionSub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
  },
  lockedBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
    marginTop: 10,
    textAlign: 'center',
  },
  lockedSub: {
    fontSize: 12,
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 16,
  },
  likedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  matchSmallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  matchSmallBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  matchCenterBox: {
    alignItems: 'center',
    gap: 10,
  },
  matchAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  unifiedTickBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    marginBottom: 12,
  },
  tickSquare: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#C5B8AC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tickTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  tickSub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
  deletePetModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FDF3F2',
    marginTop: 10,
  },
  deletePetModalBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C9302C',
  },
  publicTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  publicAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  publicStatsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  publicStatItem: {
    alignItems: 'center',
  },
  publicStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2C2520',
  },
  publicStatLabel: {
    fontSize: 11,
    color: '#7A6E63',
  },
  publicName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
  },
  publicHandle: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
  },
  publicBio: {
    fontSize: 13,
    color: '#4A3F35',
    marginTop: 6,
    lineHeight: 19,
  },
  publicPetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF7F1',
    padding: 10,
    borderRadius: 12,
  },
  publicPetBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D5B',
    flex: 1,
  },
  publicActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  publicActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 12,
  },
  publicActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  notifItem: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#8E8074',
  },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 9, 0.96)',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 28,
  },
  lightboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  lightboxAuthor: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lightboxCounter: {
    fontSize: 12,
    color: '#C5B8AC',
    marginTop: 2,
  },
  lightboxBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  lightboxDismissHint: {
    fontSize: 11,
    color: '#A89F95',
    textAlign: 'center',
    marginTop: 6,
  },
  lightboxCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lightboxSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxMainImage: {
    width: SCREEN_WIDTH,
    height: '82%',
  },
  lightboxVideoTag: {
    position: 'absolute',
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46, 125, 91, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
  },
  lightboxVideoTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lightboxThumbRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  lightboxThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    opacity: 0.85,
  },
  lightboxFooter: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  lightboxCaption: {
    fontSize: 13,
    color: '#ECE6DF',
    lineHeight: 19,
    textAlign: 'center',
  },
  viewFullProfileBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: '#E8DED1',
  },
  viewFullProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3D342C',
  },
  notifActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  notifActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  igFullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  igTopAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F0EBE3',
    backgroundColor: '#FFFFFF',
  },
  igBackBtn: {
    padding: 6,
    marginLeft: -6,
  },
  igHeaderUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  igHeaderUsername: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1815',
  },
  igHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  igHeaderActionBtn: {
    padding: 4,
  },
  igProfileHeaderSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  igAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  igAvatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  igProfileAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  igStatsColumnsWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  igStatCol: {
    alignItems: 'center',
  },
  igStatNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1815',
  },
  igStatText: {
    fontSize: 12,
    color: '#6B5E52',
    marginTop: 2,
    fontWeight: '500',
  },
  igNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  igFullNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1815',
  },
  igNicknameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  igNicknameText: {
    fontSize: 11,
    fontWeight: '700',
  },
  igLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  igLocationText: {
    fontSize: 12,
    color: '#7A6E63',
    fontWeight: '500',
  },
  igBioTextContent: {
    fontSize: 13,
    color: '#382F27',
    lineHeight: 18,
    marginTop: 6,
  },
  igActionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  igMainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  igBtnFollow: {
    backgroundColor: '#1C1815',
  },
  igBtnFollowing: {
    backgroundColor: '#EFEAE2',
    borderWidth: 1,
    borderColor: '#DDD5CA',
  },
  igBtnFriendDefault: {
    backgroundColor: '#EFEAE2',
    borderWidth: 1,
    borderColor: '#DDD5CA',
  },
  igBtnFriendPending: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  igBtnFriendAccepted: {
    backgroundColor: '#EAF7F1',
    borderWidth: 1,
    borderColor: '#C7EED8',
  },
  igMainBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  igDirectChatBtn: {
    width: 40,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFEAE2',
    borderWidth: 1,
    borderColor: '#DDD5CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igHighlightsSection: {
    paddingVertical: 14,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F0EBE3',
  },
  igHighlightItem: {
    alignItems: 'center',
    width: 72,
  },
  igHighlightRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  igHighlightCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#FDFBF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  igVaccineVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2E7D5B',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  igHighlightName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1815',
    marginTop: 6,
  },
  igHighlightMeta: {
    fontSize: 10,
    color: '#8A7A6E',
    marginTop: 1,
  },
  igMediaTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  igMediaTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
  },
  igMediaTabActive: {
    borderBottomWidth: 1.8,
    borderBottomColor: '#1C1815',
  },
  igGridPhotoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  igGridCell: {
    width: SCREEN_WIDTH / 3,
    height: SCREEN_WIDTH / 3,
    padding: 0.75,
  },
  igGridCellImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5EFE6',
  },
});