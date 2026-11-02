import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, cleanName } from '../context/MobilePawtyContext';
import { apiClient } from '../services/apiClient';
import { SelectorPickerModal, ConfirmActionModal } from '../components/SelectorFieldModal';
import {
  MobilePet,
  MobilePost,
  PetWeightEntry,
  PetVaccineRecord,
  POPULAR_DOG_BREEDS,
  POPULAR_CAT_BREEDS,
  OTHER_SPECIES_OPTIONS,
  PET_AGE_OPTIONS,
  PET_WEIGHT_OPTIONS,
  PET_FUR_COLOR_OPTIONS,
  PET_FOOD_OPTIONS,
  PET_DEWORMING_OPTIONS,
  PET_MEDICAL_OPTIONS,
  PET_GOOD_HABIT_OPTIONS,
  PET_CAUTION_HABIT_OPTIONS,
  PET_VACCINE_NAME_OPTIONS,
  PET_DOSE_OPTIONS,
  PET_CLINIC_OPTIONS,
  OWNER_AGE_OPTIONS,
  ZODIAC_OPTIONS,
  MBTI_OPTIONS,
  OCCUPATION_OPTIONS,
  EDUCATION_OPTIONS,
  LIVING_AREA_OPTIONS,
} from '../types/mobileTypes';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MOMENT_GRID_SIZE = Math.floor((SCREEN_WIDTH - 32 - 16) / 3);

const DEFAULT_FALLBACK_DOG =
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80';
const DEFAULT_FALLBACK_CAT =
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80';

const DEFAULT_DOG_GALLERY = [
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=80',
];
const DEFAULT_CAT_GALLERY = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513360382564-850126167794?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1000&q=80',
];

