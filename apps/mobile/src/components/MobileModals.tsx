import React, { useEffect, useMemo, useState } from 'react';
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
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from './FeatherIcon';
import { SelectorPickerModal, ConfirmActionModal } from './SelectorFieldModal';
import {
  useMobilePawty,
} from '../context/MobilePawtyContext';
import { apiClient } from '../services/apiClient';
import { resolveLocalMediaUrls } from '../utils/mediaUtils';
import {
  SUGGESTED_HASHTAGS,
  TINDER_PURPOSE_OPTIONS,
  TinderIntent,
  resolveTinderIntentFromLabel,
  getTinderPurposeLabel,
  OWNER_AGE_OPTIONS,
  ZODIAC_OPTIONS,
  SMOKING_OPTIONS,
  WORKOUT_OPTIONS,
  DRINKING_OPTIONS,
  CHAT_STYLE_OPTIONS,
  LIVING_AREA_OPTIONS,
  POPULAR_DOG_BREEDS,
  POPULAR_CAT_BREEDS,
  PET_AGE_OPTIONS,
  PET_WEIGHT_OPTIONS,
  OTHER_SPECIES_OPTIONS,
  MobileNotificationItem,
} from '../types/mobileTypes';

const SCREEN_WIDTH = Dimensions.get('window').width;

type NotificationFilterTab = 'all' | 'friend' | 'follow' | 'sos';

function getNotificationBadgeMeta(n: MobileNotificationItem): {
  icon: string;
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (n.type) {
    case 'friend_request':
      return {
        icon: 'user-plus',
        label: 'Lời mời kết bạn',
        bgColor: '#FFF0ED',
        textColor: '#D9534F',
      };
    case 'friend_accepted':
      return {
        icon: 'user-check',
        label: 'Đã kết bạn',
        bgColor: '#EAF7F1',
        textColor: '#2E7D5B',
      };
    case 'match':
    case 'tinder':
      return {
        icon: 'heart',
        label: 'Tương hợp mới',
        bgColor: '#FDECEF',
        textColor: '#D6456B',
      };
    case 'follow':
      return {
        icon: 'users',
        label: 'Theo dõi mới',
        bgColor: '#EEF4FC',
        textColor: '#2E66A6',
      };
    case 'sos_alert':
    case 'sos_sighting':
    case 'sos':
      return {
        icon: 'alert-triangle',
        label: 'Khẩn cấp SOS',
        bgColor: '#FDF2F2',
        textColor: '#C9302C',
      };
    case 'post_reaction':
    case 'post_comment':
    case 'new_post':
    case 'social':
      return {
        icon: 'message-circle',
        label: 'Tương tác bảng tin',
        bgColor: '#F5EFE6',
        textColor: '#6E5A47',
      };
    default:
      return {
        icon: 'bell',
        label: 'Hệ thống',
        bgColor: '#F2EFEA',
        textColor: '#5C5046',
      };
  }
}

function matchesNotificationTab(n: MobileNotificationItem, tab: NotificationFilterTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'friend') {
    return (
      n.category === 'friend' ||
      n.type === 'friend_request' ||
      n.type === 'friend_accepted' ||
      n.type === 'match' ||
      n.type === 'tinder'
    );
  }
  if (tab === 'follow') {
    return (
      n.category === 'follow' ||
      n.type === 'follow' ||
      n.type === 'post_reaction' ||
      n.type === 'post_comment' ||
      n.type === 'new_post' ||
      n.type === 'social'
    );
  }
  if (tab === 'sos') {
    return (
      n.category === 'sos' ||
      n.type === 'sos_alert' ||
      n.type === 'sos_sighting' ||
      n.type === 'sos'
    );
  }
  return true;
}

