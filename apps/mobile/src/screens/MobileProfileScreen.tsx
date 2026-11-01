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
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, MAX_FREE_PETS, THEME_PALETTES, ThemePresetId } from '../context/MobilePawtyContext';
import { MobilePet, MobilePost, PetWeightEntry, PetVaccineRecord } from '../data/mobileSeedData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MOMENT_GRID_SIZE = Math.floor((SCREEN_WIDTH - 32 - 16) / 3);

// Fallback high-res working images for pets
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

// Presets for cover background
const COVER_PRESETS = [
  { id: 'beach', name: 'Biển hoàng hôn', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  { id: 'park', name: 'Công viên xanh', url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80' },
  { id: 'home', name: 'Nhà ấm cúng', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80' },
  { id: 'autumn', name: 'Mùa thu vàng', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80' },
];

const ZODIAC_LIST = [
  'Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải',
  'Sư Tử', 'Xử Nữ', 'Thiên Bình', 'Bọ Cạp',
  'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư',
];

const MBTI_LIST = [
  'ENFP', 'INFJ', 'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFP', 'ENFJ', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const MONTH_LIST = [
  'T01', 'T02', 'T03', 'T04', 'T05', 'T06',
  'T07', 'T08', 'T09', 'T10', 'T11', 'T12',
];

const OWNER_AGE_LIST = Array.from({ length: 63 }, (_, i) => `${18 + i}`);
const PET_AGE_LIST = [
  '1 tháng', '2 tháng', '3 tháng', '4 tháng', '5 tháng', '6 tháng',
  '7 tháng', '8 tháng', '9 tháng', '10 tháng', '11 tháng',
  '1 tuổi', '1.5 tuổi', '2 tuổi', '2.5 tuổi', '3 tuổi', '4 tuổi',
  '5 tuổi', '6 tuổi', '7 tuổi', '8 tuổi', '9 tuổi', '10 tuổi', '12 tuổi', '15 tuổi'
];

/* -------------------------------------------------------------------------- */
/* 1. UNIVERSAL SELECT / PICKER MODAL                                         */
/* -------------------------------------------------------------------------- */
interface UniversalPickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

const UniversalPickerModal: React.FC<UniversalPickerModalProps> = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pickerStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={pickerStyles.sheetCard}>
          <View style={pickerStyles.sheetHeader}>
            <Text style={pickerStyles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={pickerStyles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={18} color="#6B5E59" />
            </TouchableOpacity>
          </View>
          <ScrollView style={pickerStyles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const isSelected = opt === selected;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[pickerStyles.optionRow, isSelected && pickerStyles.optionRowSelected]}
                  onPress={() => {
                    onSelect(opt);
                    onClose();
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[pickerStyles.optionText, isSelected && pickerStyles.optionTextSelected]}>
                    {opt}
                  </Text>
                  {isSelected && <Feather name="check" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. DATE PICKER MODAL (Chọn Ngày/Tháng/Năm không cần gõ phím)               */
/* -------------------------------------------------------------------------- */
interface DatePickerModalProps {
  visible: boolean;
  title: string;
  initialDate: string; // "DD/MM/YYYY"
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
      <View style={pickerStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={pickerStyles.datePickerCard}>
          <View style={pickerStyles.sheetHeader}>
            <Text style={pickerStyles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={pickerStyles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={18} color="#6B5E59" />
            </TouchableOpacity>
          </View>

          <View style={pickerStyles.dateColsContainer}>
            {/* Cột Ngày */}
            <View style={pickerStyles.dateCol}>
              <Text style={pickerStyles.dateColHeader}>Ngày</Text>
              <ScrollView style={pickerStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[pickerStyles.dateItemPill, selectedDay === d && pickerStyles.dateItemPillActive]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[pickerStyles.dateItemText, selectedDay === d && pickerStyles.dateItemTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cột Tháng */}
            <View style={pickerStyles.dateCol}>
              <Text style={pickerStyles.dateColHeader}>Tháng</Text>
              <ScrollView style={pickerStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {months.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[pickerStyles.dateItemPill, selectedMonth === m && pickerStyles.dateItemPillActive]}
                    onPress={() => setSelectedMonth(m)}
                  >
                    <Text style={[pickerStyles.dateItemText, selectedMonth === m && pickerStyles.dateItemTextActive]}>
                      Tháng {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cột Năm */}
            <View style={pickerStyles.dateCol}>
              <Text style={pickerStyles.dateColHeader}>Năm</Text>
              <ScrollView style={pickerStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[pickerStyles.dateItemPill, selectedYear === y && pickerStyles.dateItemPillActive]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[pickerStyles.dateItemText, selectedYear === y && pickerStyles.dateItemTextActive]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={pickerStyles.datePreviewRow}>
            <Text style={pickerStyles.datePreviewText}>
              Đã chọn: {selectedDay}/{selectedMonth}/{selectedYear}
            </Text>
          </View>

          <TouchableOpacity style={pickerStyles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={pickerStyles.confirmBtnText}>Xác nhận ngày sinh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. MAIN COMPONENT: MobileProfileScreen                                     */
/* -------------------------------------------------------------------------- */
export const MobileProfileScreen: React.FC = () => {
  const {
    themeId,
    theme,
    setThemeId,
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
  } = useMobilePawty();

  const horizontalScrollRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Hamburger settings modal state
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  // Cover image modal state
  const [isChangingCoverModal, setIsChangingCoverModal] = useState(false);

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

  // Universal Picker State
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selected: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    selected: '',
    onSelect: () => {},
  });

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

  // Popup 3: Thêm bé cưng mới
  const [isAddingPetModal, setIsAddingPetModal] = useState(false);
  const [newPetSpecies, setNewPetSpecies] = useState<'Chó' | 'Mèo' | 'Khác'>('Chó');
  const [newPetCustomSpecies, setNewPetCustomSpecies] = useState('');
  const [newPetName, setNewPetName] = useState('');
  const [newPetGender, setNewPetGender] = useState<'Đực' | 'Cái'>('Đực');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('5.0');
  const [newPetAge, setNewPetAge] = useState('1 tuổi');
  const [newPetBirthDate, setNewPetBirthDate] = useState('01/06/2024');
  const [newPetBio, setNewPetBio] = useState('');
  const [newPetFavoriteFood, setNewPetFavoriteFood] = useState('');
  const [newPetDewormingHistory, setNewPetDewormingHistory] = useState('');
  const [newPetMedicalHistory, setNewPetMedicalHistory] = useState('');
  const [newPetGoodHabits, setNewPetGoodHabits] = useState('Thân thiện, nghe lời, không sủa bậy');
  const [newPetCautionHabits, setNewPetCautionHabits] = useState('Hơi nhát người lạ');
  const [newPetWeightHistory, setNewPetWeightHistory] = useState<PetWeightEntry[]>([
    { month: 'T08', weightKg: 4.2 },
    { month: 'T09', weightKg: 4.6 },
    { month: 'T10', weightKg: 5.0 },
  ]);
  const [newPetVaccineRecords, setNewPetVaccineRecords] = useState<PetVaccineRecord[]>([
    {
      id: 'vac-1',
      vaccineName: 'Phòng dại & 7 bệnh cơ bản',
      date: '10/08/2025',
      doseNumber: 2,
      clinic: 'Bệnh viện thú y Pawty Care',
      isSafeVerified: true,
    },
  ]);
  const [tempWeightMonth, setTempWeightMonth] = useState('T11');
  const [tempWeightKg, setTempWeightKg] = useState('5.2');
  const [tempVacName, setTempVacName] = useState('');
  const [tempVacDate, setTempVacDate] = useState('15/10/2025');
  const [tempVacDose, setTempVacDose] = useState('1');
  const [tempVacClinic, setTempVacClinic] = useState('BV Thú y Pawty');

  // Popup 4: Chỉnh sửa Thú Cưng
  const [editingPet, setEditingPet] = useState<MobilePet | null>(null);
  const [editPetSpeciesDraft, setEditPetSpeciesDraft] = useState<'Chó' | 'Mèo' | 'Khác'>('Chó');
  const [editPetCustomSpeciesDraft, setEditPetCustomSpeciesDraft] = useState('');
  const [editPetNameDraft, setEditPetNameDraft] = useState('');
  const [editPetGenderDraft, setEditPetGenderDraft] = useState<'Đực' | 'Cái'>('Đực');
  const [editPetBreedDraft, setEditPetBreedDraft] = useState('');
  const [editPetWeightDraft, setEditPetWeightDraft] = useState('5.0');
  const [editPetAgeDraft, setEditPetAgeDraft] = useState('1 tuổi');
  const [editPetBirthDateDraft, setEditPetBirthDateDraft] = useState('');
  const [editPetBioDraft, setEditPetBioDraft] = useState('');
  const [editPetFavoriteFoodDraft, setEditPetFavoriteFoodDraft] = useState('');
  const [editPetDewormingHistoryDraft, setEditPetDewormingHistoryDraft] = useState('');
  const [editPetMedicalHistoryDraft, setEditPetMedicalHistoryDraft] = useState('');
  const [editPetGoodHabitsDraft, setEditPetGoodHabitsDraft] = useState('');
  const [editPetCautionHabitsDraft, setEditPetCautionHabitsDraft] = useState('');
  const [editPetVaccineRecordsDraft, setEditPetVaccineRecordsDraft] = useState<PetVaccineRecord[]>([]);
  const [editPetWeightHistoryDraft, setEditPetWeightHistoryDraft] = useState<PetWeightEntry[]>([]);
  const [editPetGalleryDraft, setEditPetGalleryDraft] = useState<string[]>([]);

  // Popup 5: Post Preview Modal & Post Detail Modal (Hình 1 & 2)
  const [selectedPreviewPost, setSelectedPreviewPost] = useState<MobilePost | null>(null);
  const [activePostDetail, setActivePostDetail] = useState<MobilePost | null>(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);

  // Moments list calculation
  const myPosts = posts.filter((p) => p.authorHandle === '@mainguyen');
  const displayPosts = myPosts.length > 0 ? myPosts : posts.slice(0, 6);

  const totalPages = 1 + pets.length;

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        const targetPet = pets.find((p) => p.id === petId);
        if (targetPet) {
          const currentGallery = targetPet.galleryUrls && targetPet.galleryUrls.length > 0
            ? targetPet.galleryUrls
            : [targetPet.coverUrl || targetPet.avatarUrl];
          const updatedGallery = [newUri, ...currentGallery];
          updatePetProfile(petId, {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setOwnerAvatarUrl(res.assets[0].uri);
        showToast('Đã cập nhật ảnh đại diện mới');
      }
    } catch {
      showToast('Chưa chọn ảnh đại diện');
    }
  };

  /* ---------------- Pick Owner Cover ---------------- */
  const handlePickCoverFromDevice = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setOwnerCoverUrl(res.assets[0].uri);
        setIsChangingCoverModal(false);
        showToast('Đã đổi ảnh bìa từ thư viện');
      }
    } catch {
      showToast('Chưa chọn ảnh bìa');
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

  const handleSaveOwnerProfile = () => {
    if (!ownerDraftName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }
    updateOwnerProfile({
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
    setEditPetBioDraft(pet.bio || '');
    setEditPetFavoriteFoodDraft(pet.favoriteFood || '');
    setEditPetDewormingHistoryDraft(pet.dewormingHistory || '');
    setEditPetMedicalHistoryDraft(pet.medicalHistory || '');
    setEditPetGoodHabitsDraft((pet.goodHabits || []).join(', '));
    setEditPetCautionHabitsDraft((pet.cautionHabits || []).join(', '));
    setEditPetVaccineRecordsDraft(pet.vaccineRecords || []);
    setEditPetWeightHistoryDraft(pet.weightHistory || []);
    setEditPetGalleryDraft(
      pet.galleryUrls && pet.galleryUrls.length > 0
        ? pet.galleryUrls
        : [pet.coverUrl || pet.avatarUrl]
    );
  };

  const handleSavePetEdits = () => {
    if (!editingPet) return;
    if (!editPetNameDraft.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho bé thú cưng.');
      return;
    }
    const finalSpecies = editPetSpeciesDraft === 'Khác' && editPetCustomSpeciesDraft.trim()
      ? editPetCustomSpeciesDraft.trim()
      : editPetSpeciesDraft;

    const parsedGood = editPetGoodHabitsDraft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedCaution = editPetCautionHabitsDraft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updatePetProfile(editingPet.id, {
      name: editPetNameDraft.trim(),
      species: editPetSpeciesDraft === 'Khác' ? 'Chó' : editPetSpeciesDraft,
      customSpecies: editPetSpeciesDraft === 'Khác' ? finalSpecies : undefined,
      gender: editPetGenderDraft,
      breed: editPetBreedDraft.trim() || 'Thuần chủng',
      weightKg: parseFloat(editPetWeightDraft) || editingPet.weightKg,
      ageLabel: editPetAgeDraft.trim() || '1 tuổi',
      birthDate: editPetBirthDateDraft.trim(),
      bio: editPetBioDraft.trim(),
      favoriteFood: editPetFavoriteFoodDraft.trim(),
      dewormingHistory: editPetDewormingHistoryDraft.trim(),
      medicalHistory: editPetMedicalHistoryDraft.trim(),
      goodHabits: parsedGood.length > 0 ? parsedGood : editingPet.goodHabits,
      cautionHabits: parsedCaution.length > 0 ? parsedCaution : editingPet.cautionHabits,
      vaccineRecords: editPetVaccineRecordsDraft,
      weightHistory: editPetWeightHistoryDraft,
      galleryUrls: editPetGalleryDraft,
      avatarUrl: editPetGalleryDraft[0] || editingPet.avatarUrl,
    });

    setEditingPet(null);
    showToast('Đã cập nhật hồ sơ bé cưng');
  };

  const handleConfirmDeletePet = (pet: MobilePet) => {
    Alert.alert(
      'Xóa hồ sơ bé',
      `Bạn có chắc chắn muốn xóa hồ sơ của bé ${pet.name}? Dữ liệu sẽ không thể khôi phục.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: () => {
            deletePetProfile(pet.id);
            setEditingPet(null);
            scrollToPage(0);
          },
        },
      ]
    );
  };

  /* ---------------- Add New Pet ---------------- */
  const handleAddNewPet = () => {
    if (!newPetName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên bé thú cưng.');
      return;
    }
    const finalSpecies = newPetSpecies === 'Khác' && newPetCustomSpecies.trim()
      ? newPetCustomSpecies.trim()
      : newPetSpecies;

    const defaultImg =
      newPetSpecies === 'Mèo'
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';

    const parsedGood = newPetGoodHabits
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedCaution = newPetCautionHabits
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addNewPetProfile({
      name: newPetName.trim(),
      species: newPetSpecies === 'Khác' ? 'Chó' : newPetSpecies,
      breed: newPetBreed.trim() || 'Bản địa',
      weightKg: parseFloat(newPetWeight) || 5.0,
      ageLabel: newPetAge.trim() || '1 tuổi',
    });

    setTimeout(() => {
      const createdPet = pets[pets.length - 1];
      if (createdPet) {
        updatePetProfile(createdPet.id, {
          customSpecies: newPetSpecies === 'Khác' ? finalSpecies : undefined,
          gender: newPetGender,
          birthDate: newPetBirthDate,
          bio: newPetBio.trim(),
          favoriteFood: newPetFavoriteFood.trim(),
          dewormingHistory: newPetDewormingHistory.trim(),
          medicalHistory: newPetMedicalHistory.trim(),
          goodHabits: parsedGood.length > 0 ? parsedGood : ['Thân thiện', 'Nghe lời'],
          cautionHabits: parsedCaution.length > 0 ? parsedCaution : ['Hơi nhát người lạ'],
          vaccineRecords: newPetVaccineRecords,
          weightHistory: newPetWeightHistory,
          galleryUrls: [defaultImg],
          avatarUrl: defaultImg,
          coverUrl: defaultImg,
        });
      }
    }, 100);

    setIsAddingPetModal(false);
    setNewPetName('');
    setNewPetBreed('');
    setNewPetBio('');
    setNewPetFavoriteFood('');
    setNewPetDewormingHistory('');
    setNewPetMedicalHistory('');
    showToast('Đã thêm bé cưng mới vào gia đình!');
  };

  return (
    <View style={styles.rootContainer}>
      {/* ------------------------------------------------------------- */}
      {/* TOP INTEGRATED HEADER: [Con sen] [Lu] [Miu] [+] + Hamburger    */}
      {/* ------------------------------------------------------------- */}
      <View style={styles.topProfileHeader}>
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
          {pets.map((pet, idx) => {
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

          {/* [+] Add Pet Pill */}
          {pets.length < MAX_FREE_PETS && (
            <TouchableOpacity
              style={styles.headerAddPetPill}
              onPress={() => setIsAddingPetModal(true)}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={14} color="#FF6F61" />
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Hamburger Menu on the right */}
        <TouchableOpacity
          style={styles.headerHamburgerBtn}
          onPress={() => setIsProfileMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color="#1C1815" />
        </TouchableOpacity>
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
                  mediaUrls: [ownerCoverUrl],
                  mediaType: 'image',
                  initialIndex: 0,
                  authorName: ownerName,
                  caption: 'Ảnh bìa trang cá nhân',
                });
              }}
            >
              <Image source={{ uri: ownerCoverUrl }} style={styles.ownerCoverImg} resizeMode="cover" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeCoverBtn}
              onPress={() => setIsChangingCoverModal(true)}
              activeOpacity={0.85}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="camera" size={13} color="#FFFFFF" />
              <Text style={styles.changeCoverBtnText}>Đổi ảnh bìa</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Floating Note Bubble & Avatar Overlap (50% trên ảnh bìa) */}
          <View style={styles.avatarSectionRow}>
            {/* Note Bubble: Chỉ hiển thị khi chủ nuôi có ghi chú thực tế */}
            {ownerNoteBubble && ownerNoteBubble.trim().length > 0 ? (
              <View style={styles.noteBubbleAnchor}>
                <TouchableOpacity
                  style={styles.noteBubbleBox}
                  onPress={() => {
                    setTempNoteText(ownerNoteBubble || '');
                    setIsEditingNote(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.noteBubbleText} numberOfLines={2}>
                    {ownerNoteBubble}
                  </Text>
                  <View style={styles.noteBubbleTail} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Avatar Wrap: Overlaps 50% on bottom of cover */}
            <View style={styles.ownerAvatarWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  openLightboxMedia({
                    postId: 'owner-avatar',
                    mediaUrls: [ownerAvatarUrl],
                    mediaType: 'image',
                    initialIndex: 0,
                    authorName: ownerName,
                    caption: 'Ảnh đại diện chính thức',
                  });
                }}
              >
                <Image source={{ uri: ownerAvatarUrl }} style={styles.ownerAvatarImg} />
              </TouchableOpacity>

              {/* Note '+' badge: Di chuyển lên trên đầu phía bên phải của ảnh avt */}
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

              {/* Camera change avatar badge */}
              <TouchableOpacity
                style={styles.avatarCameraBadge}
                onPress={handlePickOwnerAvatar}
                activeOpacity={0.85}
              >
                <Feather name="camera" size={11} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Right Side: Sleek Pen Edit Icon */}
            <TouchableOpacity
              style={styles.sleekEditPenBtn}
              onPress={openEditOwnerModal}
              activeOpacity={0.85}
            >
              <Feather name="edit-2" size={16} color="#1C1815" />
            </TouchableOpacity>
          </View>

          {/* 3. Owner Information: Tên, Nghề nghiệp, Câu giới thiệu, Vị trí */}
          <View style={styles.ownerInfoCenterBox}>
            <Text style={styles.ownerFullNameText}>{ownerName}</Text>

            {/* Profession: Dedicated line */}
            {ownerOccupation ? (
              <Text style={styles.ownerJobTitleText}>{ownerOccupation}</Text>
            ) : null}

            {/* Bio: Dedicated line */}
            {ownerBio ? (
              <Text style={styles.ownerBioText}>{ownerBio}</Text>
            ) : null}

            {/* Location */}
            {ownerPrivacySettings?.area !== false && (
              <View style={styles.ownerLocationRow}>
                <Feather name="map-pin" size={13} color="#FF6F61" />
                <Text style={styles.ownerLocationText}>
                  {ownerArea || 'Vinhomes Grand Park, TP. Thủ Đức'}
                </Text>
              </View>
            )}

            {/* Clean Text Chips (Loại bỏ 100% icons có sẵn) */}
            <View style={styles.ownerBadgesRow}>
              {ownerPrivacySettings?.zodiac !== false && ownerZodiac ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>{ownerZodiac}</Text>
                </View>
              ) : null}
              {ownerPrivacySettings?.mbti !== false && ownerMbti ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>{ownerMbti}</Text>
                </View>
              ) : null}
              {ownerPrivacySettings?.age !== false && ownerAge ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>{ownerAge} tuổi</Text>
                </View>
              ) : null}
              {ownerPrivacySettings?.education !== false && ownerEducation ? (
                <View style={styles.ownerBadgeChip}>
                  <Text style={styles.ownerBadgeChipText}>{ownerEducation}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 4. Stats Card */}
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

          {/* 5. Section Khoảnh Khắc: Nút Đăng Bài Hoạt Động (activeModal = 'new_moment') */}
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
            </View>

            <TouchableOpacity
              style={styles.addPostQuickBtn}
              onPress={() => setActiveModal('new_moment')}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.addPostQuickBtnText}>Đăng bài</Text>
            </TouchableOpacity>
          </View>

          {/* 6. Media Grid */}
          <View style={styles.momentsGridContainer}>
            {displayPosts.map((post) => {
              const urls = post.mediaUrls || [];
              const thumb = urls[0] || ownerAvatarUrl;
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
        {pets.map((pet) => {
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
              {/* 1. Fullscreen Background Image: Tràn trọn 100% màn hình */}
              <Image
                source={{ uri: currentPetImg }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />

              {/* 2. Double-tap touchable overlay on background photo */}
              <TouchableOpacity
                activeOpacity={1}
                style={StyleSheet.absoluteFillObject}
                onPress={() => handlePetContainerTap(pet.id)}
              />

              {/* 3. Top Floating Action Bar */}
              <View style={styles.petTopFloatingBar}>
                <View style={styles.petSpeciesPillBadge}>
                  <Text style={styles.petSpeciesPillText}>
                    {pet.species === 'Khác' && pet.customSpecies
                      ? pet.customSpecies
                      : `Loài ${pet.species}`}
                  </Text>
                </View>

                <View style={styles.petTopRightActionsRow}>
                  {/* Thả tim */}
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

                  {/* Nút Camera: Thêm / Đổi ảnh mới cho bé từ thiết bị */}
                  <TouchableOpacity
                    style={styles.petFloatingEditBtn}
                    onPress={() => handleAddPetPhotoFromDevice(pet.id)}
                    activeOpacity={0.85}
                  >
                    <Feather name="camera" size={15} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Nút Bút: Chỉnh sửa toàn diện thông tin bé */}
                  <TouchableOpacity
                    style={styles.petFloatingEditBtn}
                    onPress={() => openEditPetModal(pet)}
                    activeOpacity={0.85}
                  >
                    <Feather name="edit-2" size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Frosted Navigation Buttons on Left and Right edges */}
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

              {/* 5. Heart Burst Animated Overlay on Double-Tap */}
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

              {/* 6. Vertical ScrollView overlying the fullscreen photo: Cuộn xuôi xuống dưới */}
              <ScrollView
                style={styles.petScrollOverFullscreen}
                contentContainerStyle={styles.petScrollOverFullscreenContent}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {/* Vùng Spacer trong suốt: Để lộ ảnh bé cưng full màn hình */}
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.petPhotoSpacerArea}
                  onPress={() => handlePetContainerTap(pet.id)}
                />

                {/* Thẻ Kính Mờ Nửa Dưới: Mờ nhạt, nhìn thấu ảnh thú cưng & cuộn xuôi xuống */}
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

                  {/* Vùng chi tiết mở rộng: Cuộn xuôi xuống phía dưới không đẩy thẻ lên trên */}
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
                          {pet.favoriteFood || 'Ức gà luộc, pate cá hồi, bánh thưởng dinh dưỡng'}
                        </Text>
                      </View>

                      {/* Lịch sử tẩy giun */}
                      <View style={styles.petDetailCardRow}>
                        <Text style={styles.petDetailCardLabel}>Lịch sử tẩy giun:</Text>
                        <Text style={styles.petDetailCardValue}>
                          {pet.dewormingHistory || '15/09/2025 (Định kỳ 3 tháng/lần - Thuốc Drontal)'}
                        </Text>
                      </View>

                      {/* Tiền sử bệnh lý */}
                      <View style={styles.petDetailCardRow}>
                        <Text style={styles.petDetailCardLabel}>Tiền sử bệnh lý:</Text>
                        <Text style={styles.petDetailCardValue}>
                          {pet.medicalHistory || 'Khỏe mạnh, không có bệnh nền'}
                        </Text>
                      </View>

                      {/* Theo dõi cân nặng theo tháng */}
                      <View style={styles.petHealthSectionBox}>
                        <Text style={styles.petHealthSectionTitle}>
                          Theo dõi cân nặng theo tháng:
                        </Text>
                        <View style={styles.weightBarsContainer}>
                          {(pet.weightHistory && pet.weightHistory.length > 0
                            ? pet.weightHistory
                            : [
                                { month: 'T08', weightKg: 25.0 },
                                { month: 'T09', weightKg: 26.2 },
                                { month: 'T10', weightKg: 27.1 },
                                { month: 'T11', weightKg: 27.9 },
                                { month: 'T12', weightKg: pet.weightKg },
                              ]
                          ).map((item, wIdx, arr) => {
                            const maxKg = Math.max(...arr.map((x) => x.weightKg), 30);
                            const barH = Math.max(20, Math.round((item.weightKg / maxKg) * 55));
                            return (
                              <View key={wIdx} style={styles.weightBarColumn}>
                                <Text style={styles.weightBarKgText}>{item.weightKg}kg</Text>
                                <View style={[styles.weightBarPill, { height: barH }]} />
                                <Text style={styles.weightBarMonthText}>{item.month}</Text>
                              </View>
                            );
                          })}
                        </View>
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

                  {/* CTA Button: Hẹn dạo cùng bé */}
                  <TouchableOpacity
                    style={styles.petCtaBookWalkBtn}
                    onPress={() => {
                      Alert.alert(
                        'Hẹn dạo cùng Boss',
                        `Bạn muốn gửi lời mời hẹn dắt dạo cùng bé ${pet.name} và Sen Mai Nguyễn?`,
                        [
                          { text: 'Để sau', style: 'cancel' },
                          {
                            text: 'Gửi lời mời',
                            onPress: () => showToast(`Đã gửi lời mời dắt dạo cùng bé ${pet.name}!`),
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.petCtaBookWalkText}>Hẹn dạo cùng bé</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* ============================================================= */}
      {/* POPUP: MENU TÙY CHỌN & CÀI ĐẶT (HAMBURGER MENU)              */}
      {/* ============================================================= */}
      <Modal
        visible={isProfileMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsProfileMenuVisible(false)}
      >
        <View style={styles.cleanModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
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

            {/* Menu Options List: Rút gọn tối đa, chỉ giữ thứ cần thiết */}
            <View style={styles.menuOptionsList}>
              {/* Option 1: Cài đặt tài khoản & Quyền riêng tư */}
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

              {/* Option 2: Thiết lập hồ sơ kết nối */}
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
                  <Text style={styles.menuItemDesc}>Bán kính radar & tiêu chí dắt dạo</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#BDB4AC" />
              </TouchableOpacity>

              {/* Option 3: Gói hội viên Sen VIP */}
              <TouchableOpacity
                style={styles.menuItemRow}
                onPress={() => {
                  setIsProfileMenuVisible(false);
                  setActiveModal('vip_upgrade');
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.menuItemIconWrap, { backgroundColor: '#FEF9E7' }]}>
                  <Feather name="award" size={16} color="#F39C12" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Gói hội viên Sen VIP</Text>
                  <Text style={styles.menuItemDesc}>Quẹt thẻ không giới hạn & huy hiệu VIP</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#BDB4AC" />
              </TouchableOpacity>

              {/* Option 4: Đổi giao diện ứng dụng */}
              <TouchableOpacity
                style={styles.menuItemRow}
                onPress={() => {
                  const themeKeys: ThemePresetId[] = [
                    'coral_pink',
                    'mint_safe',
                    'warm_cream',
                    'cyber_neon',
                  ];
                  const curIdx = themeKeys.indexOf(themeId);
                  const nextTheme = themeKeys[(curIdx + 1) % themeKeys.length];
                  setThemeId(nextTheme);
                  showToast(`Giao diện: ${THEME_PALETTES[nextTheme].name}`);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.menuItemIconWrap, { backgroundColor: '#EBF5FB' }]}>
                  <Feather name="sun" size={16} color="#2980B9" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Giao diện ứng dụng</Text>
                  <Text style={styles.menuItemDesc}>Đang dùng: {theme.name}</Text>
                </View>
                <Feather name="refresh-cw" size={14} color="#BDB4AC" />
              </TouchableOpacity>

              {/* Option 5: Đăng xuất tài khoản */}
              <TouchableOpacity
                style={[styles.menuItemRow, { borderBottomWidth: 0, marginTop: 4 }]}
                onPress={() => {
                  setIsProfileMenuVisible(false);
                  Alert.alert(
                    'Đăng xuất',
                    'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      {
                        text: 'Đăng xuất',
                        style: 'destructive',
                        onPress: () => logoutUser(),
                      },
                    ]
                  );
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
            style={StyleSheet.absoluteFillObject}
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
              Ghi chú ngắn sẽ hiển thị trên avatar của bạn.
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
            style={StyleSheet.absoluteFillObject}
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
      {/* POPUP 3: CHỈNH SỬA HỒ SƠ CON SEN (CÓ PICKERS CHỌN NHANH)      */}
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

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Họ và tên */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Họ và tên của bạn</Text>
                <TextInput
                  style={styles.fieldInput}
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
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn giới tính',
                        options: ['Nữ', 'Nam', 'Khác'],
                        selected: ownerDraftGender,
                        onSelect: (val) => setOwnerDraftGender(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftGender || 'Chọn'}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Độ tuổi</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn độ tuổi',
                        options: OWNER_AGE_LIST,
                        selected: ownerDraftAge,
                        onSelect: (val) => setOwnerDraftAge(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftAge} tuổi</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ngày sinh (Dùng Date Picker Modal) */}
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

              {/* Cung hoàng đạo & MBTI (Dùng Selector) */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Cung hoàng đạo</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn cung hoàng đạo',
                        options: ZODIAC_LIST,
                        selected: ownerDraftZodiac,
                        onSelect: (val) => setOwnerDraftZodiac(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftZodiac || 'Chọn'}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>MBTI</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn nhóm tính cách MBTI',
                        options: MBTI_LIST,
                        selected: ownerDraftMbti,
                        onSelect: (val) => setOwnerDraftMbti(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{ownerDraftMbti || 'Chọn'}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Khu vực sinh sống */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Khu vực sinh sống</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftArea}
                  onChangeText={setOwnerDraftArea}
                  placeholder="VD: Vinhomes Grand Park, TP. Thủ Đức"
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Nghề nghiệp */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Nghề nghiệp hiện tại</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftOccupation}
                  onChangeText={setOwnerDraftOccupation}
                  placeholder="VD: UI/UX Designer"
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Học vấn / Trường học */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Học vấn / Trường tốt nghiệp</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftEducation}
                  onChangeText={setOwnerDraftEducation}
                  placeholder="VD: Đại học Quốc gia TP.HCM"
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Câu giới thiệu bản thân */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Câu giới thiệu bản thân</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 75, textAlignVertical: 'top' }]}
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
      {/* POPUP 4: THÊM BÉ CƯNG MỚI (CÓ SELECT & DATE PICKER)           */}
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
              {/* Loài thú cưng */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Loài thú cưng</Text>
                <View style={styles.speciesChoiceRow}>
                  {(['Chó', 'Mèo', 'Khác'] as const).map((sp) => (
                    <TouchableOpacity
                      key={sp}
                      style={[styles.speciesChoiceBtn, newPetSpecies === sp && styles.speciesChoiceBtnActive]}
                      onPress={() => setNewPetSpecies(sp)}
                    >
                      <Text style={[styles.speciesChoiceText, newPetSpecies === sp && styles.speciesChoiceTextActive]}>
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {newPetSpecies === 'Khác' && (
                  <TextInput
                    style={[styles.fieldInput, { marginTop: 8 }]}
                    placeholder="Nhập loài thú cưng (VD: Hamster, Thỏ...)"
                    placeholderTextColor="#A89E94"
                    value={newPetCustomSpecies}
                    onChangeText={setNewPetCustomSpecies}
                  />
                )}
              </View>

              {/* Tên bé */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Tên của bé *</Text>
                <TextInput
                  style={styles.fieldInput}
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
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="VD: Corgi, Poodle..."
                    placeholderTextColor="#A89E94"
                    value={newPetBreed}
                    onChangeText={setNewPetBreed}
                  />
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

              {/* Ngày sinh (Date Picker) & Tuổi (Select) */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Ngày sinh</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      setDatePickerConfig({
                        visible: true,
                        title: 'Chọn ngày sinh của bé',
                        initialDate: newPetBirthDate || '01/06/2024',
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
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn độ tuổi của bé',
                        options: PET_AGE_LIST,
                        selected: newPetAge,
                        onSelect: (val) => setNewPetAge(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{newPetAge}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cân nặng hiện tại */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Cân nặng hiện tại (kg)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="VD: 5.2"
                  placeholderTextColor="#A89E94"
                  keyboardType="numeric"
                  value={newPetWeight}
                  onChangeText={setNewPetWeight}
                />
              </View>

              {/* Sở thích ăn uống */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Sở thích ăn uống</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="VD: Thích ức gà xé, pate cá ngừ, súp thưởng..."
                  placeholderTextColor="#A89E94"
                  value={newPetFavoriteFood}
                  onChangeText={setNewPetFavoriteFood}
                />
              </View>

              {/* Lịch sử tẩy giun */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lịch sử tẩy giun</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="VD: 15/09/2025 (Định kỳ 3 tháng/lần)"
                  placeholderTextColor="#A89E94"
                  value={newPetDewormingHistory}
                  onChangeText={setNewPetDewormingHistory}
                />
              </View>

              {/* Tiền sử bệnh lý (Tùy chọn) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Tiền sử bệnh lý (Tùy chọn)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="VD: Nhạy cảm với sữa, không có bệnh nền..."
                  placeholderTextColor="#A89E94"
                  value={newPetMedicalHistory}
                  onChangeText={setNewPetMedicalHistory}
                />
              </View>

              {/* Thói quen tốt */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Thói quen tốt (Cách nhau bằng dấu phẩy)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="VD: Thân thiện, Nghe lời, Không sủa bậy..."
                  placeholderTextColor="#A89E94"
                  value={newPetGoodHabits}
                  onChangeText={setNewPetGoodHabits}
                />
              </View>

              {/* Lưu ý khi dạo chung */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lưu ý khi dạo chung (Cách nhau bằng dấu phẩy)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="VD: Hơi nhát người lạ, Sợ tiếng sấm lớn..."
                  placeholderTextColor="#A89E94"
                  value={newPetCautionHabits}
                  onChangeText={setNewPetCautionHabits}
                />
              </View>

              {/* Mô tả tính cách */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Mô tả tính cách & Giới thiệu</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Bé hiền lành, thích chạy nhảy, thích chơi ném bóng..."
                  placeholderTextColor="#A89E94"
                  value={newPetBio}
                  onChangeText={setNewPetBio}
                  multiline
                />
              </View>

              {/* Bảng cân nặng theo tháng */}
              <View style={styles.innerSectionBox}>
                <Text style={styles.innerSectionTitle}>Theo dõi cân nặng theo từng tháng:</Text>
                <View style={styles.weightRecordsWrap}>
                  {newPetWeightHistory.map((item, idx) => (
                    <View key={idx} style={styles.weightRecordPill}>
                      <Text style={styles.weightRecordPillText}>{item.month}: {item.weightKg}kg</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.addMiniRow}>
                  <TouchableOpacity
                    style={[styles.pickerSelectorBtn, { width: 90, height: 38 }]}
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn tháng theo dõi',
                        options: MONTH_LIST,
                        selected: tempWeightMonth,
                        onSelect: (val) => setTempWeightMonth(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{tempWeightMonth || 'Tháng'}</Text>
                    <Feather name="chevron-down" size={12} color="#7E6E60" />
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.fieldInput, { flex: 1, height: 38, marginHorizontal: 8 }]}
                    placeholder="Số kg (5.2)"
                    placeholderTextColor="#A89E94"
                    keyboardType="numeric"
                    value={tempWeightKg}
                    onChangeText={setTempWeightKg}
                  />

                  <TouchableOpacity
                    style={styles.addMiniBtn}
                    onPress={() => {
                      if (!tempWeightMonth || !tempWeightKg) return;
                      setNewPetWeightHistory((prev) => [
                        ...prev,
                        { month: tempWeightMonth, weightKg: parseFloat(tempWeightKg) || 5.0 },
                      ]);
                      setTempWeightKg('');
                    }}
                  >
                    <Text style={styles.addMiniBtnText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sổ tiêm chủng */}
              <View style={styles.innerSectionBox}>
                <Text style={styles.innerSectionTitle}>Chi tiết các mũi tiêm phòng:</Text>
                {newPetVaccineRecords.map((vac) => (
                  <View key={vac.id} style={styles.vacMiniItem}>
                    <Text style={styles.vacMiniItemTitle}>{vac.vaccineName} (Mũi {vac.doseNumber})</Text>
                    <Text style={styles.vacMiniItemSub}>Ngày: {vac.date} • {vac.clinic}</Text>
                  </View>
                ))}

                <View style={{ marginTop: 8 }}>
                  <TextInput
                    style={[styles.fieldInput, { height: 36, marginBottom: 6 }]}
                    placeholder="Tên vắc-xin (VD: Vắc-xin 7 bệnh)"
                    placeholderTextColor="#A89E94"
                    value={tempVacName}
                    onChangeText={setTempVacName}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.pickerSelectorBtn, { flex: 1, height: 36 }]}
                      onPress={() => {
                        setDatePickerConfig({
                          visible: true,
                          title: 'Chọn ngày tiêm',
                          initialDate: tempVacDate || '15/10/2025',
                          isPet: true,
                          onConfirm: (date) => setTempVacDate(date),
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorBtnText}>{tempVacDate || 'Ngày tiêm'}</Text>
                      <Feather name="calendar" size={12} color="#7E6E60" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.pickerSelectorBtn, { width: 85, height: 36 }]}
                      onPress={() => {
                        setPickerConfig({
                          visible: true,
                          title: 'Chọn số mũi tiêm',
                          options: ['Mũi 1', 'Mũi 2', 'Mũi 3', 'Nhắc lại'],
                          selected: `Mũi ${tempVacDose}`,
                          onSelect: (val) => setTempVacDose(val.replace('Mũi ', '')),
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorBtnText}>Mũi {tempVacDose}</Text>
                      <Feather name="chevron-down" size={12} color="#7E6E60" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.addMiniBtn, { marginTop: 6, alignSelf: 'flex-end', width: 90 }]}
                    onPress={() => {
                      if (!tempVacName) return;
                      setNewPetVaccineRecords((prev) => [
                        ...prev,
                        {
                          id: 'vac-' + Date.now(),
                          vaccineName: tempVacName,
                          date: tempVacDate || '01/10/2025',
                          doseNumber: parseInt(tempVacDose, 10) || 1,
                          clinic: tempVacClinic || 'BV Thú y',
                          isSafeVerified: true,
                        },
                      ]);
                      setTempVacName('');
                    }}
                  >
                    <Text style={styles.addMiniBtnText}>Thêm mũi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[styles.cleanSubmitBtn, { backgroundColor: theme.primary, width: '100%' }]}
                onPress={handleAddNewPet}
              >
                <Text style={styles.cleanSubmitBtnText}>Lưu Hồ sơ Thú cưng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 5: CHỈNH SỬA THÚ CƯNG (CÓ THÊM/ĐỔI ẢNH VÀ ĐỦ TRƯỜNG)   */}
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
              {/* Quản lý ảnh Album của bé */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Ảnh đại diện & Album ảnh của bé</Text>
                <View style={styles.editGalleryRow}>
                  {editPetGalleryDraft.map((imgUri, gIdx) => (
                    <View key={gIdx} style={styles.editGalleryThumbBox}>
                      <Image source={{ uri: imgUri }} style={styles.editGalleryThumbImg} />
                      {gIdx === 0 && (
                        <View style={styles.primaryPhotoBadge}>
                          <Text style={styles.primaryPhotoBadgeText}>Chính</Text>
                        </View>
                      )}
                      {editPetGalleryDraft.length > 1 && (
                        <TouchableOpacity
                          style={styles.removePhotoMiniBtn}
                          onPress={() =>
                            setEditPetGalleryDraft((prev) => prev.filter((_, i) => i !== gIdx))
                          }
                        >
                          <Feather name="x" size={10} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addPhotoToGalleryBtn}
                    onPress={async () => {
                      try {
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          allowsEditing: true,
                          quality: 0.9,
                        });
                        if (!result.canceled && result.assets && result.assets.length > 0) {
                          setEditPetGalleryDraft((prev) => [result.assets[0].uri, ...prev]);
                        }
                      } catch {
                        showToast('Chưa chọn ảnh mới');
                      }
                    }}
                  >
                    <Feather name="plus" size={18} color="#FF6F61" />
                    <Text style={styles.addPhotoToGalleryText}>Thêm ảnh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resetGalleryBtn}
                    onPress={() => {
                      const defaults =
                        editPetSpeciesDraft === 'Mèo' ? DEFAULT_CAT_GALLERY : DEFAULT_DOG_GALLERY;
                      setEditPetGalleryDraft(defaults);
                      showToast('Đã khôi phục album ảnh mẫu của bé');
                    }}
                  >
                    <Feather name="refresh-cw" size={15} color="#7E6E60" />
                    <Text style={styles.resetGalleryBtnText}>Ảnh mẫu</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tên bé */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Tên của bé *</Text>
                <TextInput
                  style={styles.fieldInput}
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
                      onPress={() => setEditPetSpeciesDraft(sp)}
                    >
                      <Text style={[styles.speciesChoiceText, editPetSpeciesDraft === sp && styles.speciesChoiceTextActive]}>
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {editPetSpeciesDraft === 'Khác' && (
                  <TextInput
                    style={[styles.fieldInput, { marginTop: 8 }]}
                    placeholder="Nhập loài thú cưng"
                    placeholderTextColor="#A89E94"
                    value={editPetCustomSpeciesDraft}
                    onChangeText={setEditPetCustomSpeciesDraft}
                  />
                )}
              </View>

              {/* Giống & Giới tính */}
              <View style={styles.fieldsTwoColRow}>
                <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Giống</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={editPetBreedDraft}
                    onChangeText={setEditPetBreedDraft}
                    placeholder="Giống bé"
                    placeholderTextColor="#A89E94"
                  />
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
                        initialDate: editPetBirthDateDraft || '15/03/2024',
                        isPet: true,
                        onConfirm: (date) => setEditPetBirthDateDraft(date),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{editPetBirthDateDraft || 'Chọn ngày'}</Text>
                    <Feather name="calendar" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Độ tuổi</Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn độ tuổi của bé',
                        options: PET_AGE_LIST,
                        selected: editPetAgeDraft,
                        onSelect: (val) => setEditPetAgeDraft(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{editPetAgeDraft}</Text>
                    <Feather name="chevron-down" size={14} color="#7E6E60" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cân nặng hiện tại */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Cân nặng hiện tại (kg)</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="numeric"
                  value={editPetWeightDraft}
                  onChangeText={setEditPetWeightDraft}
                />
              </View>

              {/* Thói quen tốt */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Thói quen tốt (Cách nhau bằng dấu phẩy)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPetGoodHabitsDraft}
                  onChangeText={setEditPetGoodHabitsDraft}
                  placeholder="Thân thiện với trẻ nhỏ, Biết ngồi chờ..."
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Lưu ý khi dạo chung */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lưu ý khi dạo chung (Cách nhau bằng dấu phẩy)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPetCautionHabitsDraft}
                  onChangeText={setEditPetCautionHabitsDraft}
                  placeholder="Hơi phấn khích khi gặp cún lạ..."
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Sở thích ăn uống */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Sở thích ăn uống</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPetFavoriteFoodDraft}
                  onChangeText={setEditPetFavoriteFoodDraft}
                  placeholder="Món ăn, hạt, súp thưởng bé thích..."
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Lịch sử tẩy giun */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Lịch sử tẩy giun</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPetDewormingHistoryDraft}
                  onChangeText={setEditPetDewormingHistoryDraft}
                  placeholder="Lần gần nhất, định kỳ..."
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Tiền sử bệnh lý (Tùy chọn) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Tiền sử bệnh lý (Tùy chọn)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPetMedicalHistoryDraft}
                  onChangeText={setEditPetMedicalHistoryDraft}
                  placeholder="Dị ứng, tiền sử điều trị..."
                  placeholderTextColor="#A89E94"
                />
              </View>

              {/* Mô tả tính cách */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Mô tả tính cách & Giới thiệu</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  value={editPetBioDraft}
                  onChangeText={setEditPetBioDraft}
                  multiline
                />
              </View>

              {/* Bảng cân nặng theo tháng */}
              <View style={styles.innerSectionBox}>
                <Text style={styles.innerSectionTitle}>Theo dõi cân nặng theo tháng:</Text>
                <View style={styles.weightRecordsWrap}>
                  {editPetWeightHistoryDraft.map((item, idx) => (
                    <View key={idx} style={styles.weightRecordPill}>
                      <Text style={styles.weightRecordPillText}>{item.month}: {item.weightKg}kg</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.addMiniRow}>
                  <TouchableOpacity
                    style={[styles.pickerSelectorBtn, { width: 90, height: 38 }]}
                    onPress={() => {
                      setPickerConfig({
                        visible: true,
                        title: 'Chọn tháng theo dõi',
                        options: MONTH_LIST,
                        selected: tempWeightMonth,
                        onSelect: (val) => setTempWeightMonth(val),
                      });
                    }}
                  >
                    <Text style={styles.pickerSelectorBtnText}>{tempWeightMonth || 'Tháng'}</Text>
                    <Feather name="chevron-down" size={12} color="#7E6E60" />
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.fieldInput, { flex: 1, height: 38, marginHorizontal: 8 }]}
                    placeholder="Số kg (5.2)"
                    placeholderTextColor="#A89E94"
                    keyboardType="numeric"
                    value={tempWeightKg}
                    onChangeText={setTempWeightKg}
                  />

                  <TouchableOpacity
                    style={styles.addMiniBtn}
                    onPress={() => {
                      if (!tempWeightMonth || !tempWeightKg) return;
                      setEditPetWeightHistoryDraft((prev) => [
                        ...prev,
                        { month: tempWeightMonth, weightKg: parseFloat(tempWeightKg) || 5.0 },
                      ]);
                      setTempWeightKg('');
                    }}
                  >
                    <Text style={styles.addMiniBtnText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Xóa hồ sơ bé này */}
              {editingPet && (
                <TouchableOpacity
                  style={styles.deletePetFullBtn}
                  onPress={() => handleConfirmDeletePet(editingPet)}
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
      {/* POPUP 6: POST PREVIEW MODAL (HÌNH 1 & HÌNH 2)                 */}
      {/* ============================================================= */}
      <Modal visible={!!selectedPreviewPost} transparent animationType="fade" onRequestClose={() => setSelectedPreviewPost(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setSelectedPreviewPost(null)}
            activeOpacity={1}
          />
          {selectedPreviewPost && (
            <View style={styles.previewCard}>
              <View style={styles.previewHeaderRow}>
                <Image
                  source={{ uri: selectedPreviewPost.authorAvatar || ownerAvatarUrl }}
                  style={styles.postPreviewAvatar}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.previewAuthorHandle}>{selectedPreviewPost.authorHandle}</Text>
                  <Text style={styles.previewMetaText}>Vừa xong • Công khai</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPreviewPost(null)} style={styles.previewCloseBtn}>
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Post Image */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  openLightboxMedia({
                    postId: selectedPreviewPost.id,
                    mediaUrls: selectedPreviewPost.mediaUrls || [selectedPreviewPost.authorAvatar || ownerAvatarUrl],
                    mediaType: selectedPreviewPost.mediaType || 'image',
                    initialIndex: 0,
                    authorName: selectedPreviewPost.authorName,
                    caption: selectedPreviewPost.content,
                  });
                }}
              >
                <Image
                  source={{ uri: selectedPreviewPost.mediaUrls?.[0] || ownerAvatarUrl }}
                  style={styles.previewPostImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Caption hiển thị dưới ảnh */}
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

              {/* Actions: "Xem chi tiết bài viết" */}
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
                  <Text style={styles.previewSecondaryActionText}>Đã thích</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewDangerActionBtn}
                  onPress={() => {
                    Alert.alert('Xóa bài viết', 'Bạn có chắc muốn xóa bài viết này khỏi bảng tin?', [
                      { text: 'Hủy', style: 'cancel' },
                      {
                        text: 'Xóa',
                        style: 'destructive',
                        onPress: () => {
                          deletePost(selectedPreviewPost.id);
                          setSelectedPreviewPost(null);
                        },
                      },
                    ]);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="trash-2" size={15} color="#E15B4C" />
                  <Text style={styles.previewDangerActionText}>Xóa khỏi bảng tin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ============================================================= */}
      {/* POPUP 7: POST DETAIL MODAL (BÌNH LUẬN, REPLY, THẢ REACT)      */}
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
                  {/* Author */}
                  <View style={styles.postDetailAuthorRow}>
                    <Image
                      source={{ uri: activePostDetail.authorAvatar || ownerAvatarUrl }}
                      style={styles.postDetailAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.postDetailAuthorName}>{activePostDetail.authorName}</Text>
                      <Text style={styles.postDetailAuthorHandle}>{activePostDetail.authorHandle}</Text>
                    </View>
                  </View>

                  {/* Image */}
                  <Image
                    source={{ uri: activePostDetail.mediaUrls?.[0] || ownerAvatarUrl }}
                    style={styles.postDetailImage}
                    resizeMode="cover"
                  />

                  {/* Caption */}
                  <Text style={styles.postDetailContentText}>{activePostDetail.content}</Text>

                  {/* Reactions */}
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

                  {/* Comments list */}
                  <View style={styles.commentsListBlock}>
                    <Text style={styles.commentsHeaderTitle}>
                      Bình luận ({activePostDetail.comments?.length || 0})
                    </Text>

                    {(activePostDetail.comments || []).map((cmt) => (
                      <View key={cmt.id} style={styles.commentItemWrap}>
                        <View style={styles.commentRow}>
                          <Image source={{ uri: cmt.authorAvatar || ownerAvatarUrl }} style={styles.commentAvatar} />
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

                        {/* Replies */}
                        {(cmt.replies || []).map((rep) => (
                          <View key={rep.id} style={styles.replyRow}>
                            <Image source={{ uri: rep.authorAvatar || ownerAvatarUrl }} style={styles.replyAvatar} />
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

                {/* Input Bar */}
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
      {/* 8. UNIVERSAL PICKER MODAL                                     */}
      {/* ============================================================= */}
      <UniversalPickerModal
        visible={pickerConfig.visible}
        title={pickerConfig.title}
        options={pickerConfig.options}
        selected={pickerConfig.selected}
        onSelect={pickerConfig.onSelect}
        onClose={() => setPickerConfig((prev) => ({ ...prev, visible: false }))}
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
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */
const pickerStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.55,
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
  optionsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 3,
  },
  optionRowSelected: {
    backgroundColor: '#FF6F61',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3A332C',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  datePickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
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
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EBE5DC',
    zIndex: 1, // Để thấp hơn avatarSectionRow để không che mất đỉnh avatar
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
    marginTop: -52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30, // Đặt zIndex cao hơn cover để toàn bộ vòng tròn avatar nổi lên trên
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
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: '#FDFBF7',
    backgroundColor: '#FDFBF7',
    position: 'relative',
  },
  ownerAvatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlusBadge: {
    position: 'absolute',
    top: 2, // Di chuyển lên trên đầu phía bên phải của ảnh avt
    right: 2,
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

  /* PET FULLSCREEN CONTAINER: Phủ trọn 100% màn hình, thẻ kính gối nửa dưới cuộn xuôi */
  petFullScreenContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 52 - 60, // Phủ trọn vùng xem giữa top header và bottom tab bar
    position: 'relative',
    backgroundColor: '#1C1815',
    overflow: 'hidden',
  },
  petScrollOverFullscreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  petScrollOverFullscreenContent: {
    paddingBottom: 60,
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
    top: '40%',
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
    top: '40%',
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

  /* Ultra-Translucent Frosted Glass Card: Mờ nhạt, gối nhẹ lên đáy ảnh & cuộn xuôi xuống */
  petScrollableFrostedCard: {
    marginHorizontal: 14,
    backgroundColor: 'rgba(22, 18, 16, 0.48)', // Mờ nhạt, nhìn thấu ảnh thú cưng tràn màn hình
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
    gap: 6,
    marginBottom: 8,
  },
  specFrostedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  specChipLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  specChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  expandToggleBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: 2,
  },
  expandToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A3E4D7',
  },
  petCardInnerScroll: {
    maxHeight: SCREEN_HEIGHT * 0.46,
    marginTop: 8,
  },
  petDetailCardRow: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 10,
    borderRadius: 12,
  },
  petDetailCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A3E4D7',
    marginBottom: 3,
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

  /* Weight Chart: Không đè chữ */
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
    height: SCREEN_HEIGHT * 0.88,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
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

  /* Edit Pet Gallery UI */
  editGalleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  editGalleryThumbBox: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBE5DC',
  },
  editGalleryThumbImg: {
    width: '100%',
    height: '100%',
  },
  primaryPhotoBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: '#FF6F61',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  primaryPhotoBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removePhotoMiniBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoToGalleryBtn: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF6F61',
    borderStyle: 'dashed',
    backgroundColor: '#FFF0EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoToGalleryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6F61',
    marginTop: 2,
  },
  resetGalleryBtn: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4CDC3',
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetGalleryBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E6E60',
    marginTop: 2,
  },

  innerSectionBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  innerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3E3D',
    marginBottom: 8,
  },
  weightRecordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  weightRecordPill: {
    backgroundColor: '#E8E2D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightRecordPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A332C',
  },
  addMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMiniBtn: {
    backgroundColor: '#FF6F61',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMiniBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vacMiniItem: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  vacMiniItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1815',
  },
  vacMiniItemSub: {
    fontSize: 11,
    color: '#7E6E60',
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
    borderTopWidth: 1,
    borderTopColor: '#F0ECE6',
    paddingTop: 8,
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
    backgroundColor: '#FF6F61',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  /* HAMBURGER MENU MODAL */
  menuOptionsList: {
    marginTop: 6,
    marginBottom: 8,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  menuItemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#7E6E60',
    marginTop: 2,
  },
});