const COVER_PRESETS = [
  { id: 'beach', name: 'Biển hoàng hôn', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  { id: 'park', name: 'Công viên xanh', url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80' },
  { id: 'home', name: 'Nhà ấm cúng', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80' },
  { id: 'autumn', name: 'Mùa thu vàng', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80' },
];

const MONTH_LIST = [
  'T01', 'T02', 'T03', 'T04', 'T05', 'T06',
  'T07', 'T08', 'T09', 'T10', 'T11', 'T12',
];

/* -------------------------------------------------------------------------- */
/* DATE PICKER MODAL                                                          */
/* -------------------------------------------------------------------------- */
interface DatePickerModalProps {
  visible: boolean;
  title: string;
  initialDate: string;
  isPet?: boolean;
  onConfirm: (dateStr: string) => void;
  onClose: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  initialDate,
  isPet = false,
  onConfirm,
  onClose,
}) => {
  const parts = (initialDate || '').split('/');
  const initDay = parts[0] || '15';
  const initMonth = parts[1] || '08';
  const initYear = parts[2] || (isPet ? '2024' : '2000');

  const [selectedDay, setSelectedDay] = useState(initDay);
  const [selectedMonth, setSelectedMonth] = useState(initMonth);
  const [selectedYear, setSelectedYear] = useState(initYear);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')), []);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = isPet ? currentYear - 20 : 1960;
    const count = currentYear - startYear + 1;
    return Array.from({ length: count }, (_, i) => String(startYear + i)).reverse();
  }, [isPet]);

  const handleConfirm = () => {
    onConfirm(`${selectedDay}/${selectedMonth}/${selectedYear}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dateStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={dateStyles.datePickerCard}>
          <View style={dateStyles.sheetHeader}>
            <Text style={dateStyles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={dateStyles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={18} color="#6B5E59" />
            </TouchableOpacity>
          </View>

          <View style={dateStyles.dateColsContainer}>
            <View style={dateStyles.dateCol}>
              <Text style={dateStyles.dateColHeader}>Ngày</Text>
              <ScrollView style={dateStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[dateStyles.dateItemPill, selectedDay === d && dateStyles.dateItemPillActive]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[dateStyles.dateItemText, selectedDay === d && dateStyles.dateItemTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={dateStyles.dateCol}>
              <Text style={dateStyles.dateColHeader}>Tháng</Text>
              <ScrollView style={dateStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {months.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[dateStyles.dateItemPill, selectedMonth === m && dateStyles.dateItemPillActive]}
                    onPress={() => setSelectedMonth(m)}
                  >
                    <Text style={[dateStyles.dateItemText, selectedMonth === m && dateStyles.dateItemTextActive]}>
                      Tháng {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={dateStyles.dateCol}>
              <Text style={dateStyles.dateColHeader}>Năm</Text>
              <ScrollView style={dateStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[dateStyles.dateItemPill, selectedYear === y && dateStyles.dateItemPillActive]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[dateStyles.dateItemText, selectedYear === y && dateStyles.dateItemTextActive]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={dateStyles.datePreviewRow}>
            <Text style={dateStyles.datePreviewText}>
              Đã chọn: {selectedDay}/{selectedMonth}/{selectedYear}
            </Text>
          </View>

          <TouchableOpacity style={dateStyles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={dateStyles.confirmBtnText}>Xác nhận ngày sinh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN PROFILE SCREEN (UNIFIED LAYOUT: SELF VS VIEWING OTHER)                */
/* -------------------------------------------------------------------------- */
export const MobileProfileScreen: React.FC = () => {
  const {
    themeId,
    theme,
    ownerName,
    ownerBio,
    ownerArea,
    ownerGender,
    ownerAge,
    ownerBirthDate,
    ownerZodiac,
    ownerMbti,
    ownerEducation,
    ownerMajor,
    ownerOccupation,
    ownerCoverUrl,
    setOwnerCoverUrl,
    ownerAvatarUrl,
    setOwnerAvatarUrl,
    ownerPrivacySettings,
    updateOwnerProfile,
    ownerNoteBubble,
    setOwnerNoteBubble,
    ownerFollowersCount,
    ownerFollowingCount,
    pets,
    addNewPetProfile,
    deletePetProfile,
    updatePetProfile,
    togglePetLike,
    posts,
    deletePost,
    toggleReaction,
    toggleCommentLike,
    addComment,
    addCommentReply,
    setActiveModal,
    openLightboxMedia,
    logoutUser,
    showToast,
    ownerHandle,
    selectedProfileHandle,
    publicProfiles,
    resolvePublicProfile,
    sendFriendRequest,
    acceptFriendRequest,
    unfriendUser,
    toggleFollowUser,
    startDirectChatWithUser,
    goBackFromOtherProfile,
  } = useMobilePawty();

  const isViewingOther = Boolean(
    selectedProfileHandle &&
      selectedProfileHandle.toLowerCase() !== (ownerHandle || '').toLowerCase() &&
      selectedProfileHandle.replace(/^@/, '').toLowerCase() !== (ownerHandle || '').replace(/^@/, '').toLowerCase()
  );

  const otherProfile = isViewingOther && selectedProfileHandle
    ? publicProfiles[selectedProfileHandle] || resolvePublicProfile(selectedProfileHandle)
    : null;

  const displayedPets: MobilePet[] = isViewingOther && otherProfile
    ? (otherProfile.pets && otherProfile.pets.length > 0 ? otherProfile.pets : [])
    : pets;

  const horizontalScrollRef = useRef<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Hamburger settings modal state
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  // Cover image modal state
  const [isChangingCoverModal, setIsChangingCoverModal] = useState(false);

  // Unfriend confirmation modal
  const [confirmUnfriendVisible, setConfirmUnfriendVisible] = useState(false);

  // Per-pet gallery indices & expand state
  const [petGalleryIndices, setPetGalleryIndices] = useState<Record<string, number>>({});
  const [expandedPetDetails, setExpandedPetDetails] = useState<Record<string, boolean>>({});

  // Double-tap & Heart explosion animation state
  const heartAnimScale = useRef(new Animated.Value(0)).current;
  const heartAnimOpacity = useRef(new Animated.Value(0)).current;
  const [burstPetId, setBurstPetId] = useState<string | null>(null);
  const lastPetTapRef = useRef<Record<string, number>>({});

  // Owner moments tab
  const [ownerMediaTab, setOwnerMediaTab] = useState<'moments' | 'saved'>('moments');

  // Popup 1: Ghi chú
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');

  // Selector Field State
  const [selectorConfig, setSelectorConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selectedValue?: string;
    selectedValues?: string[];
    multiSelect?: boolean;
    onSelect?: (val: string) => void;
    onSelectMulti?: (vals: string[]) => void;
  }>({
    visible: false,
    title: '',
    options: [],
  });

  const openSelector = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    setSelectorConfig({
      visible: true,
      title,
      options,
      selectedValue,
      multiSelect: false,
      onSelect,
    });
  };

  const openMultiSelector = (
    title: string,
    options: string[],
    selectedValues: string[],
    onSelectMulti: (vals: string[]) => void
  ) => {
    setSelectorConfig({
      visible: true,
      title,
      options,
      selectedValues,
      multiSelect: true,
      onSelectMulti,
    });
  };

  // Date Picker State
  const [datePickerConfig, setDatePickerConfig] = useState<{
    visible: boolean;
    title: string;
    initialDate: string;
    onConfirm: (date: string) => void;
    isPet?: boolean;
  }>({
    visible: false,
    title: '',
    initialDate: '',
    onConfirm: () => {},
    isPet: false,
  });

  // Popup 2: Chỉnh sửa Hồ sơ Con Sen
  const [isEditingOwnerProfile, setIsEditingOwnerProfile] = useState(false);
  const [ownerDraftName, setOwnerDraftName] = useState(ownerName);
  const [ownerDraftGender, setOwnerDraftGender] = useState(ownerGender);
  const [ownerDraftArea, setOwnerDraftArea] = useState(ownerArea);
  const [ownerDraftAge, setOwnerDraftAge] = useState(String(ownerAge));
  const [ownerDraftBirthDate, setOwnerDraftBirthDate] = useState(ownerBirthDate);
  const [ownerDraftZodiac, setOwnerDraftZodiac] = useState(ownerZodiac);
  const [ownerDraftMbti, setOwnerDraftMbti] = useState(ownerMbti);
  const [ownerDraftEducation, setOwnerDraftEducation] = useState(ownerEducation);
  const [ownerDraftMajor, setOwnerDraftMajor] = useState(ownerMajor);
  const [ownerDraftOccupation, setOwnerDraftOccupation] = useState(ownerOccupation);
  const [ownerDraftBio, setOwnerDraftBio] = useState(ownerBio);
  const [ownerDraftPrivacy, setOwnerDraftPrivacy] = useState<Record<string, boolean>>({
    gender: ownerPrivacySettings?.gender ?? true,
    age: ownerPrivacySettings?.age ?? true,
    birthDate: ownerPrivacySettings?.birthDate ?? false,
    zodiac: ownerPrivacySettings?.zodiac ?? true,
    mbti: ownerPrivacySettings?.mbti ?? true,
    education: ownerPrivacySettings?.education ?? true,
    major: ownerPrivacySettings?.major ?? true,
    occupation: ownerPrivacySettings?.occupation ?? true,
    area: ownerPrivacySettings?.area ?? true,
    bio: ownerPrivacySettings?.bio ?? true,
  });

  // Popup 3: Thêm bé cưng mới (Selector-first + Base64 photo)
  const [isAddingPetModal, setIsAddingPetModal] = useState(false);
  const [isCreatingPetSubmitting, setIsCreatingPetSubmitting] = useState(false);
  const [newPetPhotoUrl, setNewPetPhotoUrl] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'Chó' | 'Mèo' | 'Khác'>('Chó');
  const [newPetCustomSpecies, setNewPetCustomSpecies] = useState('');
  const [newPetName, setNewPetName] = useState('');
  const [newPetGender, setNewPetGender] = useState<'Đực' | 'Cái'>('Đực');
  const [newPetBreed, setNewPetBreed] = useState(POPULAR_DOG_BREEDS[0]);
  const [newPetWeight, setNewPetWeight] = useState('4.8');
  const [newPetAge, setNewPetAge] = useState(PET_AGE_OPTIONS[4] || '1 tuổi');
  const [newPetBirthDate, setNewPetBirthDate] = useState('01/01/2024');
  const [newPetFurColor, setNewPetFurColor] = useState(PET_FUR_COLOR_OPTIONS[0]);
  const [newPetBio, setNewPetBio] = useState('');
  const [newPetFavoriteFood, setNewPetFavoriteFood] = useState(PET_FOOD_OPTIONS[0]);
  const [newPetDewormingHistory, setNewPetDewormingHistory] = useState(PET_DEWORMING_OPTIONS[0]);
  const [newPetMedicalHistory, setNewPetMedicalHistory] = useState(PET_MEDICAL_OPTIONS[0]);
  const [newPetGoodHabits, setNewPetGoodHabits] = useState<string[]>([
    PET_GOOD_HABIT_OPTIONS[0],
    PET_GOOD_HABIT_OPTIONS[1],
  ]);
  const [newPetCautionHabits, setNewPetCautionHabits] = useState<string[]>([
    PET_CAUTION_HABIT_OPTIONS[0],
  ]);
  const [newPetVaccinated, setNewPetVaccinated] = useState(true);
  const [newPetWeightHistory, setNewPetWeightHistory] = useState<PetWeightEntry[]>([
    { month: 'T08', weightKg: 4.2 },
    { month: 'T09', weightKg: 4.6 },
    { month: 'T10', weightKg: 4.8 },
  ]);
  const [newPetVaccineRecords, setNewPetVaccineRecords] = useState<PetVaccineRecord[]>([
    {
      id: 'vac-1',
      vaccineName: PET_VACCINE_NAME_OPTIONS[0],
      date: '10/08/2025',
      doseNumber: 2,
      clinic: PET_CLINIC_OPTIONS[0],
      isSafeVerified: true,
    },
  ]);
  const [tempWeightMonth, setTempWeightMonth] = useState('T11');
  const [tempWeightKg, setTempWeightKg] = useState('4.8');
  const [tempVacName, setTempVacName] = useState(PET_VACCINE_NAME_OPTIONS[0]);
  const [tempVacDate, setTempVacDate] = useState('15/10/2025');
  const [tempVacDose, setTempVacDose] = useState('1');
  const [tempVacClinic, setTempVacClinic] = useState(PET_CLINIC_OPTIONS[0]);

  // Popup 4: Chỉnh sửa Thú Cưng
  const [editingPet, setEditingPet] = useState<MobilePet | null>(null);
  const [editPetSpeciesDraft, setEditPetSpeciesDraft] = useState<'Chó' | 'Mèo' | 'Khác'>('Chó');
  const [editPetCustomSpeciesDraft, setEditPetCustomSpeciesDraft] = useState('');
  const [editPetNameDraft, setEditPetNameDraft] = useState('');
  const [editPetGenderDraft, setEditPetGenderDraft] = useState<'Đực' | 'Cái'>('Đực');
  const [editPetBreedDraft, setEditPetBreedDraft] = useState('');
  const [editPetWeightDraft, setEditPetWeightDraft] = useState('4.8');
  const [editPetAgeDraft, setEditPetAgeDraft] = useState('1 tuổi');
  const [editPetBirthDateDraft, setEditPetBirthDateDraft] = useState('');
  const [editPetFurColorDraft, setEditPetFurColorDraft] = useState('Vàng kem');
  const [editPetBioDraft, setEditPetBioDraft] = useState('');
  const [editPetFavoriteFoodDraft, setEditPetFavoriteFoodDraft] = useState('');
  const [editPetDewormingHistoryDraft, setEditPetDewormingHistoryDraft] = useState('');
  const [editPetMedicalHistoryDraft, setEditPetMedicalHistoryDraft] = useState('');
  const [editPetGoodHabitsDraft, setEditPetGoodHabitsDraft] = useState<string[]>([]);
  const [editPetCautionHabitsDraft, setEditPetCautionHabitsDraft] = useState<string[]>([]);
  const [editPetVaccineRecordsDraft, setEditPetVaccineRecordsDraft] = useState<PetVaccineRecord[]>([]);
  const [editPetWeightHistoryDraft, setEditPetWeightHistoryDraft] = useState<PetWeightEntry[]>([]);
  const [editPetGalleryDraft, setEditPetGalleryDraft] = useState<string[]>([]);

  // Popup 5: Post Preview Modal & Post Detail Modal
  const [selectedPreviewPost, setSelectedPreviewPost] = useState<MobilePost | null>(null);
  const [activePostDetail, setActivePostDetail] = useState<MobilePost | null>(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);

  // Moments list calculation
  const myPosts = posts.filter(
    (p) =>
      p.authorHandle &&
      ownerHandle &&
      p.authorHandle.toLowerCase().replace(/^@/, '') ===
        ownerHandle.toLowerCase().replace(/^@/, '')
  );

  const displayPosts = useMemo(() => {
    if (isViewingOther && otherProfile) {
      if (otherProfile.posts && otherProfile.posts.length > 0) return otherProfile.posts;
      return posts.filter(
        (p) =>
          p.authorHandle &&
          otherProfile.handle &&
          p.authorHandle.toLowerCase().replace(/^@/, '') ===
            otherProfile.handle.toLowerCase().replace(/^@/, '')
      );
    }
    return ownerMediaTab === 'saved' ? posts.filter((p) => p.isSaved) : myPosts;
  }, [isViewingOther, otherProfile, posts, ownerMediaTab, myPosts]);

  const totalPages = 1 + displayedPets.length;

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page >= 0 && page < totalPages) {
      setCurrentPageIndex(page);
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({
        x: pageIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentPageIndex(pageIndex);
    }
  };

  /* ---------------- Double-Tap & Heart Explosion ---------------- */
  const handlePetDoubleTap = (petId: string) => {
    togglePetLike(petId);
    setBurstPetId(petId);
    heartAnimScale.setValue(0.3);
    heartAnimOpacity.setValue(1);
    Animated.parallel([
      Animated.spring(heartAnimScale, {
        toValue: 1.5,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBurstPetId(null);
    });
  };

  const handlePetContainerTap = (petId: string) => {
    const now = Date.now();
    const last = lastPetTapRef.current[petId] || 0;
    if (now - last < 320) {
      handlePetDoubleTap(petId);
      lastPetTapRef.current[petId] = 0;
    } else {
      lastPetTapRef.current[petId] = now;
    }
  };

  /* ---------------- Pet Gallery Switching (< and >) ---------------- */
  const handlePrevPetPhoto = (petId: string, total: number) => {
    if (total <= 1) return;
    setPetGalleryIndices((prev) => ({
      ...prev,
      [petId]: ((prev[petId] || 0) - 1 + total) % total,
    }));
  };

  const handleNextPetPhoto = (petId: string, total: number) => {
    if (total <= 1) return;
    setPetGalleryIndices((prev) => ({
      ...prev,
      [petId]: ((prev[petId] || 0) + 1) % total,
    }));
  };

  /* ---------------- Add/Update Pet Photo from Device ---------------- */
  const handleAddPetPhotoFromDevice = async (petId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        base64: true,
        quality: 0.45,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const rawUri = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        showToast('Đang tải ảnh lên Cloudinary...');
        const newUri = await apiClient.uploadImage(rawUri, 'pawty/pets');
        const targetPet = pets.find((p) => p.id === petId);
        if (targetPet) {
          const currentGallery = targetPet.galleryUrls && targetPet.galleryUrls.length > 0
            ? targetPet.galleryUrls
            : [targetPet.coverUrl || targetPet.avatarUrl];
          const updatedGallery = [newUri, ...currentGallery];
          await updatePetProfile(petId, {
            galleryUrls: updatedGallery,
            avatarUrl: newUri,
            coverUrl: newUri,
          });
          setPetGalleryIndices((prev) => ({ ...prev, [petId]: 0 }));
          showToast('Đã thêm ảnh mới vào album của bé!');
        }
      }
    } catch {
      showToast('Chưa chọn ảnh mới');
    }
  };

  /* ---------------- Pick Owner Avatar ---------------- */
  const handlePickOwnerAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        quality: 0.45,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        const rawUrl = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        showToast('Đang tải ảnh đại diện lên Cloudinary...');
        const dataUrl = await apiClient.uploadImage(rawUrl, 'pawty/avatars');
        setOwnerAvatarUrl(dataUrl);
        showToast('Đã cập nhật ảnh đại diện mới thành công!');
      }
    } catch {
      showToast('Chưa chọn ảnh đại diện');
    }
  };

  /* ---------------- Pick Owner Cover ---------------- */
  const handlePickCoverFromDevice = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        base64: true,
        quality: 0.45,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        const rawUrl = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        showToast('Đang tải ảnh bìa lên Cloudinary...');
        const dataUrl = await apiClient.uploadImage(rawUrl, 'pawty/covers');
        setOwnerCoverUrl(dataUrl);
        setIsChangingCoverModal(false);
        showToast('Đã cập nhật ảnh bìa mới thành công!');
      }
    } catch {
      showToast('Chưa chọn ảnh bìa');
    }
  };

  /* ---------------- Pick New Pet Photo from Device ---------------- */
  const handlePickNewPetPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        base64: true,
        quality: 0.45,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        const rawUrl = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        showToast('Đang tải ảnh bé cưng lên Cloudinary...');
        const dataUrl = await apiClient.uploadImage(rawUrl, 'pawty/pets');
        setNewPetPhotoUrl(dataUrl);
        showToast('Đã tải ảnh bé cưng lên Cloudinary thành công!');
      }
    } catch {
      showToast('Không thể chọn ảnh từ thiết bị');
    }
  };

  /* ---------------- Open Edit Owner Modal ---------------- */
  const openEditOwnerModal = () => {
    setOwnerDraftName(ownerName);
    setOwnerDraftGender(ownerGender);
    setOwnerDraftArea(ownerArea);
    setOwnerDraftAge(String(ownerAge));
    setOwnerDraftBirthDate(ownerBirthDate);
    setOwnerDraftZodiac(ownerZodiac);
    setOwnerDraftMbti(ownerMbti);
    setOwnerDraftEducation(ownerEducation);
    setOwnerDraftMajor(ownerMajor);
    setOwnerDraftOccupation(ownerOccupation);
    setOwnerDraftBio(ownerBio);
    setOwnerDraftPrivacy({
      gender: ownerPrivacySettings?.gender ?? true,
      age: ownerPrivacySettings?.age ?? true,
      birthDate: ownerPrivacySettings?.birthDate ?? false,
      zodiac: ownerPrivacySettings?.zodiac ?? true,
      mbti: ownerPrivacySettings?.mbti ?? true,
      education: ownerPrivacySettings?.education ?? true,
      major: ownerPrivacySettings?.major ?? true,
      occupation: ownerPrivacySettings?.occupation ?? true,
      area: ownerPrivacySettings?.area ?? true,
      bio: ownerPrivacySettings?.bio ?? true,
    });
    setIsEditingOwnerProfile(true);
  };

  const handleSaveOwnerProfile = async () => {
    if (!ownerDraftName.trim()) {
      showToast('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    await updateOwnerProfile({
      name: ownerDraftName.trim(),
      gender: ownerDraftGender,
      area: ownerDraftArea.trim(),
      age: parseInt(ownerDraftAge, 10) || 24,
      birthDate: ownerDraftBirthDate,
      zodiac: ownerDraftZodiac,
      mbti: ownerDraftMbti,
      education: ownerDraftEducation.trim(),
      major: ownerDraftMajor.trim(),
      occupation: ownerDraftOccupation.trim(),
      bio: ownerDraftBio.trim(),
      privacySettings: ownerDraftPrivacy,
    });
    setIsEditingOwnerProfile(false);
  };

  /* ---------------- Pet Details Expand ---------------- */
  const togglePetDetailsExpanded = (petId: string) => {
    setExpandedPetDetails((prev) => ({
      ...prev,
      [petId]: !prev[petId],
    }));
  };

  /* ---------------- Open Edit Pet Modal ---------------- */
  const openEditPetModal = (pet: MobilePet) => {
    setEditingPet(pet);
    setEditPetSpeciesDraft(pet.species);
    setEditPetCustomSpeciesDraft(pet.customSpecies || '');
    setEditPetNameDraft(pet.name);
    setEditPetGenderDraft(pet.gender || 'Đực');
    setEditPetBreedDraft(pet.breed);
    setEditPetWeightDraft(String(pet.weightKg));
    setEditPetAgeDraft(pet.ageLabel);
    setEditPetBirthDateDraft(pet.birthDate || '');
    setEditPetFurColorDraft(pet.furColor || 'Vàng kem');
    setEditPetBioDraft(pet.bio || '');
    setEditPetFavoriteFoodDraft(pet.favoriteFood || '');
    setEditPetDewormingHistoryDraft(pet.dewormingHistory || '');
    setEditPetMedicalHistoryDraft(pet.medicalHistory || '');
    setEditPetGoodHabitsDraft(pet.goodHabits || []);
    setEditPetCautionHabitsDraft(pet.cautionHabits || []);
    setEditPetVaccineRecordsDraft(pet.vaccineRecords || []);
    setEditPetWeightHistoryDraft(pet.weightHistory || []);
    setEditPetGalleryDraft(
      pet.galleryUrls && pet.galleryUrls.length > 0
        ? pet.galleryUrls
        : [pet.coverUrl || pet.avatarUrl]
    );
  };

  const handleSavePetEdits = async () => {
    if (!editingPet) return;
    if (!editPetNameDraft.trim()) {
      showToast('Vui lòng nhập tên cho bé thú cưng.');
      return;
    }
    const finalSpecies = editPetSpeciesDraft === 'Khác' && editPetCustomSpeciesDraft.trim()
      ? editPetCustomSpeciesDraft.trim()
      : editPetSpeciesDraft;

    await updatePetProfile(editingPet.id, {
      name: editPetNameDraft.trim(),
      species: editPetSpeciesDraft === 'Khác' ? 'Chó' : editPetSpeciesDraft,
      customSpecies: editPetSpeciesDraft === 'Khác' ? finalSpecies : undefined,
      gender: editPetGenderDraft,
      breed: editPetBreedDraft.trim() || 'Thuần chủng',
      weightKg: parseFloat(editPetWeightDraft) || editingPet.weightKg,
      ageLabel: editPetAgeDraft.trim() || '1 tuổi',
      birthDate: editPetBirthDateDraft.trim(),
      furColor: editPetFurColorDraft,
      bio: editPetBioDraft.trim(),
      favoriteFood: editPetFavoriteFoodDraft.trim(),
      dewormingHistory: editPetDewormingHistoryDraft.trim(),
      medicalHistory: editPetMedicalHistoryDraft.trim(),
      goodHabits: editPetGoodHabitsDraft,
      cautionHabits: editPetCautionHabitsDraft,
      vaccineRecords: editPetVaccineRecordsDraft,
      weightHistory: editPetWeightHistoryDraft,
      galleryUrls: editPetGalleryDraft,
      avatarUrl: editPetGalleryDraft[0] || editingPet.avatarUrl,
    });

    setEditingPet(null);
    showToast('Đã cập nhật hồ sơ bé cưng');
  };

  /* ---------------- Add New Pet (Atomic & Persisted in PostgreSQL) ---------------- */
  const handleAddNewPet = async () => {
    if (isCreatingPetSubmitting) return;
    if (!newPetName.trim()) {
      showToast('Vui lòng nhập tên bé thú cưng.');
      return;
    }

    setIsCreatingPetSubmitting(true);
    try {
      const defaultImg =
        newPetSpecies === 'Mèo'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';

      const finalAvatar = newPetPhotoUrl || defaultImg;

      const created = await addNewPetProfile({
        name: newPetName.trim(),
        species: newPetSpecies,
        customSpecies: newPetSpecies === 'Khác' ? newPetCustomSpecies : undefined,
        breed: newPetBreed.trim() || (newPetSpecies === 'Chó' ? 'Golden Retriever' : 'Mèo Anh lông ngắn'),
        gender: newPetGender,
        weightKg: parseFloat(newPetWeight) || 4.8,
        ageLabel: newPetAge.trim() || '1 tuổi',
        birthDate: newPetBirthDate,
        furColor: newPetFurColor,
        bio: newPetBio.trim(),
        avatarUrl: finalAvatar,
        galleryUrls: [finalAvatar],
        isVaccinatedAndRabies: newPetVaccinated,
        favoriteFood: newPetFavoriteFood,
        dewormingHistory: newPetDewormingHistory,
        medicalHistory: newPetMedicalHistory,
        goodHabits: newPetGoodHabits,
        cautionHabits: newPetCautionHabits,
        vaccineRecords: newPetVaccineRecords,
        weightHistory: newPetWeightHistory,
      });

      if (created) {
        setIsAddingPetModal(false);
        setNewPetPhotoUrl('');
        setNewPetName('');
        setNewPetBio('');
        setTimeout(() => {
          scrollToPage(displayedPets.length);
        }, 300);
      }
    } finally {
      setIsCreatingPetSubmitting(false);
    }
  };

  // Resolved display metadata
  const displayCoverUrl = isViewingOther
    ? otherProfile?.coverUrl || otherProfile?.galleryUrls?.[0] || ownerCoverUrl
    : ownerCoverUrl;

  const displayAvatarUrl = isViewingOther
    ? otherProfile?.avatarUrl || ownerAvatarUrl
    : ownerAvatarUrl;

  const displayName = cleanName(isViewingOther ? otherProfile?.name || 'Cư dân' : ownerName);
  const displayOccupation = cleanName(isViewingOther ? otherProfile?.occupation : ownerOccupation);
  const displayBio = isViewingOther ? otherProfile?.bio : ownerBio;
  const displayArea = isViewingOther ? otherProfile?.area : ownerArea;
  const displayNoteBubble = isViewingOther ? otherProfile?.noteBubble : ownerNoteBubble;
  const displayFollowers = isViewingOther
    ? otherProfile?.followersCount ?? 0
    : ownerFollowersCount;
  const displayFollowing = isViewingOther
    ? otherProfile?.followingCount ?? otherProfile?.friendsCount ?? 0
    : ownerFollowingCount;
  const displayLikes = isViewingOther
    ? otherProfile?.likesCount ?? 120
    : pets.reduce((acc, p) => acc + (p.likesCount || 0), 0) || 120;

  return (
    <View style={styles.rootContainer}>
      {/* ------------------------------------------------------------- */}
      {/* TOP INTEGRATED HEADER: [<- Back] [Con sen] [Lu] [Miu] [+] [☰] */}
      {/* ------------------------------------------------------------- */}
      <View style={styles.topProfileHeader}>
        {isViewingOther && (
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={goBackFromOtherProfile}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#1C1815" />
          </TouchableOpacity>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.headerPillsScrollContent}
        >
          {/* Pill 0: Con sen */}
          <TouchableOpacity
            style={[
              styles.headerPill,
              currentPageIndex === 0 && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => scrollToPage(0)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.headerPillText,
                currentPageIndex === 0 && styles.headerPillTextActive,
              ]}
            >
              Con sen
            </Text>
          </TouchableOpacity>

          {/* Pet Pills */}
          {displayedPets.map((pet, idx) => {
            const pageNum = idx + 1;
            const isActive = currentPageIndex === pageNum;
            return (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.headerPill,
                  isActive && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => scrollToPage(pageNum)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.headerPillText,
                    isActive && styles.headerPillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {pet.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* [+] Add Pet Pill (Unlimited pets — ONLY when viewing self) */}
          {!isViewingOther && (
            <TouchableOpacity
              style={styles.headerAddPetPill}
              onPress={() => setIsAddingPetModal(true)}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={14} color="#FF6F61" />
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Hamburger Menu on the right (ONLY when viewing self) */}
        {!isViewingOther && (
          <TouchableOpacity
            style={styles.headerHamburgerBtn}
            onPress={() => setIsProfileMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={20} color="#1C1815" />
          </TouchableOpacity>
        )}
      </View>

      {/* ------------------------------------------------------------- */}
      {/* HORIZONTAL PAGING SCROLL VIEW                                 */}
      {/* ------------------------------------------------------------- */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.horizontalPagingScroll}
      >
        {/* ========================================================= */}
        {/* PAGE 0: HỒ SƠ CON SEN (OWNER PROFILE)                     */}
        {/* ========================================================= */}
        <ScrollView
          style={styles.pageWrapper}
          contentContainerStyle={styles.ownerPageScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Background Cover: Tap to view full size */}
          <View style={styles.ownerCoverContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.coverTouchArea}
              onPress={() => {
                openLightboxMedia({
                  postId: 'owner-cover',
                  mediaUrls: [displayCoverUrl],
                  mediaType: 'image',
                  initialIndex: 0,
                  authorName: displayName,
                  caption: 'Ảnh bìa trang cá nhân',
                });
              }}
            >
              <Image
                source={{ uri: displayCoverUrl }}
                style={styles.ownerCoverImg}
                resizeMode="cover"
              />
            </TouchableOpacity>

            {!isViewingOther && (
              <TouchableOpacity
                style={styles.changeCoverBtn}
                onPress={() => setIsChangingCoverModal(true)}
                activeOpacity={0.85}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="camera" size={13} color="#FFFFFF" />
                <Text style={styles.changeCoverBtnText}>Đổi ảnh bìa</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 2. Floating Note Bubble & Avatar Overlap (50% trên ảnh bìa) */}
          <View style={styles.avatarSectionRow}>
            {/* Note Bubble */}
            {displayNoteBubble && displayNoteBubble.trim().length > 0 ? (
              <View style={styles.noteBubbleAnchor}>
                <TouchableOpacity
                  style={styles.noteBubbleBox}
                  disabled={isViewingOther}
                  onPress={() => {
                    setTempNoteText(ownerNoteBubble || '');
                    setIsEditingNote(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.noteBubbleText} numberOfLines={2}>
                    {displayNoteBubble}
                  </Text>
                  <View style={styles.noteBubbleTail} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Avatar Wrap */}
            <View style={styles.ownerAvatarWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  openLightboxMedia({
                    postId: 'owner-avatar',
                    mediaUrls: [displayAvatarUrl],
                    mediaType: 'image',
                    initialIndex: 0,
                    authorName: displayName,
                    caption: 'Ảnh đại diện chính thức',
                  });
                }}
              >
                <Image source={{ uri: displayAvatarUrl }} style={styles.ownerAvatarImg} />
              </TouchableOpacity>

              {/* Note '+' badge: ONLY when viewing self */}
              {!isViewingOther && (
                <TouchableOpacity
                  style={[styles.avatarPlusBadge, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setTempNoteText(ownerNoteBubble || '');
                    setIsEditingNote(true);
                  }}
                  activeOpacity={0.85}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="plus" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              )}

              {/* Camera change avatar badge: ONLY when viewing self */}
              {!isViewingOther && (
                <TouchableOpacity
                  style={styles.avatarCameraBadge}
                  onPress={handlePickOwnerAvatar}
                  activeOpacity={0.85}
                >
                  <Feather name="camera" size={11} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Sleek Pen Edit Icon: ONLY when viewing self */}
            {!isViewingOther && (
              <TouchableOpacity
                style={styles.sleekEditPenBtn}
                onPress={openEditOwnerModal}
                activeOpacity={0.85}
              >
                <Feather name="edit-2" size={16} color="#1C1815" />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Owner Information */}
          <View style={styles.ownerInfoCenterBox}>
            <Text style={styles.ownerFullNameText}>{displayName}</Text>

            {displayOccupation ? (
              <Text style={styles.ownerJobTitleText}>{displayOccupation}</Text>
            ) : null}

            {displayBio ? <Text style={styles.ownerBioText}>{displayBio}</Text> : null}

            {displayArea ? (
              <View style={styles.ownerLocationRow}>
                <Feather name="map-pin" size={13} color="#FF6F61" />
                <Text style={styles.ownerLocationText}>{displayArea}</Text>
              </View>
            ) : null}

            {/* Clean Text Chips */}
            <View style={styles.ownerBadgesRow}>
              {(isViewingOther ? otherProfile?.zodiac : ownerZodiac) ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>
                    {isViewingOther ? otherProfile?.zodiac : ownerZodiac}
                  </Text>
                </View>
              ) : null}
              {(isViewingOther ? otherProfile?.mbti : ownerMbti) ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>
                    {isViewingOther ? otherProfile?.mbti : ownerMbti}
                  </Text>
                </View>
              ) : null}
              {(isViewingOther ? otherProfile?.age : ownerAge) ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>
                    {isViewingOther ? otherProfile?.age : ownerAge} tuổi
                  </Text>
                </View>
              ) : null}
              {(isViewingOther ? otherProfile?.education : ownerEducation) ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>
                    {isViewingOther ? otherProfile?.education : ownerEducation}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 4. RELATIONSHIP ACTION BAR (ONLY WHEN VIEWING OTHER USER) */}
          {isViewingOther && otherProfile && (
            <View style={styles.relationshipBarContainer}>
              {/* Friend Button */}
              {otherProfile.friendStatus === 'accepted' ? (
                <TouchableOpacity
                  style={styles.relFriendAcceptedBtn}
                  onPress={() => setConfirmUnfriendVisible(true)}
                  activeOpacity={0.8}
                >
                  <Feather name="check" size={14} color="#2E7D5B" />
                  <Text style={styles.relFriendAcceptedText}>Bạn bè ✓</Text>
                </TouchableOpacity>
              ) : otherProfile.friendStatus === 'pending_outgoing' ? (
                <View style={styles.relFriendPendingBtn}>
                  <Feather name="clock" size={14} color="#8E8074" />
                  <Text style={styles.relFriendPendingText}>Đã gửi lời mời</Text>
                </View>
              ) : otherProfile.friendStatus === 'pending_incoming' ? (
                <TouchableOpacity
                  style={[styles.relPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => acceptFriendRequest(otherProfile.handle)}
                  activeOpacity={0.85}
                >
                  <Feather name="user-check" size={14} color="#FFFFFF" />
                  <Text style={styles.relPrimaryBtnText}>Chấp nhận</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.relPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => sendFriendRequest(otherProfile.handle)}
                  activeOpacity={0.85}
                >
                  <Feather name="user-plus" size={14} color="#FFFFFF" />
                  <Text style={styles.relPrimaryBtnText}>Kết bạn</Text>
                </TouchableOpacity>
              )}

              {/* Follow Button */}
              <TouchableOpacity
                style={[
                  styles.relSecondaryBtn,
                  otherProfile.isFollowing && styles.relSecondaryBtnActive,
                ]}
                onPress={() => toggleFollowUser(otherProfile.handle)}
                activeOpacity={0.8}
              >
                <Feather
                  name={otherProfile.isFollowing ? 'check' : 'plus'}
                  size={14}
                  color={otherProfile.isFollowing ? '#2E7D5B' : '#4A3F35'}
                />
                <Text
                  style={[
                    styles.relSecondaryBtnText,
                    otherProfile.isFollowing && { color: '#2E7D5B' },
                  ]}
                >
                  {otherProfile.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </Text>
              </TouchableOpacity>

              {/* Direct Message Button */}
              <TouchableOpacity
                style={[styles.relMessageBtn, { backgroundColor: '#2C2520' }]}
                onPress={() => startDirectChatWithUser(otherProfile.handle)}
                activeOpacity={0.85}
              >
                <Feather name="message-circle" size={14} color="#FFFFFF" />
                <Text style={styles.relMessageBtnText}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 5. Stats Card */}
          <View style={styles.ownerStatsCard}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumberText}>{displayFollowers}</Text>
              <Text style={styles.statLabelText}>người theo dõi</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statColumn}>
              <Text style={styles.statNumberText}>{displayFollowing}</Text>
              <Text style={styles.statLabelText}>đang theo dõi</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statColumn}>
              <Text style={styles.statNumberText}>{displayLikes}</Text>
              <Text style={styles.statLabelText}>lượt thích</Text>
            </View>
          </View>

          {/* 6. Section Khoảnh Khắc */}
          <View style={styles.momentsHeaderRow}>
            <View style={styles.momentsSubTabsBox}>
              <TouchableOpacity
                onPress={() => setOwnerMediaTab('moments')}
                style={[
                  styles.momentSubTabBtn,
                  ownerMediaTab === 'moments' && styles.momentSubTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.momentSubTabText,
                    ownerMediaTab === 'moments' && styles.momentSubTabTextActive,
                  ]}
                >
                  Khoảnh khắc ({displayPosts.length})
                </Text>
              </TouchableOpacity>

              {!isViewingOther && (
                <TouchableOpacity
                  onPress={() => setOwnerMediaTab('saved')}
                  style={[
                    styles.momentSubTabBtn,
                    ownerMediaTab === 'saved' && styles.momentSubTabBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.momentSubTabText,
                      ownerMediaTab === 'saved' && styles.momentSubTabTextActive,
                    ]}
                  >
                    Được lưu
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isViewingOther && (
              <TouchableOpacity
                style={styles.addPostQuickBtn}
                onPress={() => setActiveModal('new_moment')}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addPostQuickBtnText}>Đăng bài</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 7. Media Grid */}
          <View style={styles.momentsGridContainer}>
            {displayPosts.map((post) => {
              const urls = post.mediaUrls || [];
              const thumb = urls[0] || displayAvatarUrl;
              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.gridThumbItem}
                  activeOpacity={0.88}
                  onPress={() => setSelectedPreviewPost(post)}
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
        </ScrollView>

        {/* ========================================================= */}
        {/* PAGES 1..N: HỒ SƠ TỪNG BÉ THÚ CƯNG (FULLSCREEN PHOTO)     */}
        {/* ========================================================= */}
        {displayedPets.map((pet) => {
          const fallbackForPet =
            pet.species === 'Mèo' ? DEFAULT_FALLBACK_CAT : DEFAULT_FALLBACK_DOG;
          const defaultList =
            pet.species === 'Mèo' ? DEFAULT_CAT_GALLERY : DEFAULT_DOG_GALLERY;
          const cleanGallery = [
            ...(pet.galleryUrls || []),
            pet.coverUrl,
            pet.avatarUrl,
            ...defaultList,
          ].filter(
            (u): u is string =>
              typeof u === 'string' &&
              u.trim().length > 10 &&
              !u.includes('undefined') &&
              !u.includes('null')
          );
          const gallery = Array.from(new Set(cleanGallery));
          const activePhotoIdx = (petGalleryIndices[pet.id] || 0) % gallery.length;
          const currentPetImg = gallery[activePhotoIdx] || fallbackForPet;
          const isExpanded = !!expandedPetDetails[pet.id];
          const isLiked = pet.isLiked ?? false;
          const likesCount = pet.likesCount ?? 148;

          return (
            <View key={pet.id} style={styles.petFullScreenContainer}>
              {/* 1. Fullscreen Background Image */}
              <Image
                source={{ uri: currentPetImg }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />

              {/* 2. Heart Burst Animated Overlay */}
              {burstPetId === pet.id && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.heartBurstWrap,
                    {
                      transform: [{ scale: heartAnimScale }],
                      opacity: heartAnimOpacity,
                    },
                  ]}
                >
                  <Feather name="heart" size={100} color="#FF6F61" />
                </Animated.View>
              )}

              {/* 3. Vertical ScrollView overlying the fullscreen photo: Cuộn xuôi mượt mà */}
              <ScrollView
                style={styles.petScrollOverFullscreen}
                contentContainerStyle={styles.petScrollOverFullscreenContent}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {/* Vùng ảnh kèm các nút điều khiển ảnh cuộn tự nhiên theo ảnh, không đè lên thẻ sổ tiêm */}
                <View style={styles.petPhotoSpacerArea}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={StyleSheet.absoluteFill}
                    onPress={() => handlePetContainerTap(pet.id)}
                  />

                  {/* Top Floating Bar: Loài cún, Nút Tim, Camera, Sửa */}
                  <View style={styles.petTopFloatingBar} pointerEvents="box-none">
                    <View style={styles.petSpeciesPillBadge}>
                      <Text style={styles.petSpeciesPillText}>
                        {pet.species === 'Khác' && pet.customSpecies
                          ? pet.customSpecies
                          : `Loài ${pet.species}`}
                      </Text>
                    </View>

                    <View style={styles.petTopRightActionsRow}>
                      {/* Heart Like */}
                      <TouchableOpacity
                        style={[
                          styles.petFloatingLikeBtn,
                          isLiked && styles.petFloatingLikeBtnActive,
                        ]}
                        onPress={() => togglePetLike(pet.id)}
                        activeOpacity={0.85}
                      >
                        <Feather
                          name="heart"
                          size={15}
                          color={isLiked ? '#FF6F61' : '#FFFFFF'}
                        />
                        <Text
                          style={[
                            styles.petFloatingLikeText,
                            isLiked && { color: '#FF6F61' },
                          ]}
                        >
                          {likesCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Camera: Add photo (ONLY when viewing self) */}
                      {!isViewingOther && (
                        <TouchableOpacity
                          style={styles.petFloatingEditBtn}
                          onPress={() => handleAddPetPhotoFromDevice(pet.id)}
                          activeOpacity={0.85}
                        >
                          <Feather name="camera" size={15} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}

                      {/* Pen: Edit pet (ONLY when viewing self) */}
                      {!isViewingOther && (
                        <TouchableOpacity
                          style={styles.petFloatingEditBtn}
                          onPress={() => openEditPetModal(pet)}
                          activeOpacity={0.85}
                        >
                          <Feather name="edit-2" size={15} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Nút chuyển ảnh Trái/Phải nằm trong vùng ảnh */}
                  {gallery.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={styles.petGalleryPrevBtn}
                        onPress={() => handlePrevPetPhoto(pet.id, gallery.length)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.petGalleryNavArrow}>‹</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.petGalleryNextBtn}
                        onPress={() => handleNextPetPhoto(pet.id, gallery.length)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.petGalleryNavArrow}>›</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Thẻ Kính Mờ: Nhìn thấu ảnh & cuộn xuôi xuống */}
                <View style={styles.petScrollableFrostedCard}>
                  {/* Header: Tên bé & Giống loài */}
                  <View style={styles.petCardHeaderRow}>
                    <Text style={styles.petCardMainName}>{pet.name}</Text>
                    <View style={styles.petBreedFullTag}>
                      <Text style={styles.petBreedFullText}>{pet.breed}</Text>
                    </View>
                  </View>

                  {/* Chi tiết thông số cơ bản */}
                  <View style={styles.petSpecsWrapRow}>
                    <View style={styles.specFrostedChip}>
                      <Text style={styles.specChipLabel}>Giới tính</Text>
                      <Text style={styles.specChipValue}>{pet.gender || 'Đực'}</Text>
                    </View>
                    <View style={styles.specFrostedChip}>
                      <Text style={styles.specChipLabel}>Tuổi</Text>
                      <Text style={styles.specChipValue}>{pet.ageLabel}</Text>
                    </View>
                    <View style={styles.specFrostedChip}>
                      <Text style={styles.specChipLabel}>Cân nặng</Text>
                      <Text style={styles.specChipValue}>{pet.weightKg} kg</Text>
                    </View>
                    {pet.birthDate ? (
                      <View style={styles.specFrostedChip}>
                        <Text style={styles.specChipLabel}>Ngày sinh</Text>
                        <Text style={styles.specChipValue}>{pet.birthDate}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Toggle button: Hiện thêm chi tiết */}
                  <TouchableOpacity
                    style={styles.expandToggleBtn}
                    onPress={() => togglePetDetailsExpanded(pet.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.expandToggleBtnText}>
                      {isExpanded ? 'Thu gọn chi tiết ⌃' : 'Hiện thêm chi tiết sức khỏe & sổ tiêm ⌄'}
                    </Text>
                  </TouchableOpacity>

                  {/* Vùng chi tiết mở rộng */}
                  {isExpanded && (
                    <View style={styles.petExpandedFlowSection}>
                      {/* Tính cách & Giới thiệu */}
                      {pet.bio ? (
                        <View style={styles.petDetailCardRow}>
                          <Text style={styles.petDetailCardLabel}>Tính cách & Giới thiệu:</Text>
                          <Text style={styles.petDetailCardValue}>{pet.bio}</Text>
                        </View>
                      ) : null}

                      {/* Thói quen tốt */}
                      {pet.goodHabits && pet.goodHabits.length > 0 && (
                        <View style={styles.petDetailCardRow}>
                          <Text style={styles.petDetailCardLabel}>Thói quen tốt:</Text>
                          <View style={styles.habitsBadgesWrap}>
                            {pet.goodHabits.map((habit, hIdx) => (
                              <View key={hIdx} style={styles.habitBadgeChip}>
                                <Text style={styles.habitBadgeText}>• {habit}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Lưu ý khi dạo chung */}
                      {pet.cautionHabits && pet.cautionHabits.length > 0 && (
                        <View style={styles.petDetailCardRow}>
                          <Text style={styles.petDetailCardLabel}>Lưu ý khi dạo chung:</Text>
                          <View style={styles.habitsBadgesWrap}>
                            {pet.cautionHabits.map((caution, cIdx) => (
                              <View key={cIdx} style={styles.cautionBadgeChip}>
                                <Text style={styles.cautionBadgeText}>• {caution}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Sở thích ăn uống */}
                      <View style={styles.petDetailCardRow}>
                        <Text style={styles.petDetailCardLabel}>Sở thích ăn uống:</Text>
                        <Text style={styles.petDetailCardValue}>
                          {pet.favoriteFood || 'Ức gà luộc, pate cá hồi, súp thưởng'}
                        </Text>
                      </View>

                      {/* Lịch sử tẩy giun */}
                      <View style={styles.petDetailCardRow}>
                        <Text style={styles.petDetailCardLabel}>Lịch sử tẩy giun:</Text>
                        <Text style={styles.petDetailCardValue}>
                          {pet.dewormingHistory || 'Định kỳ 3 tháng/lần'}
                        </Text>
                      </View>

                      {/* Tiền sử bệnh lý */}
                      <View style={styles.petDetailCardRow}>
                        <Text style={styles.petDetailCardLabel}>Tiền sử bệnh lý:</Text>
                        <Text style={styles.petDetailCardValue}>
                          {pet.medicalHistory || 'Khỏe mạnh, không có bệnh nền'}
                        </Text>
                      </View>

                      {/* Sổ tiêm chủng chi tiết */}
                      <View style={styles.petHealthSectionBox}>
                        <Text style={styles.petHealthSectionTitle}>
                          Sổ tiêm chủng & Vắc-xin:
                        </Text>
                        {(pet.vaccineRecords && pet.vaccineRecords.length > 0
                          ? pet.vaccineRecords
                          : [
                              {
                                id: 'v-1',
                                vaccineName: 'Phòng dại & 7 bệnh cơ bản',
                                date: '01/10/2025',
                                doseNumber: 1,
                                clinic: 'Bệnh viện thú y Pawty Care',
                                isSafeVerified: true,
                              },
                            ]
                        ).map((vac) => (
                          <View key={vac.id} style={styles.vaccineCardItem}>
                            <View style={styles.vaccineItemHeader}>
                              <Feather name="shield" size={13} color="#A3E4D7" />
                              <Text style={styles.vaccineItemName}>{vac.vaccineName}</Text>
                              <View style={styles.doseBadge}>
                                <Text style={styles.doseBadgeText}>Mũi {vac.doseNumber}</Text>
                              </View>
                            </View>
                            <Text style={styles.vaccineItemSub}>
                              Ngày: {vac.date} • {vac.clinic || 'Phòng khám thú y'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* CTA Button */}
                  <TouchableOpacity
                    style={styles.petCtaBookWalkBtn}
                    onPress={() => {
                      if (isViewingOther && otherProfile) {
                        startDirectChatWithUser(otherProfile.handle);
                      } else {
                        showToast(`Bé ${pet.name} đã sẵn sàng dắt dạo công viên!`);
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.petCtaBookWalkText}>
                      {isViewingOther ? 'Hẹn dạo cùng bé' : 'Lên lịch dạo cùng Boss'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* ============================================================= */}
      {/* POPUP: HAMBURGER MENU (ZERO VIP REFERENCE)                    */}
      {/* ============================================================= */}
      <Modal
        visible={isProfileMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsProfileMenuVisible(false)}
      >
        <View style={styles.cleanModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setIsProfileMenuVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.cleanModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Cài đặt & Tùy chọn</Text>
              <TouchableOpacity
                onPress={() => setIsProfileMenuVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuOptionsList}>
              <TouchableOpacity
                style={styles.menuItemRow}
                onPress={() => {
                  setIsProfileMenuVisible(false);
                  openEditOwnerModal();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.menuItemIconWrap, { backgroundColor: '#FFF0EE' }]}>
                  <Feather name="shield" size={16} color="#FF6F61" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Cài đặt tài khoản & Quyền riêng tư</Text>
                  <Text style={styles.menuItemDesc}>Quản lý thông tin và ẩn/hiện hồ sơ</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#BDB4AC" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemRow}
                onPress={() => {
                  setIsProfileMenuVisible(false);
                  setActiveModal('tinder_setup');
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.menuItemIconWrap, { backgroundColor: '#E8F8F5' }]}>
                  <Feather name="heart" size={16} color="#27AE60" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Thiết lập hồ sơ kết nối</Text>
                  <Text style={styles.menuItemDesc}>Mục đích tìm kiếm & lối sống</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#BDB4AC" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItemRow, { borderBottomWidth: 0, marginTop: 4 }]}
                onPress={() => {
                  setIsProfileMenuVisible(false);
                  logoutUser();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.menuItemIconWrap, { backgroundColor: '#FDEDEC' }]}>
                  <Feather name="log-out" size={16} color="#E74C3C" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: '#E74C3C' }]}>
                    Đăng xuất tài khoản
                  </Text>
                  <Text style={styles.menuItemDesc}>Đăng xuất khỏi thiết bị này</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 1: GHI CHÚ (NOTE BUBBLE)                                */}
      {/* ============================================================= */}
      <Modal visible={isEditingNote} transparent animationType="fade" onRequestClose={() => setIsEditingNote(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.cleanModalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setIsEditingNote(false)}
            activeOpacity={1}
          />
          <View style={styles.cleanModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Ghi chú</Text>
              <TouchableOpacity onPress={() => setIsEditingNote(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            <Text style={styles.cleanModalSubtitle}>
              Ghi chú ngắn sẽ hiển thị trên avatar của bạn (tối đa 60 ký tự).
            </Text>

            <TextInput
              style={styles.cleanTextInputArea}
              placeholder="Nhập suy nghĩ hoặc lời nhắn của bạn..."
              placeholderTextColor="#A89E94"
              value={tempNoteText}
              onChangeText={setTempNoteText}
              maxLength={60}
              multiline
            />

            <View style={styles.cleanModalActionRow}>
              {ownerNoteBubble ? (
                <TouchableOpacity
                  style={styles.cleanDeleteTextBtn}
                  onPress={() => {
                    setOwnerNoteBubble('');
                    setIsEditingNote(false);
                    showToast('Đã xóa ghi chú');
                  }}
                >
                  <Text style={styles.cleanDeleteTextBtnText}>Xóa ghi chú</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.cleanSubmitBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setOwnerNoteBubble(tempNoteText.trim());
                  setIsEditingNote(false);
                  showToast('Đã lưu ghi chú mới');
                }}
              >
                <Text style={styles.cleanSubmitBtnText}>Lưu ghi chú</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 2: ĐỔI ẢNH BÌA                                          */}
      {/* ============================================================= */}
      <Modal visible={isChangingCoverModal} transparent animationType="slide" onRequestClose={() => setIsChangingCoverModal(false)}>
        <View style={styles.cleanModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setIsChangingCoverModal(false)}
            activeOpacity={1}
          />
          <View style={styles.cleanModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Đổi ảnh bìa</Text>
              <TouchableOpacity onPress={() => setIsChangingCoverModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.pickFromDeviceBtn} onPress={handlePickCoverFromDevice} activeOpacity={0.85}>
              <Feather name="image" size={18} color="#1C1815" />
              <Text style={styles.pickFromDeviceBtnText}>Tải ảnh từ thư viện thiết bị</Text>
            </TouchableOpacity>

            <Text style={styles.presetSectionTitle}>Hoặc chọn ảnh phong cảnh mẫu:</Text>
            <View style={styles.coverPresetsRow}>
              {COVER_PRESETS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.coverPresetItem}
                  onPress={() => {
                    setOwnerCoverUrl(item.url);
                    setIsChangingCoverModal(false);
                    showToast(`Đã chọn ảnh bìa: ${item.name}`);
                  }}
                >
                  <Image source={{ uri: item.url }} style={styles.coverPresetThumb} />
                  <Text style={styles.coverPresetName} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 3: CHỈNH SỬA HỒ SƠ CON SEN (SELECTOR-FIRST)             */}
      {/* ============================================================= */}
      <Modal visible={isEditingOwnerProfile} transparent animationType="slide" onRequestClose={() => setIsEditingOwnerProfile(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.cleanModalOverlay}>
          <View style={styles.fullscreenModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Chỉnh sửa Hồ sơ Con sen</Text>
              <TouchableOpacity onPress={() => setIsEditingOwnerProfile(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Họ và tên */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.fieldLabel}>Họ và tên của bạn *</Text>
                  <Text style={styles.counterText}>{ownerDraftName.length}/35</Text>
                </View>
                <TextInput
                  style={styles.fieldInput}
                  maxLength={35}
                  value={ownerDraftName}
                  onChangeText={setOwnerDraftName}
                  placeholder="Nhập tên của bạn"
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Giới tính & Tuổi (Dùng Selector) */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Giới tính</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn giới tính', ['Nữ', 'Nam', 'Khác'], ownerDraftGender, (val) =>
                        setOwnerDraftGender(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftGender || 'Chọn'}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Độ tuổi</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn độ tuổi', OWNER_AGE_OPTIONS, ownerDraftAge, (val) =>
                        setOwnerDraftAge(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftAge} tuổi</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ngày sinh (Date Picker) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Ngày sinh</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() => {
                    setDatePickerConfig({
                      visible: true,
                      title: 'Chọn ngày sinh',
                      initialDate: ownerDraftBirthDate || '15/08/2000',
                      isPet: false,
                      onConfirm: (date) => setOwnerDraftBirthDate(date),
                    });
                  }}
                >
                  <Text style={styles.pickerSelectorBtnText}>{ownerDraftBirthDate || 'Chọn ngày sinh'}</Text>
                  <Feather name="calendar" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Cung hoàng đạo & MBTI (Selector) */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Cung hoàng đạo</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn cung hoàng đạo', ZODIAC_OPTIONS, ownerDraftZodiac, (val) =>
                        setOwnerDraftZodiac(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftZodiac || 'Chọn'}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>MBTI</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn nhóm tính cách MBTI', MBTI_OPTIONS, ownerDraftMbti, (val) =>
                        setOwnerDraftMbti(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftMbti || 'Chọn'}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Khu vực sinh sống (Selector) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Khu vực sinh sống</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openSelector('Chọn khu vực sinh sống', LIVING_AREA_OPTIONS, ownerDraftArea, (val) =>
                      setOwnerDraftArea(val)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {ownerDraftArea || 'Chọn khu vực sinh sống...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Nghề nghiệp (Selector) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Nghề nghiệp hiện tại</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openSelector('Chọn nghề nghiệp', OCCUPATION_OPTIONS, ownerDraftOccupation, (val) =>
                      setOwnerDraftOccupation(val)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {ownerDraftOccupation || 'Chọn nghề nghiệp...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Học vấn / Trường học (Selector) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Học vấn / Trường tốt nghiệp</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openSelector('Chọn học vấn & trường', EDUCATION_OPTIONS, ownerDraftEducation, (val) =>
                      setOwnerDraftEducation(val)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {ownerDraftEducation || 'Chọn học vấn...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Câu giới thiệu bản thân */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.fieldLabel}>Câu giới thiệu bản thân</Text>
                  <Text style={styles.counterText}>{ownerDraftBio.length}/150</Text>
                </View>
                <TextInput
                  style={[styles.fieldInput, { height: 75, textAlignVertical: 'top' }]}
                  maxLength={150}
                  value={ownerDraftBio}
                  onChangeText={setOwnerDraftBio}
                  placeholder="Viết đôi dòng về bạn và sở thích nuôi Boss..."
                  placeholderTextColor="#A89E94"
                  multiline
                />
              </View>

              {/* Quyền riêng tư: Bật/Tắt công khai */}
              <View style={styles.privacySectionBox}>
                <Text style={styles.privacySectionTitle}>Quyền riêng tư hồ sơ</Text>
                <Text style={styles.privacySectionDesc}>
                  Chọn thông tin bạn muốn hiển thị công khai trên trang cá nhân:
                </Text>

                {[
                  { key: 'gender', label: 'Giới tính' },
                  { key: 'age', label: 'Độ tuổi' },
                  { key: 'birthDate', label: 'Ngày sinh' },
                  { key: 'zodiac', label: 'Cung hoàng đạo' },
                  { key: 'mbti', label: 'Nhóm tính cách MBTI' },
                  { key: 'education', label: 'Học vấn & Trường' },
                  { key: 'occupation', label: 'Nghề nghiệp' },
                  { key: 'area', label: 'Khu vực sinh sống' },
                ].map((item) => {
                  const isPub = ownerDraftPrivacy[item.key] !== false;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.privacyToggleRow}
                      onPress={() => {
                        setOwnerDraftPrivacy((prev) => ({
                          ...prev,
                          [item.key]: !isPub,
                        }));
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.privacyToggleLabel}>{item.label}</Text>
                      <View style={[styles.privacyBadgeTag, isPub ? styles.privacyBadgePublic : styles.privacyBadgeHidden]}>
                        <Text style={[styles.privacyBadgeText, isPub ? styles.privacyBadgeTextPublic : styles.privacyBadgeTextHidden]}>
                          {isPub ? 'Công khai' : 'Đang ẩn'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[styles.cleanSubmitBtn, { backgroundColor: theme.primary, width: '100%' }]}
                onPress={handleSaveOwnerProfile}
              >
                <Text style={styles.cleanSubmitBtnText}>Lưu Hồ sơ Con sen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 4: THÊM BÉ CƯNG MỚI (ATOMIC & SELECTOR-FIRST)           */}
      {/* ============================================================= */}
      <Modal visible={isAddingPetModal} transparent animationType="slide" onRequestClose={() => setIsAddingPetModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.cleanModalOverlay}>
          <View style={styles.fullscreenModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Thêm bé cưng mới</Text>
              <TouchableOpacity onPress={() => setIsAddingPetModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Ảnh thú cưng */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Ảnh thú cưng</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.newPetPhotoPlaceholder}
                    onPress={handlePickNewPetPhoto}
                    activeOpacity={0.8}
                  >
                    {newPetPhotoUrl ? (
                      <Image source={{ uri: newPetPhotoUrl }} style={styles.newPetPhotoImg} />
                    ) : (
                      <View style={styles.newPetPhotoEmpty}>
                        <Feather name="camera" size={24} color="#FF6F61" />
                        <Text style={styles.newPetPhotoEmptyText}>Chọn ảnh</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1815' }}>
                      Hình ảnh đại diện của bé
                    </Text>
                    <Text style={{ fontSize: 11, color: '#7E6E60', marginTop: 2 }}>
                      Ảnh sẽ hiển thị trên thẻ radar và hồ sơ toàn màn hình.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Loài thú cưng */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Loài thú cưng</Text>
                <View style={styles.speciesChoiceRow}>
                  {(['Chó', 'Mèo', 'Khác'] as const).map((sp) => (
                    <TouchableOpacity
                      key={sp}
                      style={[styles.speciesChoiceBtn, newPetSpecies === sp && styles.speciesChoiceBtnActive]}
                      onPress={() => {
                        setNewPetSpecies(sp);
                        if (sp === 'Chó') setNewPetBreed(POPULAR_DOG_BREEDS[0]);
                        else if (sp === 'Mèo') setNewPetBreed(POPULAR_CAT_BREEDS[0]);
                        else setNewPetBreed(OTHER_SPECIES_OPTIONS[0]);
                      }}
                    >
                      <Text style={[styles.speciesChoiceText, newPetSpecies === sp && styles.speciesChoiceTextActive]}>
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tên bé */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.fieldLabel}>Tên của bé *</Text>
                  <Text style={styles.counterText}>{newPetName.length}/30</Text>
                </View>
                <TextInput
                  style={styles.fieldInput}
                  maxLength={30}
                  placeholder="VD: Bơ, Miu, Coca..."
                  placeholderTextColor="#A89E94"
                  value={newPetName}
                  onChangeText={setNewPetName}
                />
              </View>

              {/* Giống & Giới tính */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Giống</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      const options =
                        newPetSpecies === 'Chó'
                          ? POPULAR_DOG_BREEDS
                          : newPetSpecies === 'Mèo'
                          ? POPULAR_CAT_BREEDS
                          : OTHER_SPECIES_OPTIONS;
                      openSelector(`Chọn giống ${newPetSpecies.toLowerCase()}`, options, newPetBreed, (val) => {
                        setNewPetBreed(val);
                        if (newPetSpecies === 'Khác') setNewPetCustomSpecies(val);
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                      {newPetBreed || 'Chọn giống...'}
                    </Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Giới tính</Text>
                  <View style={styles.genderRow}>
                    {(['Đực', 'Cái'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderChoiceBtn, newPetGender === g && styles.genderChoiceBtnActive]}
                        onPress={() => setNewPetGender(g)}
                      >
                        <Text style={[styles.genderChoiceText, newPetGender === g && styles.genderChoiceTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Ngày sinh & Độ tuổi */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Ngày sinh</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      setDatePickerConfig({
                        visible: true,
                        title: 'Chọn ngày sinh của bé',
                        initialDate: newPetBirthDate || '01/01/2024',
                        isPet: true,
                        onConfirm: (date) => setNewPetBirthDate(date),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{newPetBirthDate || 'Chọn ngày'}</Text>
                    <Feather name="calendar" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Độ tuổi</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn độ tuổi của bé', PET_AGE_OPTIONS, newPetAge, (val) =>
                        setNewPetAge(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{newPetAge}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cân nặng & Màu lông */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Cân nặng</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn cân nặng (kg)', PET_WEIGHT_OPTIONS, newPetWeight, (val) =>
                        setNewPetWeight(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{newPetWeight} kg</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Màu lông</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn màu lông', PET_FUR_COLOR_OPTIONS, newPetFurColor, (val) =>
                        setNewPetFurColor(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                      {newPetFurColor}
                    </Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Thức ăn & Tẩy giun */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Sở thích ăn uống</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openSelector('Sở thích ăn uống', PET_FOOD_OPTIONS, newPetFavoriteFood, (val) =>
                      setNewPetFavoriteFood(val)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {newPetFavoriteFood}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lịch sử tẩy giun</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openSelector('Lịch sử tẩy giun', PET_DEWORMING_OPTIONS, newPetDewormingHistory, (val) =>
                      setNewPetDewormingHistory(val)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {newPetDewormingHistory}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Tiền sử bệnh lý</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openSelector('Tiền sử bệnh lý', PET_MEDICAL_OPTIONS, newPetMedicalHistory, (val) =>
                      setNewPetMedicalHistory(val)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {newPetMedicalHistory}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Thói quen tốt (Multi-select) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Thói quen tốt</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openMultiSelector(
                      'Chọn thói quen tốt của bé',
                      PET_GOOD_HABIT_OPTIONS,
                      newPetGoodHabits,
                      (vals) => setNewPetGoodHabits(vals)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {newPetGoodHabits.length > 0
                      ? newPetGoodHabits.join(', ')
                      : 'Chọn thói quen tốt...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Lưu ý khi dạo chung (Multi-select) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lưu ý khi dạo chung</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openMultiSelector(
                      'Chọn lưu ý khi dạo chung',
                      PET_CAUTION_HABIT_OPTIONS,
                      newPetCautionHabits,
                      (vals) => setNewPetCautionHabits(vals)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {newPetCautionHabits.length > 0
                      ? newPetCautionHabits.join(', ')
                      : 'Chọn lưu ý...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Mô tả tính cách */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.fieldLabel}>Tự mô tả tính cách bé</Text>
                  <Text style={styles.counterText}>{newPetBio.length}/160</Text>
                </View>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  maxLength={160}
                  placeholder="Bé hiền lành, thích chạy nhảy, thích chơi ném bóng..."
                  placeholderTextColor="#A89E94"
                  value={newPetBio}
                  onChangeText={setNewPetBio}
                  multiline
                />
              </View>

              {/* Tiêm chủng chứng nhận */}
              <TouchableOpacity
                style={[
                  styles.unifiedTickBox,
                  newPetVaccinated && {
                    backgroundColor: '#EAF7F1',
                    borderColor: '#3E8E6C',
                  },
                ]}
                onPress={() => setNewPetVaccinated(!newPetVaccinated)}
              >
                <View
                  style={[
                    styles.tickSquare,
                    newPetVaccinated && {
                      backgroundColor: '#3E8E6C',
                      borderColor: '#3E8E6C',
                    },
                  ]}
                >
                  {newPetVaccinated && <Feather name="check" size={14} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tickTitle}>
                    Đã tiêm chủng & Phòng bệnh dại đầy đủ
                  </Text>
                  <Text style={styles.tickSub}>
                    Hiển thị chứng nhận an toàn xanh trên hồ sơ radar của bé
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[
                  styles.cleanSubmitBtn,
                  { backgroundColor: theme.primary, width: '100%', opacity: isCreatingPetSubmitting ? 0.7 : 1 },
                ]}
                disabled={isCreatingPetSubmitting}
                onPress={handleAddNewPet}
              >
                {isCreatingPetSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="check" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.cleanSubmitBtnText}>
                  {isCreatingPetSubmitting ? 'Đang tạo hồ sơ...' : 'Lưu Hồ sơ Thú cưng'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 5: CHỈNH SỬA THÚ CƯNG (SELECTOR-FIRST)                  */}
      {/* ============================================================= */}
      <Modal visible={!!editingPet} transparent animationType="slide" onRequestClose={() => setEditingPet(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.cleanModalOverlay}>
          <View style={styles.fullscreenModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Chỉnh sửa Hồ sơ Bé cưng</Text>
              <TouchableOpacity onPress={() => setEditingPet(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Tên bé */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.fieldLabel}>Tên của bé *</Text>
                  <Text style={styles.counterText}>{editPetNameDraft.length}/30</Text>
                </View>
                <TextInput
                  style={styles.fieldInput}
                  maxLength={30}
                  value={editPetNameDraft}
                  onChangeText={setEditPetNameDraft}
                  placeholder="Tên bé"
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Giống loài */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Loài thú cưng</Text>
                <View style={styles.speciesChoiceRow}>
                  {(['Chó', 'Mèo', 'Khác'] as const).map((sp) => (
                    <TouchableOpacity
                      key={sp}
                      style={[styles.speciesChoiceBtn, editPetSpeciesDraft === sp && styles.speciesChoiceBtnActive]}
                      onPress={() => {
                        setEditPetSpeciesDraft(sp);
                        if (sp === 'Chó') setEditPetBreedDraft(POPULAR_DOG_BREEDS[0]);
                        else if (sp === 'Mèo') setEditPetBreedDraft(POPULAR_CAT_BREEDS[0]);
                        else setEditPetBreedDraft(OTHER_SPECIES_OPTIONS[0]);
                      }}
                    >
                      <Text style={[styles.speciesChoiceText, editPetSpeciesDraft === sp && styles.speciesChoiceTextActive]}>
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Giống & Giới tính */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Giống</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      const options =
                        editPetSpeciesDraft === 'Chó'
                          ? POPULAR_DOG_BREEDS
                          : editPetSpeciesDraft === 'Mèo'
                          ? POPULAR_CAT_BREEDS
                          : OTHER_SPECIES_OPTIONS;
                      openSelector(
                        `Chọn giống ${editPetSpeciesDraft.toLowerCase()}`,
                        options,
                        editPetBreedDraft,
                        (val) => {
                          setEditPetBreedDraft(val);
                          if (editPetSpeciesDraft === 'Khác') setEditPetCustomSpeciesDraft(val);
                        }
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                      {editPetBreedDraft || 'Chọn giống...'}
                    </Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Giới tính</Text>
                  <View style={styles.genderRow}>
                    {(['Đực', 'Cái'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderChoiceBtn, editPetGenderDraft === g && styles.genderChoiceBtnActive]}
                        onPress={() => setEditPetGenderDraft(g)}
                      >
                        <Text style={[styles.genderChoiceText, editPetGenderDraft === g && styles.genderChoiceTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Độ tuổi & Cân nặng */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Độ tuổi</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn độ tuổi của bé', PET_AGE_OPTIONS, editPetAgeDraft, (val) =>
                        setEditPetAgeDraft(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{editPetAgeDraft}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Cân nặng</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() =>
                      openSelector('Chọn cân nặng (kg)', PET_WEIGHT_OPTIONS, editPetWeightDraft, (val) =>
                        setEditPetWeightDraft(val)
                      )
                    }
                  >
                    <Text style={styles.pickerSelectorBtnText}>{editPetWeightDraft} kg</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Thói quen tốt */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Thói quen tốt</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openMultiSelector(
                      'Chọn thói quen tốt của bé',
                      PET_GOOD_HABIT_OPTIONS,
                      editPetGoodHabitsDraft,
                      (vals) => setEditPetGoodHabitsDraft(vals)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {editPetGoodHabitsDraft.length > 0
                      ? editPetGoodHabitsDraft.join(', ')
                      : 'Chọn thói quen tốt...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Lưu ý khi dạo chung */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lưu ý khi dạo chung</Text>
                <TouchableOpacity
                  style={styles.pickerSelectorBtn}
                  onPress={() =>
                    openMultiSelector(
                      'Chọn lưu ý khi dạo chung',
                      PET_CAUTION_HABIT_OPTIONS,
                      editPetCautionHabitsDraft,
                      (vals) => setEditPetCautionHabitsDraft(vals)
                    )
                  }
                >
                  <Text style={styles.pickerSelectorBtnText} numberOfLines={1}>
                    {editPetCautionHabitsDraft.length > 0
                      ? editPetCautionHabitsDraft.join(', ')
                      : 'Chọn lưu ý...'}
                  </Text>
                  <Feather name="chevron-down" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              {/* Mô tả tính cách */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelBetweenRow}>
                  <Text style={styles.fieldLabel}>Mô tả tính cách & Giới thiệu</Text>
                  <Text style={styles.counterText}>{editPetBioDraft.length}/160</Text>
                </View>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  maxLength={160}
                  value={editPetBioDraft}
                  onChangeText={setEditPetBioDraft}
                  multiline
                />
              </View>

              {/* Xóa hồ sơ bé này */}
              {editingPet && (
                <TouchableOpacity
                  style={styles.deletePetFullBtn}
                  onPress={() => {
                    deletePetProfile(editingPet.id);
                    setEditingPet(null);
                    scrollToPage(0);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="trash-2" size={16} color="#E15B4C" />
                  <Text style={styles.deletePetFullBtnText}>Xóa hồ sơ bé này khỏi tài khoản</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[styles.cleanSubmitBtn, { backgroundColor: theme.primary, width: '100%' }]}
                onPress={handleSavePetEdits}
              >
                <Text style={styles.cleanSubmitBtnText}>Lưu Thay đổi Bé cưng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 6: POST PREVIEW MODAL                                   */}
      {/* ============================================================= */}
      <Modal visible={!!selectedPreviewPost} transparent animationType="fade" onRequestClose={() => setSelectedPreviewPost(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedPreviewPost(null)}
            activeOpacity={1}
          />
          {selectedPreviewPost && (
            <View style={styles.previewCard}>
              <View style={styles.previewHeaderRow}>
                <Image
                  source={{ uri: selectedPreviewPost.authorAvatar || displayAvatarUrl }}
                  style={styles.postPreviewAvatar}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.previewAuthorHandle}>{displayName || 'Bạn'}</Text>
                  <Text style={styles.previewMetaText}>Vừa xong • Công khai</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPreviewPost(null)} style={styles.previewCloseBtn}>
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  openLightboxMedia({
                    postId: selectedPreviewPost.id,
                    mediaUrls: selectedPreviewPost.mediaUrls || [displayAvatarUrl],
                    mediaType: selectedPreviewPost.mediaType || 'image',
                    initialIndex: 0,
                    authorName: selectedPreviewPost.authorName,
                    caption: selectedPreviewPost.content,
                  });
                }}
              >
                <Image
                  source={{ uri: selectedPreviewPost.mediaUrls?.[0] || displayAvatarUrl }}
                  style={styles.previewPostImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <View style={styles.previewCaptionBox}>
                <View style={styles.previewLikeCountRow}>
                  <Feather name="heart" size={14} color="#FF6F61" />
                  <Text style={styles.previewLikeCountText}>
                    {selectedPreviewPost.reactions?.love || 120} lượt thích
                  </Text>
                </View>
                <Text style={styles.previewCaptionText} numberOfLines={3}>
                  {selectedPreviewPost.content}
                </Text>
              </View>

              <View style={styles.previewActionsContainer}>
                <TouchableOpacity
                  style={styles.previewMainActionBtn}
                  onPress={() => {
                    const target = selectedPreviewPost;
                    setSelectedPreviewPost(null);
                    setActivePostDetail(target);
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="message-circle" size={16} color="#A3E4D7" />
                  <Text style={styles.postPreviewActionText}>Xem chi tiết bài viết</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewSecondaryActionBtn}
                  onPress={() => {
                    toggleReaction(selectedPreviewPost.id, 'love');
                    showToast('Đã thả tim bài viết!');
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="heart" size={15} color="#FF6F61" />
                  <Text style={styles.previewSecondaryActionText}>Thả tim</Text>
                </TouchableOpacity>

                {!isViewingOther && (
                  <TouchableOpacity
                    style={styles.previewDangerActionBtn}
                    onPress={() => {
                      deletePost(selectedPreviewPost.id);
                      setSelectedPreviewPost(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="trash-2" size={15} color="#E15B4C" />
                    <Text style={styles.previewDangerActionText}>Xóa khỏi bảng tin</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 7: POST DETAIL MODAL (COMMENTS)                          */}
      {/* ============================================================= */}
      <Modal visible={!!activePostDetail} transparent animationType="slide" onRequestClose={() => setActivePostDetail(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.cleanModalOverlay}>
          <View style={styles.fullscreenModalCard}>
            <View style={styles.cleanModalHeaderRow}>
              <Text style={styles.cleanModalTitle}>Chi tiết bài viết</Text>
              <TouchableOpacity onPress={() => setActivePostDetail(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color="#7E6E60" />
              </TouchableOpacity>
            </View>

            {activePostDetail && (
              <>
                <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.postDetailAuthorRow}>
                    <Image
                      source={{ uri: activePostDetail.authorAvatar || displayAvatarUrl }}
                      style={styles.postDetailAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.postDetailAuthorName}>{activePostDetail.authorName}</Text>
                      
                    </View>
                  </View>

                  <Image
                    source={{ uri: activePostDetail.mediaUrls?.[0] || displayAvatarUrl }}
                    style={styles.postDetailImage}
                    resizeMode="cover"
                  />

                  <Text style={styles.postDetailContentText}>{activePostDetail.content}</Text>

                  <View style={styles.postDetailReactionsRow}>
                    <TouchableOpacity
                      style={styles.reactionPill}
                      onPress={() => toggleReaction(activePostDetail.id, 'love')}
                    >
                      <Feather name="heart" size={14} color="#FF6F61" />
                      <Text style={styles.reactionPillText}>{activePostDetail.reactions?.love || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.reactionPill}
                      onPress={() => toggleReaction(activePostDetail.id, 'paws')}
                    >
                      <Feather name="smile" size={14} color="#A3E4D7" />
                      <Text style={styles.reactionPillText}>{activePostDetail.reactions?.paws || 0}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.commentsListBlock}>
                    <Text style={styles.commentsHeaderTitle}>
                      Bình luận ({activePostDetail.comments?.length || 0})
                    </Text>

                    {(activePostDetail.comments || []).map((cmt) => (
                      <View key={cmt.id} style={styles.commentItemWrap}>
                        <View style={styles.commentRow}>
                          <Image source={{ uri: cmt.authorAvatar || displayAvatarUrl }} style={styles.commentAvatar} />
                          <View style={styles.commentBubble}>
                            <Text style={styles.commentAuthorName}>{cmt.authorName}</Text>
                            <Text style={styles.commentContentText}>{cmt.content}</Text>
                            <View style={styles.commentMetaRow}>
                              <Text style={styles.commentTimeText}>{cmt.createdAt}</Text>
                              <TouchableOpacity onPress={() => setReplyingCommentId(cmt.id)}>
                                <Text style={styles.commentReplyLink}>Trả lời</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.commentLikeBtn}
                            onPress={() => toggleCommentLike(activePostDetail.id, cmt.id)}
                          >
                            <Feather name="heart" size={12} color={cmt.isLiked ? '#FF6F61' : '#A89E94'} />
                            <Text style={[styles.commentLikeCount, cmt.isLiked && { color: '#FF6F61' }]}>
                              {cmt.likesCount || 0}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {(cmt.replies || []).map((rep) => (
                          <View key={rep.id} style={styles.replyRow}>
                            <Image source={{ uri: rep.authorAvatar || displayAvatarUrl }} style={styles.replyAvatar} />
                            <View style={styles.replyBubble}>
                              <Text style={styles.commentAuthorName}>{rep.authorName}</Text>
                              <Text style={styles.commentContentText}>{rep.content}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.commentInputBar}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={replyingCommentId ? 'Trả lời bình luận...' : 'Viết bình luận...'}
                    placeholderTextColor="#A89E94"
                    value={commentInputText}
                    onChangeText={setCommentInputText}
                  />
                  <TouchableOpacity
                    style={styles.commentSendBtn}
                    onPress={() => {
                      if (!commentInputText.trim()) return;
                      if (replyingCommentId) {
                        addCommentReply(activePostDetail.id, replyingCommentId, commentInputText.trim());
                        setReplyingCommentId(null);
                      } else {
                        addComment(activePostDetail.id, commentInputText.trim());
                      }
                      setCommentInputText('');
                    }}
                  >
                    <Feather name="send" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* 8. SHARED SELECTOR PICKER MODAL                               */}
      {/* ============================================================= */}
      <SelectorPickerModal
        visible={selectorConfig.visible}
        title={selectorConfig.title}
        options={selectorConfig.options}
        selectedValue={selectorConfig.selectedValue}
        selectedValues={selectorConfig.selectedValues}
        multiSelect={selectorConfig.multiSelect}
        onSelect={selectorConfig.onSelect}
        onSelectMulti={selectorConfig.onSelectMulti}
        onClose={() => setSelectorConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* ============================================================= */}
      {/* 9. DATE PICKER MODAL                                          */}
      {/* ============================================================= */}
      <DatePickerModal
        visible={datePickerConfig.visible}
        title={datePickerConfig.title}
        initialDate={datePickerConfig.initialDate}
        isPet={datePickerConfig.isPet}
        onConfirm={datePickerConfig.onConfirm}
        onClose={() => setDatePickerConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* ============================================================= */}
      {/* 10. CONFIRM ACTION MODAL FOR UNFRIEND                         */}
      {/* ============================================================= */}
      {otherProfile && (
        <ConfirmActionModal
          visible={confirmUnfriendVisible}
          title="Hủy kết bạn?"
          message={`Bạn có chắc muốn hủy kết bạn với ${otherProfile.name}? Sau khi hủy kết bạn, hai bên sẽ không thể tiếp tục nhắn tin trò chuyện với nhau.`}
          confirmLabel="Hủy kết bạn"
          cancelLabel="Giữ lại"
          danger
          onCancel={() => setConfirmUnfriendVisible(false)}
          onConfirm={async () => {
            setConfirmUnfriendVisible(false);
            await unfriendUser(otherProfile.handle);
          }}
        />
      )}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */
const dateStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  datePickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1815',
  },
  closeBtn: {
    padding: 6,
  },
  dateColsContainer: {
    flexDirection: 'row',
    height: 190,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dateCol: {
    flex: 1,
    alignItems: 'center',
  },
  dateColHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A7D75',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateColScroll: {
    width: '100%',
  },
  dateItemPill: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  dateItemPillActive: {
    backgroundColor: '#FF6F61',
  },
  dateItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A332C',
  },
  dateItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  datePreviewRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  datePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F61',
  },
  confirmBtn: {
    backgroundColor: '#FF6F61',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  topProfileHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FDFBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  headerPillsScrollContent: {
    alignItems: 'center',
    paddingRight: 10,
    gap: 8,
  },
  headerPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  headerPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A4E47',
  },
  headerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerAddPetPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerHamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  horizontalPagingScroll: {
    flex: 1,
  },
  pageWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  ownerPageScrollContent: {
    paddingBottom: 40,
  },

  /* OWNER COVER & AVATAR */
  ownerCoverContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EBE5DC',
    zIndex: 1,
    elevation: 1,
  },
  coverTouchArea: {
    width: '100%',
    height: '100%',
  },
  ownerCoverImg: {
    width: '100%',
    height: '100%',
  },
  changeCoverBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 99,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeCoverBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* AVATAR ROW: 50% Overlap onto cover */
  avatarSectionRow: {
    position: 'relative',
    marginTop: -55,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: 10,
  },
  noteBubbleAnchor: {
    marginBottom: 6,
    alignItems: 'center',
  },
  noteBubbleBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  noteBubbleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A332C',
    textAlign: 'center',
  },
  noteBubbleTail: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  ownerAvatarWrap: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: '#FDFBF7',
    backgroundColor: '#FDFBF7',
    position: 'relative',
  },
  ownerAvatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 40,
    elevation: 8,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4A3E3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sleekEditPenBtn: {
    position: 'absolute',
    right: 24,
    top: 54,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  /* RELATIONSHIP ACTION BAR (OTHER USER) */
  relationshipBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
  },
  relPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  relPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  relFriendAcceptedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EAF7F1',
    borderWidth: 1,
    borderColor: '#3E8E6C',
  },
  relFriendAcceptedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  relFriendPendingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: '#E8DED1',
  },
  relFriendPendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E6E60',
  },
  relSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  relSecondaryBtnActive: {
    backgroundColor: '#EAF7F1',
    borderColor: '#C2E8D7',
  },
  relSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  relMessageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  relMessageBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* OWNER INFO */
  ownerInfoCenterBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  ownerFullNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1815',
    marginBottom: 4,
  },
  ownerJobTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6F61',
    marginBottom: 4,
  },
  ownerBioText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B5E59',
    textAlign: 'center',
    marginBottom: 8,
  },
  ownerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ownerLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E6E60',
  },
  ownerBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  ownerBadgeChip: {
    backgroundColor: '#F5EFE6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ownerBadgeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A4E47',
  },

  /* STATS CARD */
  ownerStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0ECE6',
    alignItems: 'center',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1815',
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8A7D75',
    marginTop: 2,
  },
  statDividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: '#EBE5DC',
  },

  /* MOMENTS */
  momentsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  momentsSubTabsBox: {
    flexDirection: 'row',
    gap: 12,
  },
  momentSubTabBtn: {
    paddingBottom: 4,
  },
  momentSubTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1C1815',
  },
  momentSubTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A7D75',
  },
  momentSubTabTextActive: {
    color: '#1C1815',
    fontWeight: '700',
  },
  addPostQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF6F61',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addPostQuickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  momentsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  gridThumbItem: {
    width: MOMENT_GRID_SIZE,
    height: MOMENT_GRID_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBE5DC',
  },
  gridThumbImg: {
    width: '100%',
    height: '100%',
  },
  gridBadgeTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 3,
    borderRadius: 4,
  },

  /* PET FULLSCREEN CONTAINER */
  petFullScreenContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 52 - 60,
    position: 'relative',
    backgroundColor: '#1C1815',
    overflow: 'hidden',
  },
  petScrollOverFullscreen: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  petScrollOverFullscreenContent: {
    paddingBottom: 95,
  },
  petPhotoSpacerArea: {
    height: Math.round(SCREEN_HEIGHT * 0.44),
    width: '100%',
  },
  petTopFloatingBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  petSpeciesPillBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  petSpeciesPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  petTopRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petFloatingLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  petFloatingLikeBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  petFloatingLikeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  petFloatingEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Frosted Nav Buttons < and > */
  petGalleryPrevBtn: {
    position: 'absolute',
    left: 14,
    top: '48%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  petGalleryNextBtn: {
    position: 'absolute',
    right: 14,
    top: '48%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  petGalleryNavArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },

  /* Heart Burst */
  heartBurstWrap: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
    zIndex: 30,
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  /* Frosted Glass Card */
  petScrollableFrostedCard: {
    marginHorizontal: 14,
    backgroundColor: 'rgba(22, 18, 16, 0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  petExpandedFlowSection: {
    marginTop: 8,
  },
  petCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petCardMainName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  petBreedFullTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  petBreedFullText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  petSpecsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  specFrostedChip: {
    flex: 1,
    minWidth: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  specChipLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '600',
  },
  specChipValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  expandToggleBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A3E4D7',
  },
  petDetailCardRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  petDetailCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A3E4D7',
    marginBottom: 2,
  },
  petDetailCardValue: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  habitsBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  habitBadgeChip: {
    backgroundColor: 'rgba(163, 228, 215, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  habitBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cautionBadgeChip: {
    backgroundColor: 'rgba(255, 111, 97, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cautionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFE2DE',
  },

  /* Weight Chart */
  petHealthSectionBox: {
    marginTop: 8,
    marginBottom: 10,
  },
  petHealthSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  weightBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 85,
    paddingBottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 8,
  },
  weightBarColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  weightBarKgText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  weightBarPill: {
    width: 20,
    borderRadius: 6,
    backgroundColor: '#A3E4D7',
  },
  weightBarMonthText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },

  /* Vaccines */
  vaccineCardItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 6,
  },
  vaccineItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaccineItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  doseBadge: {
    backgroundColor: 'rgba(163, 228, 215, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  doseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A3E4D7',
  },
  vaccineItemSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },

  /* Pet CTA */
  petCtaBookWalkBtn: {
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  petCtaBookWalkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* MODALS & POPUPS */
  cleanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  cleanModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  fullscreenModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    maxHeight: '88%',
    flexShrink: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  cleanModalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cleanModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1815',
  },
  modalCloseBtn: {
    padding: 6,
  },
  cleanModalSubtitle: {
    fontSize: 13,
    color: '#7E6E60',
    marginBottom: 14,
  },
  cleanTextInputArea: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#1C1815',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cleanModalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  cleanDeleteTextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cleanDeleteTextBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E15B4C',
  },
  cleanSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  cleanSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Pick Cover presets */
  pickFromDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  pickFromDeviceBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1815',
  },
  presetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A4E47',
    marginBottom: 10,
  },
  coverPresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coverPresetItem: {
    flex: 1,
    alignItems: 'center',
  },
  coverPresetThumb: {
    width: '100%',
    height: 60,
    borderRadius: 10,
    marginBottom: 4,
  },
  coverPresetName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7E6E60',
  },

  /* Form Fields */
  modalScrollBody: {
    flex: 1,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3E3D',
    marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#1C1815',
  },
  fieldsTwoColRow: {
    flexDirection: 'row',
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
    marginBottom: 4,
  },
  pickerSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pickerSelectorBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1815',
  },
  speciesChoiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speciesChoiceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    alignItems: 'center',
  },
  speciesChoiceBtnActive: {
    backgroundColor: '#FF6F61',
    borderColor: '#FF6F61',
  },
  speciesChoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A4E47',
  },
  speciesChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChoiceBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    alignItems: 'center',
  },
  genderChoiceBtnActive: {
    backgroundColor: '#FF6F61',
    borderColor: '#FF6F61',
  },
  genderChoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A4E47',
  },
  genderChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* New Pet Photo Picker */
  newPetPhotoPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF6F61',
    borderStyle: 'dashed',
    backgroundColor: '#FFF0EE',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPetPhotoImg: {
    width: '100%',
    height: '100%',
  },
  newPetPhotoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPetPhotoEmptyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6F61',
    marginTop: 2,
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
    marginVertical: 10,
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
  deletePetFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFF0EE',
    marginTop: 10,
    marginBottom: 10,
  },
  deletePetFullBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E15B4C',
  },
  privacySectionBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  privacySectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1815',
    marginBottom: 4,
  },
  privacySectionDesc: {
    fontSize: 11,
    color: '#7E6E60',
    marginBottom: 10,
  },
  privacyToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  privacyToggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A332C',
  },
  privacyBadgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  privacyBadgePublic: {
    backgroundColor: '#E8F8F5',
  },
  privacyBadgeHidden: {
    backgroundColor: '#F0ECE6',
  },
  privacyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  privacyBadgeTextPublic: {
    color: '#27AE60',
  },
  privacyBadgeTextHidden: {
    color: '#8A7D75',
  },
  modalFooterActions: {
    paddingTop: 10,
  },

  /* POST PREVIEW MODAL */
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#20242C',
    borderRadius: 24,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  postPreviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  previewAuthorHandle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewMetaText: {
    fontSize: 11,
    color: '#8A7D75',
    marginTop: 1,
  },
  previewCloseBtn: {
    padding: 6,
  },
  previewPostImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#16191F',
  },
  previewCaptionBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  previewLikeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewLikeCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewCaptionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#D1D5DB',
  },
  previewActionsContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  previewMainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D3440',
    paddingVertical: 12,
    borderRadius: 14,
  },
  postPreviewActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A3E4D7',
  },
  previewSecondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  previewSecondaryActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6F61',
  },
  previewDangerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  previewDangerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E15B4C',
  },

  /* POST DETAIL MODAL */
  postDetailAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postDetailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postDetailAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1815',
  },
  postDetailAuthorHandle: {
    fontSize: 12,
    color: '#8A7D75',
  },
  postDetailImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
  },
  postDetailContentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3A332C',
    marginBottom: 12,
  },
  postDetailReactionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  reactionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1815',
  },
  commentsListBlock: {
    borderTopWidth: 1,
    borderTopColor: '#F0ECE6',
    paddingTop: 12,
  },
  commentsHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1815',
    marginBottom: 10,
  },
  commentItemWrap: {
    marginBottom: 12,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 14,
    marginLeft: 8,
    marginRight: 6,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1815',
    marginBottom: 2,
  },
  commentContentText: {
    fontSize: 13,
    color: '#3A332C',
    lineHeight: 17,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  commentTimeText: {
    fontSize: 10,
    color: '#8A7D75',
  },
  commentReplyLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6F61',
  },
  commentLikeBtn: {
    alignItems: 'center',
    paddingTop: 4,
  },
  commentLikeCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A7D75',
    marginTop: 2,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 40,
    marginTop: 6,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  replyBubble: {
    flex: 1,
    backgroundColor: '#F5EFE6',
    padding: 8,
    borderRadius: 12,
    marginLeft: 6,
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE6',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1815',
  },
  commentSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF6F61',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Hamburger Menu List */
  menuOptionsList: {
    gap: 6,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  menuItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1815',
  },
  menuItemDesc: {
    fontSize: 11,
    color: '#8A7D75',
    marginTop: 2,
  },
});