export const MobileModals: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);

  const {
    themeId,
    theme,
    activeModal,
    setActiveModal,
    ownerName,
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
    pets,
    activePetId,
    activePet,
    deletePetProfile,
    createPost,
    userTinderSetup,
    updateUserTinderSetup,
    openPublicUserProfile,
    acceptFriendRequest,
    declineFriendRequest,
    startDirectChatWithUser,
    setActiveTab,
    likesYouCandidates,
    likeBackCandidate,
    passLikesYouCandidate,
    showLikesYouDrawer,
    setShowLikesYouDrawer,
    matchedCandidateModal,
    closeMatchedCandidateModal,
    openChatWithMatchedCandidate,
    lightboxMedia,
    closeLightboxMedia,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    logoutUser,
    showToast,
  } = useMobilePawty();

  // 1. New Post Composer State (Device Gallery & Camera only — NO URL input)
  const [postCaption, setPostCaption] = useState('');
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);
  const [isSelectedVideo, setIsSelectedVideo] = useState(false);
  const [savedHashtags, setSavedHashtags] = useState<string[]>([
    '#KhoanhKhacThuCung',
    '#DiDaoChieu',
    '#BossDangYeu',
    '#ChamSocBoss',
    '#ChoMeoSaiGon',
  ]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([
    '#KhoanhKhacThuCung',
    '#DiDaoChieu',
  ]);
  const [customHashtagText, setCustomHashtagText] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // 2. Edit Owner & Active Pet Quick Modal State (Selector-first)
  const [editOwnerName, setEditOwnerName] = useState(ownerName);
  const [editOwnerBio, setEditOwnerBio] = useState(ownerBio);
  const [editOwnerArea, setEditOwnerArea] = useState(ownerArea);
  const [editOwnerNote, setEditOwnerNote] = useState(ownerNoteBubble);
  const [editPetName, setEditPetName] = useState(activePet.name);
  const [editPetSpecies, setEditPetSpecies] = useState<'Chó' | 'Mèo' | 'Khác'>(activePet.species);
  const [editPetCustomSpecies, setEditPetCustomSpecies] = useState(activePet.customSpecies || '');
  const [editPetBreed, setEditPetBreed] = useState(activePet.breed);
  const [editPetGender, setEditPetGender] = useState<'Đực' | 'Cái'>(activePet.gender);
  const [editPetAge, setEditPetAge] = useState(activePet.ageLabel || '1 tuổi');
  const [editPetWeight, setEditPetWeight] = useState(String(activePet.weightKg || '4.8'));
  const [editPetVaccinated, setEditPetVaccinated] = useState(activePet.isVaccinatedAndRabies);

  // 3. Tinder Setup State (Dedicated Dating Profile + Photos + Name + Bio + Pet + Purpose)
  const [tinderDisplayNameInput, setTinderDisplayNameInput] = useState(
    userTinderSetup.displayName || ownerName || ''
  );
  const [tinderBioInput, setTinderBioInput] = useState(userTinderSetup.bio || '');
  const [tinderDatingPetIdInput, setTinderDatingPetIdInput] = useState(
    userTinderSetup.datingPetId || activePetId || ''
  );
  const [tinderPhotosInput, setTinderPhotosInput] = useState<string[]>(
    Array.isArray(userTinderSetup.photos) && userTinderSetup.photos.length > 0
      ? userTinderSetup.photos
      : Array.isArray(userTinderSetup.photoUrls) && userTinderSetup.photoUrls.length > 0
        ? userTinderSetup.photoUrls
        : []
  );
  const [tinderAgeInput, setTinderAgeInput] = useState(String(userTinderSetup.age || 24));
  const [tinderGenderInput, setTinderGenderInput] = useState<'Nam' | 'Nữ' | 'Khác'>(
    userTinderSetup.gender || 'Nữ'
  );
  const [tinderIntentInput, setTinderIntentInput] = useState<TinderIntent>(
    resolveTinderIntentFromLabel(userTinderSetup.intent || userTinderSetup.lookingFor)
  );
  const [tinderSmokingInput, setTinderSmokingInput] = useState(userTinderSetup.smoking);
  const [tinderWorkoutInput, setTinderWorkoutInput] = useState(userTinderSetup.workout);
  const [tinderDrinkingInput, setTinderDrinkingInput] = useState(userTinderSetup.drinking);
  const [tinderZodiacInput, setTinderZodiacInput] = useState(userTinderSetup.zodiac);
  const [tinderChatStyleInput, setTinderChatStyleInput] = useState(userTinderSetup.chatStyle);
  const [tinderPromptInput, setTinderPromptInput] = useState(userTinderSetup.promptQuote || '');
  const [isSavingTinder, setIsSavingTinder] = useState(false);

  // 4. Notifications Filter & Confirm State
  const [notifFilterTab, setNotifFilterTab] = useState<NotificationFilterTab>('all');
  const [confirmClearNotifs, setConfirmClearNotifs] = useState(false);
  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

  // 5. Shared Selector Picker Modal State inside MobileModals
  const [selectorState, setSelectorState] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    selectedValue: '',
    onSelect: () => { },
  });

  // 6. Lightbox Index State
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    setEditOwnerName(ownerName);
    setEditOwnerBio(ownerBio);
    setEditOwnerArea(ownerArea);
    setEditOwnerNote(ownerNoteBubble);
    setEditPetName(activePet.name);
    setEditPetSpecies(activePet.species);
    setEditPetCustomSpecies(activePet.customSpecies || '');
    setEditPetBreed(activePet.breed);
    setEditPetGender(activePet.gender);
    setEditPetAge(activePet.ageLabel || '1 tuổi');
    setEditPetWeight(String(activePet.weightKg || '4.8'));
    setEditPetVaccinated(activePet.isVaccinatedAndRabies);
  }, [ownerName, ownerBio, ownerArea, ownerNoteBubble, activePet, activeModal]);

  useEffect(() => {
    setTinderDisplayNameInput(userTinderSetup.displayName || ownerName || '');
    setTinderBioInput(userTinderSetup.bio || '');
    setTinderDatingPetIdInput(userTinderSetup.datingPetId || activePetId || '');
    setTinderPhotosInput(
      Array.isArray(userTinderSetup.photos) && userTinderSetup.photos.length > 0
        ? userTinderSetup.photos
        : Array.isArray(userTinderSetup.photoUrls) && userTinderSetup.photoUrls.length > 0
          ? userTinderSetup.photoUrls
          : []
    );
    setTinderAgeInput(String(userTinderSetup.age || 24));
    setTinderGenderInput(userTinderSetup.gender || 'Nữ');
    setTinderIntentInput(
      resolveTinderIntentFromLabel(userTinderSetup.intent || userTinderSetup.lookingFor)
    );
    setTinderSmokingInput(userTinderSetup.smoking || SMOKING_OPTIONS[0]);
    setTinderWorkoutInput(userTinderSetup.workout || WORKOUT_OPTIONS[0]);
    setTinderDrinkingInput(userTinderSetup.drinking || DRINKING_OPTIONS[0]);
    setTinderZodiacInput(userTinderSetup.zodiac || ZODIAC_OPTIONS[4]);
    setTinderChatStyleInput(userTinderSetup.chatStyle || CHAT_STYLE_OPTIONS[0]);
    setTinderPromptInput(userTinderSetup.promptQuote || '');
  }, [userTinderSetup, activeModal]);

  useEffect(() => {
    if (lightboxMedia) {
      setLightboxIdx(lightboxMedia.initialIndex || 0);
    }
  }, [lightboxMedia]);

  const openSelector = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    setSelectorState({
      visible: true,
      title,
      options,
      selectedValue,
      onSelect,
    });
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomHashtag = () => {
    const raw = customHashtagText.trim();
    if (!raw) return;
    const cleanTag = raw.startsWith('#')
      ? `#${raw.slice(1).replace(/[\s\W]+/g, '')}`
      : `#${raw.replace(/[\s\W]+/g, '')}`;
    if (cleanTag.length <= 1) return;

    if (!savedHashtags.includes(cleanTag)) {
      setSavedHashtags((prev) => [cleanTag, ...prev]);
    }
    if (!selectedHashtags.includes(cleanTag)) {
      setSelectedHashtags((prev) => [...prev, cleanTag]);
    }
    setCustomHashtagText('');
    showToast(`Đã thêm hashtag ${cleanTag}`);
  };

  const handlePickTinderPhotos = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast('Vui lòng cấp quyền truy cập Thư viện ảnh để chọn ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        base64: true,
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedDataUrls = result.assets.map((asset) =>
          asset.base64
            ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
            : asset.uri
        );
        // Preview-first: lưu trực tiếp vào state cục bộ, tải lên Cloudinary khi ấn Lưu
        setTinderPhotosInput((prev) => [...prev, ...pickedDataUrls].slice(0, 6));
        showToast(`Đã chọn ${pickedDataUrls.length} ảnh thẻ kết nối!`);
      }
    } catch (err) {
      console.warn('[Tinder Photo Picker] Lỗi:', err);
      showToast('Không thể chọn ảnh từ thiết bị.');
    }
  };

  const handleRemoveTinderPhoto = (index: number) => {
    setTinderPhotosInput((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePickMediaFromDevice = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast('Vui lòng cấp quyền truy cập Thư viện ảnh để chọn ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 6,
        base64: true,
        quality: 0.45,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedDataUrls = result.assets.map((asset) =>
          asset.base64
            ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
            : asset.uri
        );
        // Preview-first: lưu trực tiếp vào state cục bộ, tải lên Cloudinary khi ấn Đăng bài
        setSelectedMediaUrls((prev) => [...prev, ...pickedDataUrls].slice(0, 8));
        setIsSelectedVideo(false);
        showToast(`Đã chọn ${pickedDataUrls.length} ảnh!`);
      }
    } catch (err) {
      console.warn('[Post Media Picker] Lỗi chọn ảnh:', err);
      showToast('Không thể mở thư viện ảnh trên thiết bị.');
    }
  };

  const handleCaptureCameraMedia = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        showToast('Vui lòng cấp quyền Máy ảnh để chụp ảnh khoảnh khắc.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.45,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const rawUrl = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        // Preview-first: hiển thị ảnh chụp ngay, tải lên Cloudinary khi ấn Đăng bài
        setSelectedMediaUrls((prev) => [rawUrl, ...prev].slice(0, 8));
        setIsSelectedVideo(false);
        showToast('Đã thêm ảnh chụp vào bài viết!');
      }
    } catch (err) {
      console.warn('[Post Camera] Lỗi chụp ảnh:', err);
      showToast('Không thể mở máy ảnh trên thiết bị.');
    }
  };

  const handleRemoveMediaAt = (index: number) => {
    setSelectedMediaUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setIsSelectedVideo(false);
      return next;
    });
  };

  const handleClearAllMedia = () => {
    setSelectedMediaUrls([]);
    setIsSelectedVideo(false);
    showToast('Đã xóa tất cả ảnh đã chọn.');
  };

  const handleSubmitNewPost = async () => {
    if (isSubmittingPost) return;
    setIsSubmittingPost(true);
    try {
      // Deferred Upload: Tải các ảnh preview cục bộ lên Cloudinary song song bằng Promise.all
      const resolvedMediaUrls = await resolveLocalMediaUrls(selectedMediaUrls, 'pawty/posts');
      const ok = await createPost({
        content: postCaption,
        tags: selectedHashtags,
        mediaUrls: resolvedMediaUrls,
        mediaType: isSelectedVideo ? 'video' : 'image',
        category: 'moment',
      });
      if (ok) {
        setPostCaption('');
        setSelectedMediaUrls([]);
        setIsSelectedVideo(false);
        // Lưu lại toàn bộ hashtag đã dùng vào danh sách lịch sử
        setSavedHashtags((prev) => Array.from(new Set([...selectedHashtags, ...prev])));
        showToast('Đã đăng bài viết mới thành công!');
      }
    } catch (err) {
      console.warn('[handleSubmitNewPost] Lỗi:', err);
      showToast('Không thể đăng bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const filteredNotifications = useMemo(
    () => notifications.filter((n) => matchesNotificationTab(n, notifFilterTab)),
    [notifications, notifFilterTab]
  );

  const notifCounts = useMemo(
    () => ({
      all: notifications.length,
      friend: notifications.filter((n) => matchesNotificationTab(n, 'friend')).length,
      follow: notifications.filter((n) => matchesNotificationTab(n, 'follow')).length,
      sos: notifications.filter((n) => matchesNotificationTab(n, 'sos')).length,
    }),
    [notifications]
  );

  // 1. FULLSCREEN SWIPEABLE MEDIA LIGHTBOX MODAL
  if (lightboxMedia) {
    const urls: string[] = Array.isArray(lightboxMedia.mediaUrls)
      ? lightboxMedia.mediaUrls.filter(Boolean)
      : [];

    if (urls.length === 0) {
      return null;
    }

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
                {lightboxMedia.authorName || 'Xem ảnh'}
              </Text>
              <Text style={styles.lightboxCounter}>
                {`Ảnh ${lightboxIdx + 1} / ${urls.length} · Vuốt ngang để xem tiếp`}
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
          </View>

          {urls.length > 1 && (
            <View style={styles.lightboxThumbRow}>
              {urls.map((u, idx) => (
                <TouchableOpacity key={`${idx}`} onPress={() => setLightboxIdx(idx)}>
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
            <TouchableOpacity
              activeOpacity={1}
              onPress={closeLightboxMedia}
              style={styles.lightboxFooter}
            >
              <Text style={styles.lightboxCaption} numberOfLines={3}>
                {lightboxMedia.caption}
              </Text>
              <Text style={styles.lightboxDismissHint}>Chạm vào màn hình để đóng</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={closeLightboxMedia}
              style={{ alignItems: 'center', paddingBottom: 12 }}
            >
              <Text style={styles.lightboxDismissHint}>Chạm vào màn hình để đóng</Text>
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
                {matchedCandidateModal.avatarUrl ? (
                  <Image
                    source={{ uri: matchedCandidateModal.avatarUrl }}
                    style={styles.matchAvatarLarge}
                  />
                ) : (
                  <View style={[styles.matchAvatarLarge, styles.avatarFallbackCircle]}>
                    <Feather name="heart" size={32} color={theme.primary} />
                  </View>
                )}
                <Text style={styles.publicName}>
                  Bạn và {matchedCandidateModal.ownerName} đã tương hợp!
                </Text>
                <Text style={[styles.subHintText, { textAlign: 'center' }]}>
                  {matchedCandidateModal.pets.length > 0
                    ? `Các bé ${matchedCandidateModal.pets.map((p) => p.name).join(' & ')} đã sẵn sàng làm quen cùng bé nhà bạn. Thông báo Match cũng đã được lưu vào Trung tâm Thông báo.`
                    : 'Cả hai đã trở thành bạn bè trên Pawty và có thể nhắn tin ngay!'}
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary, width: '100%' }]}
                  onPress={() => openChatWithMatchedCandidate(matchedCandidateModal)}
                >
                  <Feather name="message-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Nhắn tin làm quen ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryOutlineBtn}
                  onPress={() => {
                    const targetHandle = matchedCandidateModal.ownerHandle;
                    closeMatchedCandidateModal();
                    openPublicUserProfile(targetHandle);
                  }}
                >
                  <Feather name="user" size={15} color="#4A3F35" />
                  <Text style={styles.secondaryOutlineBtnText}>Xem trang cá nhân</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // 3. LIKES YOU DRAWER MODAL (100% FREE — UNLOCKED FOR ALL MEMBERS)
  if (showLikesYouDrawer) {
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="heart" size={18} color={theme.primary} />
                <Text style={styles.sheetTitle}>
                  Ai đã thích bạn ({likesYouCandidates.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLikesYouDrawer(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={18} color="#5C5046" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.sheetBody}
              showsVerticalScrollIndicator={false}
            >
              {likesYouCandidates.length === 0 ? (
                <View style={styles.emptyCenterBox}>
                  <View style={styles.emptyIconCircle}>
                    <Feather name="heart" size={26} color={theme.primary} />
                  </View>
                  <Text style={styles.emptyBoxTitle}>Chưa có lượt thích mới</Text>
                  <Text style={styles.emptyBoxSub}>
                    Khi có chủ nuôi quẹt phải hồ sơ của bạn trên Radar Kết nối, danh sách sẽ hiển thị miễn phí tại đây để bạn thích lại ngay.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <Text style={styles.subHintText}>
                    Chạm vào ảnh/tên để xem trang cá nhân đồng nhất hoặc nhấn Thích lại để kết nối trò chuyện ngay.
                  </Text>
                  {likesYouCandidates.map((item) => (
                    <View key={item.id} style={styles.likesYouCard}>
                      <TouchableOpacity
                        style={styles.likesYouTopTouch}
                        activeOpacity={0.8}
                        onPress={() => {
                          setShowLikesYouDrawer(false);
                          openPublicUserProfile(item.ownerHandle);
                        }}
                      >
                        {item.avatarUrl ? (
                          <Image source={{ uri: item.avatarUrl }} style={styles.likedAvatar} />
                        ) : (
                          <View style={[styles.likedAvatar, styles.avatarFallbackCircle]}>
                            <Feather name="user" size={20} color="#7A6E63" />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.optionTitle}>
                              {item.ownerName}, {item.ownerAge}
                            </Text>
                            <Text style={styles.distanceBadgeText}>
                              · {item.distanceKm} km
                            </Text>
                          </View>
                          <Text style={styles.purposeInlineTag} numberOfLines={1}>
                            {item.lookingFor}
                          </Text>
                          <Text style={styles.optionSub} numberOfLines={1}>
                            {item.pets.length > 0
                              ? `Boss: ${item.pets.map((p) => `${p.name} (${p.breed})`).join(', ')}`
                              : item.area || 'Cư dân yêu thú cưng'}
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={16} color="#9A8D82" />
                      </TouchableOpacity>

                      <View style={styles.likesYouActionRow}>
                        <TouchableOpacity
                          style={styles.passOutlineBtn}
                          onPress={() => passLikesYouCandidate(item)}
                        >
                          <Feather name="x" size={14} color="#6E6257" />
                          <Text style={styles.passOutlineBtnText}>Bỏ qua</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.likeBackPrimaryBtn, { backgroundColor: theme.primary }]}
                          onPress={() => likeBackCandidate(item)}
                        >
                          <Feather name="heart" size={14} color="#FFFFFF" />
                          <Text style={styles.likeBackPrimaryBtnText}>Thích lại & Kết nối</Text>
                        </TouchableOpacity>
                      </View>
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

  const modalTitleMap: Record<string, string> = {
    new_moment: 'Đăng bài lên Khám phá',
    my_settings: 'Cài đặt & Bảo mật',
    tinder_setup: 'Hồ sơ Hẹn hò & Kết nối',
    edit_profile: 'Chỉnh sửa nhanh Hồ sơ',
    notifications: 'Tin vui',
  };

  if (!activeModal || !modalTitleMap[activeModal]) return null;

  const titleText = modalTitleMap[activeModal];

  return (
    <Modal
      visible={Boolean(activeModal)}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={[styles.sheet, { paddingBottom: bottomInset + 18 }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{titleText}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#5C5046" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.sheetBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* =============================================================== */}
            {/* MODAL 1: NEW POST COMPOSER (NO URL INPUT, MULTI-PHOTO + DB)     */}
            {/* =============================================================== */}
            {activeModal === 'new_moment' && (
              <View>
                <Text style={styles.label}>Hình ảnh đính kèm (Chọn nhiều ảnh hoặc chụp mới)</Text>
                <View style={styles.twoCol}>
                  <TouchableOpacity
                    style={[
                      styles.deviceUploadBtn,
                      {
                        borderColor: theme.primary,
                        backgroundColor: theme.primarySoft,
                      },
                    ]}
                    onPress={handlePickMediaFromDevice}
                    activeOpacity={0.85}
                  >
                    <Feather name="image" size={16} color={theme.primary} />
                    <Text style={[styles.deviceUploadBtnText, { color: theme.primary }]}>
                      Chọn ảnh từ máy
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deviceCameraBtn}
                    onPress={handleCaptureCameraMedia}
                    activeOpacity={0.85}
                  >
                    <Feather name="camera" size={16} color="#2C2520" />
                    <Text style={styles.deviceCameraBtnText}>Chụp ảnh</Text>
                  </TouchableOpacity>
                </View>

                {selectedMediaUrls.length > 0 && (
                  <View style={styles.selectedPreviewSection}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Text style={styles.label}>
                        Đã chọn ({selectedMediaUrls.length}/8 ảnh)
                      </Text>
                      <TouchableOpacity onPress={handleClearAllMedia}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#C9302C' }}>
                          Xóa tất cả
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.selectedMediaScroll}
                    >
                      {selectedMediaUrls.map((uri, idx) => (
                        <View key={`sel-${idx}`} style={styles.selectedPreviewCard}>
                          <Image source={{ uri }} style={styles.selectedPreviewImg} />
                          <View style={styles.selectedOrderBadge}>
                            <Text style={styles.selectedOrderText}>Ảnh {idx + 1}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removeSelectedMediaBtn}
                            onPress={() => handleRemoveMediaAt(idx)}
                          >
                            <Feather name="x" size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Nội dung chia sẻ</Text>
                  <Text style={styles.counterText}>{postCaption.length}/500</Text>
                </View>
                <TextInput
                  style={[styles.input, { height: 92, textAlignVertical: 'top' }]}
                  multiline
                  maxLength={500}
                  placeholder="Chia sẻ khoảnh khắc đáng yêu hoặc câu chuyện của bé..."
                  placeholderTextColor="#A3968A"
                  value={postCaption}
                  onChangeText={setPostCaption}
                />

                <Text style={styles.label}>Chủ đề Hashtag (Chọn hoặc tự nhập thêm)</Text>

                {/* Custom Hashtag Input Row */}
                <View style={styles.customHashtagRow}>
                  <TextInput
                    style={styles.customHashtagInput}
                    placeholder="Nhập hashtag mới (VD: #CorgiBeo)..."
                    placeholderTextColor="#A3968A"
                    value={customHashtagText}
                    onChangeText={setCustomHashtagText}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleAddCustomHashtag}
                  />
                  <TouchableOpacity
                    style={[styles.customHashtagAddBtn, { backgroundColor: theme.primary }]}
                    onPress={handleAddCustomHashtag}
                  >
                    <Feather name="plus" size={14} color="#FFFFFF" />
                    <Text style={styles.customHashtagAddBtnText}>Thêm</Text>
                  </TouchableOpacity>
                </View>

                {/* Saved & Suggested Hashtags Chips */}
                <View style={styles.hashtagWrap}>
                  {savedHashtags.map((tag) => {
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
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: theme.primary, opacity: isSubmittingPost ? 0.7 : 1 },
                  ]}
                  disabled={isSubmittingPost}
                  onPress={handleSubmitNewPost}
                >
                  {isSubmittingPost ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="send" size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.primaryBtnText}>
                    {isSubmittingPost ? 'Đang đăng bài...' : 'Đăng bài lên Khám phá'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* =============================================================== */}
            {/* MODAL 2: MY SETTINGS (ZERO VIP — ALL FEATURES FREE)             */}
            {/* =============================================================== */}
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
                        Khi bật, chỉ bạn bè đã kết bạn mới có thể nhắn tin và xem đầy đủ hoạt động của bạn.
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
                    <Text style={styles.settingTitle}>Bảo mật phiên thiết bị</Text>
                  </View>
                  <Text style={styles.settingDesc}>
                    Thiết bị hiện tại: {activeDeviceName} ({activeDeviceSessionId})
                  </Text>
                  <TouchableOpacity
                    style={styles.revokeDeviceBtn}
                    onPress={forceRevokeOtherDevices}
                  >
                    <Feather name="shield" size={14} color="#2E7D5B" />
                    <Text style={styles.revokeDeviceBtnText}>
                      Làm mới phiên & Đăng xuất thiết bị khác
                    </Text>
                  </TouchableOpacity>
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
                  onPress={() => setConfirmLogoutVisible(true)}
                >
                  <Feather name="log-out" size={16} color="#C9302C" />
                  <Text style={styles.logoutFullBtnText}>Đăng xuất khỏi thiết bị này</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* =============================================================== */}
            {/* MODAL 3: USER TINDER SETUP (1-TO-1 PURPOSE + SELECTOR INPUTS)   */}
            {/* =============================================================== */}
            {activeModal === 'tinder_setup' && (
              <View>
                <Text style={styles.subHintText}>
                  Hồ sơ Hẹn hò hoạt động hoàn toàn độc lập với Hồ sơ Con sen. Bạn có thể đặt biệt danh riêng, bộ ảnh thẻ hẹn hò riêng, lời giới thiệu riêng và chọn Boss đồng hành dắt dạo.
                </Text>

                {/* BỘ ẢNH THẺ HẸN HÒ */}
                <Text style={styles.label}>Bộ ảnh thẻ Hẹn hò (Ảnh đầu làm ảnh đại diện)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  <TouchableOpacity
                    style={styles.tinderAddPhotoBtn}
                    onPress={handlePickTinderPhotos}
                    activeOpacity={0.8}
                  >
                    <Feather name="plus-circle" size={24} color={theme.primary} />
                    <Text style={styles.tinderAddPhotoText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                  {tinderPhotosInput.map((photo, idx) => (
                    <View key={`${photo}-${idx}`} style={styles.tinderPhotoThumbWrap}>
                      <Image source={{ uri: photo }} style={styles.tinderPhotoThumb} />
                      {idx === 0 && (
                        <View style={styles.tinderPrimaryPhotoBadge}>
                          <Text style={styles.tinderPrimaryPhotoText}>Đại diện</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.tinderDeletePhotoBtn}
                        onPress={() => handleRemoveTinderPhoto(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="x" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                {/* TÊN HIỂN THỊ TRÊN THẺ HẸN HÒ */}
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Tên / Biệt danh hiển thị Hẹn hò *</Text>
                  <Text style={styles.counterText}>{tinderDisplayNameInput.length}/35</Text>
                </View>
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  maxLength={35}
                  value={tinderDisplayNameInput}
                  onChangeText={setTinderDisplayNameInput}
                  placeholder="VD: Minh Anh, Candy, Alex..."
                  placeholderTextColor="#A3968A"
                />

                {/* LỜI GIỚI THIỆU HẸN HÒ */}
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Giới thiệu Hẹn hò & Đi dạo</Text>
                  <Text style={styles.counterText}>{tinderBioInput.length}/200</Text>
                </View>
                <TextInput
                  style={[styles.input, { height: 68, textAlignVertical: 'top', marginBottom: 12 }]}
                  multiline
                  maxLength={200}
                  value={tinderBioInput}
                  onChangeText={setTinderBioInput}
                  placeholder="Chia sẻ tính cách, thời gian rảnh hoặc điều bạn tìm kiếm ở bạn dắt dạo..."
                  placeholderTextColor="#A3968A"
                />

                {/* BÉ CƯNG ĐỒNG HÀNH TRÊN RADAR */}
                <Text style={styles.label}>Bé cưng đồng hành cùng bạn trên Radar</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  <TouchableOpacity
                    style={[
                      styles.chipBtn,
                      !tinderDatingPetIdInput && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setTinderDatingPetIdInput('')}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        !tinderDatingPetIdInput && { color: '#FFFFFF' },
                      ]}
                    >
                      Đi một mình (Không Boss)
                    </Text>
                  </TouchableOpacity>
                  {pets.map((p) => {
                    const isSelected = tinderDatingPetIdInput === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.chipBtn,
                          isSelected && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => setTinderDatingPetIdInput(p.id)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && { color: '#FFFFFF' },
                          ]}
                        >
                          {p.name} ({p.species})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* MỤC ĐÍCH TÌM KIẾM — CHỈ ĐƯỢC CHỌN 1 (SINGLE-SELECT) */}
                <Text style={styles.label}>Mục đích tìm kiếm của bạn (Chọn 1)</Text>
                <View style={{ gap: 8, marginBottom: 14 }}>
                  {TINDER_PURPOSE_OPTIONS.map((opt) => {
                    const isSelected = tinderIntentInput === opt.intent;
                    return (
                      <TouchableOpacity
                        key={opt.intent}
                        style={[
                          styles.purposeRadioCard,
                          isSelected && {
                            borderColor: theme.primary,
                            backgroundColor: theme.primarySoft,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setTinderIntentInput(opt.intent)}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text
                            style={[
                              styles.purposeRadioTitle,
                              isSelected && { color: theme.primary },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          <Text style={styles.purposeRadioDesc}>{opt.desc}</Text>
                        </View>
                        <Feather
                          name={isSelected ? 'check-circle' : 'circle'}
                          size={20}
                          color={isSelected ? theme.primary : '#C4B9AE'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* TUỔI & GIỚI TÍNH (SELECTOR) */}
                <View style={styles.twoCol}>
                  <View style={{ width: 115 }}>
                    <Text style={styles.label}>Độ tuổi</Text>
                    <TouchableOpacity
                      style={styles.selectorFieldBtn}
                      onPress={() =>
                        openSelector('Chọn độ tuổi của bạn', OWNER_AGE_OPTIONS, tinderAgeInput, (v) =>
                          setTinderAgeInput(v)
                        )
                      }
                    >
                      <Text style={styles.selectorFieldText}>{tinderAgeInput} tuổi</Text>
                      <Feather name="chevron-down" size={15} color="#7A6E63" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={[styles.twoCol, { marginBottom: 0 }]}>
                      {(['Nữ', 'Nam', 'Khác'] as const).map((g) => (
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

                {/* CUNG HOÀNG ĐẠO & PHONG CÁCH TRÒ CHUYỆN (SELECTOR) */}
                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Cung hoàng đạo</Text>
                    <TouchableOpacity
                      style={styles.selectorFieldBtn}
                      onPress={() =>
                        openSelector('Chọn cung hoàng đạo', ZODIAC_OPTIONS, tinderZodiacInput, (v) =>
                          setTinderZodiacInput(v)
                        )
                      }
                    >
                      <Text style={styles.selectorFieldText} numberOfLines={1}>
                        {tinderZodiacInput}
                      </Text>
                      <Feather name="chevron-down" size={15} color="#7A6E63" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Phong cách chat</Text>
                    <TouchableOpacity
                      style={styles.selectorFieldBtn}
                      onPress={() =>
                        openSelector(
                          'Chọn phong cách trò chuyện',
                          CHAT_STYLE_OPTIONS,
                          tinderChatStyleInput,
                          (v) => setTinderChatStyleInput(v)
                        )
                      }
                    >
                      <Text style={styles.selectorFieldText} numberOfLines={1}>
                        {tinderChatStyleInput}
                      </Text>
                      <Feather name="chevron-down" size={15} color="#7A6E63" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* LỐI SỐNG (ALL SELECTORS) */}
                <Text style={styles.label}>Thói quen vận động & Dắt dạo</Text>
                <TouchableOpacity
                  style={[styles.selectorFieldBtn, { marginBottom: 12 }]}
                  onPress={() =>
                    openSelector('Chọn thói quen vận động', WORKOUT_OPTIONS, tinderWorkoutInput, (v) =>
                      setTinderWorkoutInput(v)
                    )
                  }
                >
                  <Text style={styles.selectorFieldText}>{tinderWorkoutInput}</Text>
                  <Feather name="chevron-down" size={15} color="#7A6E63" />
                </TouchableOpacity>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Hút thuốc</Text>
                    <TouchableOpacity
                      style={styles.selectorFieldBtn}
                      onPress={() =>
                        openSelector('Thói quen hút thuốc', SMOKING_OPTIONS, tinderSmokingInput, (v) =>
                          setTinderSmokingInput(v)
                        )
                      }
                    >
                      <Text style={styles.selectorFieldText} numberOfLines={1}>
                        {tinderSmokingInput}
                      </Text>
                      <Feather name="chevron-down" size={15} color="#7A6E63" />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Đồ uống / Rượu bia</Text>
                    <TouchableOpacity
                      style={styles.selectorFieldBtn}
                      onPress={() =>
                        openSelector('Thói quen đồ uống', DRINKING_OPTIONS, tinderDrinkingInput, (v) =>
                          setTinderDrinkingInput(v)
                        )
                      }
                    >
                      <Text style={styles.selectorFieldText} numberOfLines={1}>
                        {tinderDrinkingInput}
                      </Text>
                      <Feather name="chevron-down" size={15} color="#7A6E63" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* TỰ MÔ TẢ NGẮN (CÓ GIỚI HẠN KÝ TỰ) */}
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Tự mô tả ngắn trên thẻ Kết nối</Text>
                  <Text style={styles.counterText}>{tinderPromptInput.length}/140</Text>
                </View>
                <TextInput
                  style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
                  multiline
                  maxLength={140}
                  value={tinderPromptInput}
                  onChangeText={setTinderPromptInput}
                  placeholder="Viết vài dòng ngắn giới thiệu bản thân & Boss khi hẹn đi dạo..."
                  placeholderTextColor="#A3968A"
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary, opacity: isSavingTinder ? 0.7 : 1 }]}
                  disabled={isSavingTinder}
                  onPress={async () => {
                    if (isSavingTinder) return;
                    setIsSavingTinder(true);
                    try {
                      // Deferred upload: tải các ảnh thẻ hẹn hò cục bộ lên Cloudinary song song
                      const resolvedPhotos = await resolveLocalMediaUrls(tinderPhotosInput, 'pawty/tinder');
                      setTinderPhotosInput(resolvedPhotos);
                      await updateUserTinderSetup({
                        displayName: tinderDisplayNameInput.trim(),
                        bio: tinderBioInput.trim(),
                        datingPetId: tinderDatingPetIdInput,
                        photos: resolvedPhotos,
                        photoUrls: resolvedPhotos,
                        age: parseInt(tinderAgeInput, 10) || 24,
                        gender: tinderGenderInput,
                        intent: tinderIntentInput,
                        lookingFor: getTinderPurposeLabel(tinderIntentInput),
                        smoking: tinderSmokingInput,
                        workout: tinderWorkoutInput,
                        drinking: tinderDrinkingInput,
                        zodiac: tinderZodiacInput,
                        chatStyle: tinderChatStyleInput,
                        promptQuote: tinderPromptInput.trim(),
                      });
                      showToast('Đã lưu hồ sơ kết nối thành công!');
                      setActiveModal(null);
                    } catch (err) {
                      console.warn('[Tinder Save] Lỗi:', err);
                      showToast('Không thể lưu hồ sơ kết nối. Vui lòng thử lại sau.');
                    } finally {
                      setIsSavingTinder(false);
                    }
                  }}
                >
                  {isSavingTinder ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.primaryBtnText}>
                    {isSavingTinder ? 'Đang lưu hồ sơ...' : 'Lưu Hồ sơ Kết nối'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* =============================================================== */}
            {/* MODAL 4: QUICK EDIT OWNER & PET (SELECTOR-FIRST)                */}
            {/* =============================================================== */}
            {activeModal === 'edit_profile' && (
              <View>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Ghi chú trên ảnh đại diện</Text>
                  <Text style={styles.counterText}>{editOwnerNote.length}/60</Text>
                </View>
                <TextInput
                  style={styles.input}
                  maxLength={60}
                  value={editOwnerNote}
                  onChangeText={setEditOwnerNote}
                  placeholder="Chia sẻ suy nghĩ ngắn..."
                />

                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Tên hiển thị</Text>
                  <Text style={styles.counterText}>{editOwnerName.length}/35</Text>
                </View>
                <TextInput
                  style={styles.input}
                  maxLength={35}
                  value={editOwnerName}
                  onChangeText={setEditOwnerName}
                />

                <Text style={styles.label}>Khu vực sinh sống</Text>
                <TouchableOpacity
                  style={[styles.selectorFieldBtn, { marginBottom: 12 }]}
                  onPress={() =>
                    openSelector('Chọn khu vực sinh sống', LIVING_AREA_OPTIONS, editOwnerArea, (v) =>
                      setEditOwnerArea(v)
                    )
                  }
                >
                  <Text style={styles.selectorFieldText} numberOfLines={1}>
                    {editOwnerArea || 'Chọn khu vực sinh sống...'}
                  </Text>
                  <Feather name="chevron-down" size={15} color="#7A6E63" />
                </TouchableOpacity>

                <View style={styles.labelBetweenRow}>
                  <Text style={styles.label}>Tự mô tả bản thân</Text>
                  <Text style={styles.counterText}>{editOwnerBio.length}/150</Text>
                </View>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                  multiline
                  maxLength={150}
                  value={editOwnerBio}
                  onChangeText={setEditOwnerBio}
                />

                {activePet.id ? (
                  <>
                    <Text style={[styles.label, { marginTop: 6 }]}>
                      Thú cưng đang chọn: {activePet.name}
                    </Text>
                    <View style={styles.twoCol}>
                      {(['Chó', 'Mèo', 'Khác'] as const).map((sp) => (
                        <TouchableOpacity
                          key={sp}
                          style={[
                            styles.chipBtn,
                            editPetSpecies === sp && {
                              backgroundColor: theme.primary,
                              borderColor: theme.primary,
                            },
                          ]}
                          onPress={() => {
                            setEditPetSpecies(sp);
                            if (sp === 'Chó') setEditPetBreed(POPULAR_DOG_BREEDS[0]);
                            else if (sp === 'Mèo') setEditPetBreed(POPULAR_CAT_BREEDS[0]);
                            else setEditPetBreed(OTHER_SPECIES_OPTIONS[0]);
                          }}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              editPetSpecies === sp && { color: '#FFFFFF' },
                            ]}
                          >
                            {sp}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.twoCol}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Tên thú cưng</Text>
                        <TextInput
                          style={styles.input}
                          maxLength={30}
                          value={editPetName}
                          onChangeText={setEditPetName}
                        />
                      </View>
                      <View style={{ width: 120 }}>
                        <Text style={styles.label}>Cân nặng</Text>
                        <TouchableOpacity
                          style={styles.selectorFieldBtn}
                          onPress={() =>
                            openSelector(
                              'Chọn cân nặng (kg)',
                              PET_WEIGHT_OPTIONS,
                              editPetWeight,
                              (v) => setEditPetWeight(v)
                            )
                          }
                        >
                          <Text style={styles.selectorFieldText}>{editPetWeight} kg</Text>
                          <Feather name="chevron-down" size={15} color="#7A6E63" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.twoCol}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Giống loài</Text>
                        <TouchableOpacity
                          style={styles.selectorFieldBtn}
                          onPress={() =>
                            openSelector(
                              'Chọn giống loài',
                              editPetSpecies === 'Chó'
                                ? POPULAR_DOG_BREEDS
                                : editPetSpecies === 'Mèo'
                                  ? POPULAR_CAT_BREEDS
                                  : OTHER_SPECIES_OPTIONS,
                              editPetBreed,
                              (v) => {
                                setEditPetBreed(v);
                                if (editPetSpecies === 'Khác') setEditPetCustomSpecies(v);
                              }
                            )
                          }
                        >
                          <Text style={styles.selectorFieldText} numberOfLines={1}>
                            {editPetBreed || 'Chọn giống'}
                          </Text>
                          <Feather name="chevron-down" size={15} color="#7A6E63" />
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: 120 }}>
                        <Text style={styles.label}>Độ tuổi</Text>
                        <TouchableOpacity
                          style={styles.selectorFieldBtn}
                          onPress={() =>
                            openSelector('Chọn độ tuổi', PET_AGE_OPTIONS, editPetAge, (v) =>
                              setEditPetAge(v)
                            )
                          }
                        >
                          <Text style={styles.selectorFieldText}>{editPetAge}</Text>
                          <Feather name="chevron-down" size={15} color="#7A6E63" />
                        </TouchableOpacity>
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
                          Hiển thị chứng nhận an toàn trên hồ sơ của bé {editPetName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : null}

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setOwnerNoteBubble(editOwnerNote);
                    updateOwnerAndPetProfile({
                      ownerName: editOwnerName,
                      ownerNickname: ownerNickname,
                      ownerBio: editOwnerBio,
                      ownerArea: editOwnerArea,
                      isPrivateProfile,
                      petId: activePet.id,
                      petName: editPetName,
                      petSpecies: editPetSpecies,
                      petBreed:
                        editPetSpecies === 'Khác'
                          ? editPetCustomSpecies || editPetBreed
                          : editPetBreed,
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

                {activePet.id ? (
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
                ) : null}
              </View>
            )}

            {/* =============================================================== */}
            {/* MODAL 5: REDESIGNED NOTIFICATION CENTER (CATEGORIZED + ACTIONS) */}
            {/* =============================================================== */}
            {activeModal === 'notifications' && (
              <View>
                {/* Category Filter Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.notifFilterRow}
                >
                  {(
                    [
                      { id: 'all', label: `Tất cả (${notifCounts.all})` },
                      { id: 'friend', label: `Kết bạn & Match (${notifCounts.friend})` },
                      { id: 'follow', label: `Theo dõi & Tương tác (${notifCounts.follow})` },
                      { id: 'sos', label: `SOS (${notifCounts.sos})` },
                    ] as const
                  ).map((tab) => {
                    const active = notifFilterTab === tab.id;
                    return (
                      <TouchableOpacity
                        key={tab.id}
                        style={[
                          styles.notifFilterPill,
                          active && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => setNotifFilterTab(tab.id)}
                      >
                        <Text
                          style={[
                            styles.notifFilterPillText,
                            active && { color: '#FFFFFF', fontWeight: '800' },
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Management Toolbar */}
                {notifications.length > 0 && (
                  <View style={styles.notifManageBar}>
                    <TouchableOpacity
                      style={styles.notifManageBtn}
                      onPress={markAllNotificationsRead}
                    >
                      <Feather name="check-circle" size={13} color="#2E7D5B" />
                      <Text style={[styles.notifManageText, { color: '#2E7D5B' }]}>
                        Đọc tất cả
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.notifManageBtn}
                      onPress={() => setConfirmClearNotifs(true)}
                    >
                      <Feather name="trash-2" size={13} color="#C9302C" />
                      <Text style={[styles.notifManageText, { color: '#C9302C' }]}>
                        Xóa tất cả
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Notification List */}
                {filteredNotifications.length === 0 ? (
                  <View style={styles.emptyCenterBox}>
                    <View style={styles.emptyIconCircle}>
                      <Feather name="bell" size={24} color="#8E8074" />
                    </View>
                    <Text style={styles.emptyBoxTitle}>Chưa có thông báo nào</Text>
                    <Text style={styles.emptyBoxSub}>
                      Các thông báo lời mời kết bạn, chấp nhận kết bạn, theo dõi mới, tương hợp hẹn dạo và SOS sẽ xuất hiện tại đây.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {filteredNotifications.map((n) => {
                      const badge = getNotificationBadgeMeta(n);
                      const senderHandle = n.actionPayload?.senderHandle;
                      const reqStatus = n.actionPayload?.status;

                      return (
                        <TouchableOpacity
                          key={n.id}
                          activeOpacity={0.85}
                          style={[
                            styles.notifCard,
                            !n.isRead && {
                              backgroundColor: '#FFF9F7',
                              borderColor: theme.primary,
                            },
                          ]}
                          onPress={() => {
                            markNotificationRead(n.id);
                            if (
                              n.type === 'sos_alert' ||
                              n.type === 'sos_sighting' ||
                              n.type === 'sos'
                            ) {
                              setActiveModal(null);
                              setActiveTab('sos');
                            } else if (senderHandle) {
                              setActiveModal(null);
                              openPublicUserProfile(senderHandle);
                            }
                          }}
                        >
                          <View style={styles.notifHeaderLine}>
                            <View
                              style={[
                                styles.notifCategoryBadge,
                                { backgroundColor: badge.bgColor },
                              ]}
                            >
                              <Feather
                                name={badge.icon as any}
                                size={12}
                                color={badge.textColor}
                              />
                              <Text
                                style={[
                                  styles.notifCategoryBadgeText,
                                  { color: badge.textColor },
                                ]}
                              >
                                {badge.label}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              {!n.isRead && (
                                <View
                                  style={[
                                    styles.unreadDot,
                                    { backgroundColor: theme.primary },
                                  ]}
                                />
                              )}
                              <Text style={styles.notifTime}>{n.timeLabel}</Text>
                              <TouchableOpacity
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                onPress={() => deleteNotification(n.id)}
                              >
                                <Feather name="x" size={14} color="#9E9085" />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.notifContentRow}>
                            {n.actionPayload?.senderAvatar ? (
                              <Image
                                source={{ uri: n.actionPayload.senderAvatar }}
                                style={styles.notifSenderAvatar}
                              />
                            ) : null}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.optionTitle}>{n.title}</Text>
                              <Text style={styles.optionSub}>{n.body}</Text>
                            </View>
                          </View>

                          {/* INLINE ACTIONS BY NOTIFICATION TYPE */}
                          {n.type === 'friend_request' && senderHandle && (
                            <View style={styles.notifInlineActionsRow}>
                              {reqStatus === 'accepted' ? (
                                <>
                                  <View style={styles.statusResolvedPillAccepted}>
                                    <Feather name="check" size={12} color="#2E7D5B" />
                                    <Text style={styles.statusResolvedTextAccepted}>
                                      Đã chấp nhận kết bạn
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    style={[
                                      styles.notifInlinePrimaryBtn,
                                      { backgroundColor: theme.primary },
                                    ]}
                                    onPress={() => {
                                      setActiveModal(null);
                                      startDirectChatWithUser(senderHandle);
                                    }}
                                  >
                                    <Feather name="message-circle" size={12} color="#FFFFFF" />
                                    <Text style={styles.notifInlinePrimaryText}>Nhắn tin</Text>
                                  </TouchableOpacity>
                                </>
                              ) : reqStatus === 'declined' ? (
                                <View style={styles.statusResolvedPillDeclined}>
                                  <Text style={styles.statusResolvedTextDeclined}>
                                    Đã từ chối lời mời
                                  </Text>
                                </View>
                              ) : (
                                <>
                                  <TouchableOpacity
                                    style={[
                                      styles.notifInlinePrimaryBtn,
                                      { backgroundColor: theme.primary },
                                    ]}
                                    onPress={() => acceptFriendRequest(senderHandle, n.id)}
                                  >
                                    <Feather name="user-check" size={13} color="#FFFFFF" />
                                    <Text style={styles.notifInlinePrimaryText}>Chấp nhận</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.notifInlineSecondaryBtn}
                                    onPress={() => declineFriendRequest(senderHandle, n.id)}
                                  >
                                    <Text style={styles.notifInlineSecondaryText}>Từ chối</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          )}

                          {(n.type === 'friend_accepted' ||
                            n.type === 'match' ||
                            n.type === 'tinder') &&
                            senderHandle && (
                              <View style={styles.notifInlineActionsRow}>
                                <TouchableOpacity
                                  style={[
                                    styles.notifInlinePrimaryBtn,
                                    { backgroundColor: theme.primary },
                                  ]}
                                  onPress={() => {
                                    markNotificationRead(n.id);
                                    setActiveModal(null);
                                    startDirectChatWithUser(senderHandle);
                                  }}
                                >
                                  <Feather name="message-circle" size={13} color="#FFFFFF" />
                                  <Text style={styles.notifInlinePrimaryText}>
                                    Nhắn tin ngay
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.notifInlineSecondaryBtn}
                                  onPress={() => {
                                    markNotificationRead(n.id);
                                    setActiveModal(null);
                                    openPublicUserProfile(senderHandle);
                                  }}
                                >
                                  <Text style={styles.notifInlineSecondaryText}>Xem hồ sơ</Text>
                                </TouchableOpacity>
                              </View>
                            )}

                          {n.type === 'follow' && senderHandle && (
                            <View style={styles.notifInlineActionsRow}>
                              <TouchableOpacity
                                style={styles.notifInlineSecondaryBtn}
                                onPress={() => {
                                  markNotificationRead(n.id);
                                  setActiveModal(null);
                                  openPublicUserProfile(senderHandle);
                                }}
                              >
                                <Feather name="user" size={12} color="#4A3F35" />
                                <Text style={styles.notifInlineSecondaryText}>
                                  Xem trang cá nhân
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {(n.type === 'sos_alert' ||
                            n.type === 'sos_sighting' ||
                            n.type === 'sos') && (
                              <View style={styles.notifInlineActionsRow}>
                                <TouchableOpacity
                                  style={[
                                    styles.notifInlinePrimaryBtn,
                                    { backgroundColor: '#C9302C' },
                                  ]}
                                  onPress={() => {
                                    markNotificationRead(n.id);
                                    setActiveModal(null);
                                    setActiveTab('sos');
                                  }}
                                >
                                  <Feather name="map-pin" size={12} color="#FFFFFF" />
                                  <Text style={styles.notifInlinePrimaryText}>
                                    Xem tin SOS khẩn cấp
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>

        {/* SHARED SELECTOR PICKER MODAL */}
        <SelectorPickerModal
          visible={selectorState.visible}
          title={selectorState.title}
          options={selectorState.options}
          selectedValue={selectorState.selectedValue}
          onSelect={selectorState.onSelect}
          onClose={() => setSelectorState((prev) => ({ ...prev, visible: false }))}
        />

        {/* CONFIRM CLEAR ALL NOTIFICATIONS */}
        <ConfirmActionModal
          visible={confirmClearNotifs}
          title="Xóa toàn bộ thông báo?"
          message="Tất cả lịch sử thông báo của bạn sẽ được dọn sạch khỏi danh sách. Bạn có chắc chắn muốn tiếp tục?"
          confirmLabel="Xóa tất cả"
          cancelLabel="Giữ lại"
          danger
          onCancel={() => setConfirmClearNotifs(false)}
          onConfirm={() => {
            setConfirmClearNotifs(false);
            clearAllNotifications();
          }}
        />

        {/* CONFIRM LOGOUT */}
        <ConfirmActionModal
          visible={confirmLogoutVisible}
          title="Đăng xuất tài khoản?"
          message="Bạn sẽ đăng xuất khỏi phiên làm việc trên thiết bị này."
          confirmLabel="Đăng xuất"
          cancelLabel="Ở lại"
          danger
          onCancel={() => setConfirmLogoutVisible(false)}
          onConfirm={() => {
            setConfirmLogoutVisible(false);
            setActiveModal(null);
            logoutUser();
          }}
        />
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
  labelBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A8D82',
    marginBottom: 6,
  },
  subHintText: {
    fontSize: 12,
    color: '#7A6E63',
    marginBottom: 12,
    lineHeight: 18,
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
  selectorFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 12,
  },
  selectorFieldText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2520',
    marginRight: 6,
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
    paddingHorizontal: 16,
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
    marginBottom: 14,
  },
  selectedMediaScroll: {
    gap: 10,
  },
  selectedPreviewCard: {
    width: 116,
    height: 116,
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
    backgroundColor: 'rgba(201, 48, 44, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
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
  secondaryOutlineBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  secondaryOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  purposeRadioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#E5DDD3',
  },
  purposeRadioTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  purposeRadioDesc: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
    lineHeight: 16,
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
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  optionSub: {
    fontSize: 12,
    color: '#6E6257',
    marginTop: 2,
    lineHeight: 17,
  },
  emptyCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyBoxTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 4,
  },
  emptyBoxSub: {
    fontSize: 12,
    color: '#7A6E63',
    textAlign: 'center',
    lineHeight: 18,
  },
  likesYouCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE2D7',
    gap: 10,
  },
  likesYouTopTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likedAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallbackCircle: {
    backgroundColor: '#EDE5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8074',
  },
  purposeInlineTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D5B',
    marginTop: 2,
  },
  likesYouActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  passOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD6CA',
  },
  passOutlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  likeBackPrimaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  likeBackPrimaryBtnText: {
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
  publicName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    textAlign: 'center',
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
  notifFilterRow: {
    gap: 8,
    paddingBottom: 10,
  },
  notifFilterPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  notifFilterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C5046',
  },
  notifManageBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4',
  },
  notifManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  notifManageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifCard: {
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EAE2D7',
    gap: 8,
  },
  notifHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  notifCategoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  notifTime: {
    fontSize: 11,
    color: '#8E8074',
  },
  notifContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifSenderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5DDD3',
  },
  notifInlineActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  notifInlinePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  notifInlinePrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  notifInlineSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ECE6DF',
  },
  notifInlineSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
  },
  statusResolvedPillAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusResolvedTextAccepted: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D5B',
  },
  statusResolvedPillDeclined: {
    backgroundColor: '#EFEAE3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusResolvedTextDeclined: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6E63',
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
  customHashtagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  customHashtagInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE4DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#2C2520',
  },
  customHashtagAddBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  customHashtagAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tinderAddPhotoBtn: {
    width: 80,
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8DED3',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    marginRight: 10,
  },
  tinderAddPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6E63',
    marginTop: 4,
  },
  tinderPhotoThumbWrap: {
    width: 80,
    height: 100,
    borderRadius: 14,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBE5DE',
  },
  tinderPhotoThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tinderPrimaryPhotoBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  tinderPrimaryPhotoText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tinderDeletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
