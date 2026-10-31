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
import { useMobilePawty, MAX_FREE_PETS } from '../context/MobilePawtyContext';
import { MobilePet, MobilePost, PetWeightEntry, PetVaccineRecord } from '../data/mobileSeedData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MOMENT_GRID_SIZE = Math.floor((SCREEN_WIDTH - 32 - 16) / 3);

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
/* 1. UNIVERSAL SELECT / PICKER MODAL (Dropdown tự chọn dạng vuốt chạm)       */
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
/* 2. DATE PICKER MODAL (Chọn Ngày / Tháng / Năm không cần gõ tay)           */
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
    showToast,
  } = useMobilePawty();

  const horizontalScrollRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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
    onSelect: () => { },
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
    onConfirm: () => { },
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

  // Popup 3: Thêm bé cưng mới đầy đủ thông tin & sức khỏe (Hình 3)
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
  const [newPetWeightHistory, setNewPetWeightHistory] = useState<PetWeightEntry[]>([
    { month: 'T8', weightKg: 4.2, date: '15/08/2026' },
    { month: 'T9', weightKg: 4.6, date: '15/09/2026' },
    { month: 'T10', weightKg: 5.0, date: '15/10/2026' },
    { month: 'T08', weightKg: 4.2 },
    { month: 'T09', weightKg: 4.6 },
    { month: 'T10', weightKg: 5.0 },
  ]);
  const [newPetVaccineRecords, setNewPetVaccineRecords] = useState<PetVaccineRecord[]>([
    {
      id: 'vac-1',
      vaccineName: 'Phòng dại & 7 bệnh cơ bản',
      date: '10/08/2026',
      date: '10/08/2025',
      doseNumber: 2,
      clinic: 'Bệnh viện thú y Pawty Care',
      isSafeVerified: true,
    },
  ]);
  // Temp inputs for adding record inside Add Pet Modal
  const [tempWeightMonth, setTempWeightMonth] = useState('');
  const [tempWeightKg, setTempWeightKg] = useState('');
  const [tempWeightMonth, setTempWeightMonth] = useState('T11');
  const [tempWeightKg, setTempWeightKg] = useState('5.2');
  const [tempVacName, setTempVacName] = useState('');
  const [tempVacDate, setTempVacDate] = useState('');
  const [tempVacDate, setTempVacDate] = useState('15/10/2025');
  const [tempVacDose, setTempVacDose] = useState('1');
  const [tempVacClinic, setTempVacClinic] = useState('');
  const [tempVacClinic, setTempVacClinic] = useState('BV Thú y Pawty');

  // Popup 4: Chỉnh sửa Thú Cưng đầy đủ thông tin & sức khỏe (Hình 5)
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
  const [editPetVaccineRecordsDraft, setEditPetVaccineRecordsDraft] = useState<PetVaccineRecord[]>([]);
  const [editPetWeightHistoryDraft, setEditPetWeightHistoryDraft] = useState<PetWeightEntry[]>([]);
  const [editPetGalleryDraft, setEditPetGalleryDraft] = useState<string[]>([]);
  const [editPetVaccineSafeDraft, setEditPetVaccineSafeDraft] = useState(true);

  // Popup 5: Post Preview Modal & Post Detail Modal (Hình 2)
  // Popup 5: Post Preview Modal & Post Detail Modal (Hình 1 & 2)
  const [selectedPreviewPost, setSelectedPreviewPost] = useState<MobilePost | null>(null);
  const [activePostDetail, setActivePostDetail] = useState<MobilePost | null>(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);

  // Moments list calculation
  const myPosts = posts.filter((p) => p.authorHandle === ownerHandle);
  const myPosts = posts.filter((p) => p.authorHandle === '@mainguyen');
  const displayPosts = myPosts.length > 0 ? myPosts : posts.slice(0, 6);

  const ownerAvatarUrl =
    pets[0]?.avatarUrl ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

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
      if(horizontalScrollRef.current) {
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
    setCurrentPageIndex(pageIndex);
  };

  // Toggle pet like
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

      // Cycle pet gallery photos
      const handleNextPetPhoto = (petId: string, totalPhotos: number) => {
        if (totalPhotos <= 1) return;
        setPetGalleryIndices((prev) => {
          const current = prev[petId] || 0;
          return { ...prev, [petId]: (current + 1) % totalPhotos };
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

          // Toggle expanded details on pet card
          /* ---------------- Pet Details Expand ---------------- */
          const togglePetDetailsExpanded = (petId: string) => {
            setExpandedPetDetails((prev) => ({
              ...prev,
              [petId]: !prev[petId],
            }));
          };

          // Open Edit Pet Modal
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
            setEditPetVaccineSafeDraft(pet.isVaccinatedAndRabies);
            setEditPetVaccineRecordsDraft(pet.vaccineRecords || [
              {
                id: `vac-${Date.now()}`,
                vaccineName: 'Phòng dại & 7 bệnh cơ bản',
                date: '01/10/2026',
                doseNumber: 1,
                clinic: 'Bệnh viện thú y Pawty Care',
                isSafeVerified: true,
              },
            ]);
            setEditPetWeightHistoryDraft(pet.weightHistory || [
              { month: 'T8', weightKg: pet.weightKg - 1, date: '15/08/2026' },
              { month: 'T9', weightKg: pet.weightKg - 0.5, date: '15/09/2026' },
              { month: 'T10', weightKg: pet.weightKg, date: '15/10/2026' },
            ]);
            setEditPetFavoriteFoodDraft(pet.favoriteFood || '');
            setEditPetDewormingHistoryDraft(pet.dewormingHistory || '');
            setEditPetMedicalHistoryDraft(pet.medicalHistory || '');
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

            updatePetProfile(editingPet.id, {
              name: editPetNameDraft.trim(),
              species: editPetSpeciesDraft,
              customSpecies: editPetSpeciesDraft === 'Khác' ? editPetCustomSpeciesDraft.trim() : undefined,
              breed: editPetBreedDraft.trim() || editingPet.breed,
              species: editPetSpeciesDraft === 'Khác' ? 'Chó' : editPetSpeciesDraft,
              customSpecies: editPetSpeciesDraft === 'Khác' ? finalSpecies : undefined,
              gender: editPetGenderDraft,
              ageLabel: editPetAgeDraft.trim() || editingPet.ageLabel,
              birthDate: editPetBirthDateDraft.trim() || editingPet.birthDate,
              breed: editPetBreedDraft.trim() || 'Thuần chủng',
              weightKg: parseFloat(editPetWeightDraft) || editingPet.weightKg,
              bio: editPetBioDraft.trim() || editingPet.bio,
              isVaccinatedAndRabies: editPetVaccineSafeDraft,
              ageLabel: editPetAgeDraft.trim() || '1 tuổi',
              birthDate: editPetBirthDateDraft.trim(),
              bio: editPetBioDraft.trim(),
              favoriteFood: editPetFavoriteFoodDraft.trim(),
              dewormingHistory: editPetDewormingHistoryDraft.trim(),
              medicalHistory: editPetMedicalHistoryDraft.trim(),
              vaccineRecords: editPetVaccineRecordsDraft,
              weightHistory: editPetWeightHistoryDraft,
              galleryUrls: editPetGalleryDraft,
              avatarUrl: editPetGalleryDraft[0] || editingPet.avatarUrl,
              coverUrl: editPetGalleryDraft[0] || editingPet.coverUrl,
            });

            setEditingPet(null);
            showToast('Đã cập nhật hồ sơ bé cưng');
          };

          const handleDeletePetFromEdit = () => {
            if (!editingPet) return;
            if (pets.length <= 1) {
              Alert.alert(
                'Không thể xóa',
                'Tài khoản cần duy trì ít nhất 1 hồ sơ thú cưng.',
                [{ text: 'Đã hiểu' }]
              );
              return;
            }

            const handleConfirmDeletePet = (pet: MobilePet) => {
              Alert.alert(
                'Xác nhận xóa thú cưng',
                `Bạn có chắc chắn muốn xóa hồ sơ bé ${editingPet.name}?`,
                'Xóa hồ sơ bé',
                `Bạn có chắc chắn muốn xóa hồ sơ của bé ${pet.name}? Dữ liệu sẽ không thể khôi phục.`,
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa bé',
                    text: 'Xóa vĩnh viễn',
                    style: 'destructive',
                    onPress: () => {
                      const petIdToDelete = editingPet.id;
                      deletePetProfile(pet.id);
                      setEditingPet(null);
                      deletePetProfile(petIdToDelete);
                      scrollToPage(0);
                    },
                  },
                ]
              );
            };

            // Save Owner Profile (Hình 1)
            const handleSaveOwnerProfile = () => {
              updateOwnerProfile({
                name: ownerDraftName.trim() || ownerName,
                gender: ownerDraftGender,
                area: ownerDraftArea.trim() || ownerArea,
                age: parseInt(ownerDraftAge, 10) || ownerAge,
                birthDate: ownerDraftBirthDate.trim(),
                zodiac: ownerDraftZodiac,
                mbti: ownerDraftMbti,
                education: ownerDraftEducation.trim(),
                major: ownerDraftMajor.trim(),
                occupation: ownerDraftOccupation.trim(),
                bio: ownerDraftBio.trim() || ownerBio,
                privacySettings: ownerDraftPrivacy,
              });
              setIsEditingOwnerProfile(false);
            };

            // Save New Pet Modal (Hình 3)
            const handleSaveNewPetModal = () => {
              /* ---------------- Add New Pet ---------------- */
              const handleAddNewPet = () => {
                if (!newPetName.trim()) {
                  Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho bé thú cưng mới.');
                  Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên bé thú cưng.');
                  return;
                }
                const finalSpecies = newPetSpecies === 'Khác' && newPetCustomSpecies.trim()
                  ? newPetCustomSpecies.trim()
                  : newPetSpecies;

                const defaultImg =
                  newPetSpecies === 'Mèo'
                    ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80';
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';

addNewPetProfile({
  name: newPetName.trim(),
  species: newPetSpecies,
  customSpecies: newPetSpecies === 'Khác' ? newPetCustomSpecies.trim() : undefined,
  breed: newPetBreed.trim() || (newPetSpecies === 'Chó' ? 'Poodle' : newPetSpecies === 'Mèo' ? 'Mèo Anh' : 'Thú cưng'),
  gender: newPetGender,
  birthDate: newPetBirthDate.trim() || '01/06/2024',
  species: newPetSpecies === 'Khác' ? 'Chó' : newPetSpecies,
  breed: newPetBreed.trim() || 'Bản địa',
  weightKg: parseFloat(newPetWeight) || 5.0,
  ageLabel: newPetAge.trim() || '1 tuổi',
  bio: newPetBio.trim() || `${newPetName.trim()} là thành viên mới rất quấn chủ.`,
  avatarUrl: defaultImg,
  galleryUrls: [defaultImg],
  weightHistory: newPetWeightHistory,
  vaccineRecords: newPetVaccineRecords,
  isVaccinatedAndRabies: true,
});

// Update extended health info
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
setNewPetCustomSpecies('');
setNewPetWeight('5.0');
setNewPetAge('1 tuổi');
setNewPetBio('');
setIsAddingPetModal(false);

setTimeout(() => {
  scrollToPage(pets.length + 1);
}, 300);
setNewPetFavoriteFood('');
setNewPetDewormingHistory('');
setNewPetMedicalHistory('');
showToast('Đã thêm bé cưng mới vào gia đình!');
  };

// Add weight entry to draft
const handleAddWeightToDraft = (isAddingNew: boolean) => {
  if (!tempWeightMonth.trim() || !tempWeightKg.trim()) {
    Alert.alert('Thiếu thông tin', 'Vui lòng nhập tháng (VD: T11) và cân nặng (kg).');
    return;
  }
  const newEntry: PetWeightEntry = {
    month: tempWeightMonth.trim(),
    weightKg: parseFloat(tempWeightKg) || 5,
    date: 'Vừa cập nhật',
  };
  if (isAddingNew) {
    setNewPetWeightHistory((prev) => [...prev, newEntry]);
  } else {
    setEditPetWeightHistoryDraft((prev) => [...prev, newEntry]);
  }
  setTempWeightMonth('');
  setTempWeightKg('');
};

// Add vaccine entry to draft
const handleAddVaccineToDraft = (isAddingNew: boolean) => {
  if (!tempVacName.trim() || !tempVacDate.trim()) {
    Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên mũi tiêm và ngày tiêm.');
    return;
  }
  const newRecord: PetVaccineRecord = {
    id: `vac-${Date.now()}`,
    vaccineName: tempVacName.trim(),
    date: tempVacDate.trim(),
    doseNumber: parseInt(tempVacDose, 10) || 1,
    clinic: tempVacClinic.trim() || 'Phòng khám thú y',
    isSafeVerified: true,
  };
  if (isAddingNew) {
    setNewPetVaccineRecords((prev) => [...prev, newRecord]);
  } else {
    setEditPetVaccineRecordsDraft((prev) => [...prev, newRecord]);
  }
  setTempVacName('');
  setTempVacDate('');
  setTempVacClinic('');
  setTempVacDose('1');
};

// Change cover image from device library
const handlePickCoverFromDevice = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setOwnerCoverUrl(result.assets[0].uri);
      setIsChangingCoverModal(false);
      showToast('Đã đổi ảnh bìa từ thư viện máy!');
    }
  } catch {
    showToast('Không thể mở thư viện ảnh.');
  }
};

// Add pet photo from device library
const handleAddPetPhotoFromDevice = async (petId: string) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        const currentGallery = pet.galleryUrls || [pet.coverUrl || pet.avatarUrl];
        const updatedGallery = [newUri, ...currentGallery];
        updatePetProfile(petId, {
          galleryUrls: updatedGallery,
          avatarUrl: newUri,
          coverUrl: newUri,
        });
        setPetGalleryIndices((prev) => ({ ...prev, [petId]: 0 }));
        showToast(`Đã thêm ảnh mới cho bé ${pet.name}!`);
      }
    }
  } catch {
    showToast('Không thể mở thư viện ảnh.');
  }
};

// Post Actions (Hình 2)
const handleDeletePostConfirmed = (postId: string) => {
  Alert.alert(
    'Xóa khỏi bảng tin',
    'Bài viết này sẽ bị xóa hoàn toàn khỏi trang cá nhân và bảng tin cộng đồng.',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa bài viết',
        style: 'destructive',
        onPress: () => {
          deletePost(postId);
          setSelectedPreviewPost(null);
          if (activePostDetail?.id === postId) {
            setActivePostDetail(null);
          }
        },
      },
    ]
  );
};

const handleTogglePostLike = (postId: string) => {
  toggleReaction(postId, 'love');
  if (selectedPreviewPost && selectedPreviewPost.id === postId) {
    setSelectedPreviewPost({
      ...selectedPreviewPost,
      userReaction: selectedPreviewPost.userReaction ? null : 'love',
    });
  }
};

// Send new comment or reply
const handleSendComment = () => {
  if (!commentInputText.trim() || !activePostDetail) return;
  if (replyingCommentId) {
    addCommentReply(activePostDetail.id, replyingCommentId, commentInputText.trim());
    setReplyingCommentId(null);
  } else {
    addComment(activePostDetail.id, commentInputText.trim());
  }
  setCommentInputText('');
};

return (
  <View style={styles.rootContainer}>
    {/* ================================================================= */}
    {/* TOP INTEGRATED HEADER: [Con sen] · [Lu] · [Miu] · [+] + Hamburger ☰ */}
    {/* ================================================================= */}
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

        {/* Pills 1..N: Each Pet */}
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

        {/* Dấu cộng trên cùng: Kích hoạt Modal Thêm Bé Mới */}
        {/* [+] Add Pet Pill */}
        {pets.length < MAX_FREE_PETS && (
          <TouchableOpacity
            style={styles.headerAddPill}
            style={styles.headerAddPetPill}
            onPress={() => setIsAddingPetModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={14} color="#FF6F61" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Right Menu Action: Hamburger Button ☰ */}
      <View style={styles.headerRightMenuBox}>
        {isVip && (
          <View style={[styles.vipMiniBadge, { backgroundColor: theme.primarySoft }]}>
            <Feather name="award" size={11} color={theme.primary} />
            <Text style={[styles.vipMiniText, { color: theme.primary }]}>VIP</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setActiveModal('my_settings')}
          activeOpacity={0.8}
        >
          <Feather name="menu" size={20} color="#1C1815" />
        </TouchableOpacity>
      </View>
      {/* Hamburger Menu on the right */}
      <TouchableOpacity
        style={styles.headerHamburgerBtn}
        onPress={() => setActiveModal('profile_menu')}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={20} color="#1C1815" />
      </TouchableOpacity>
    </View>

    {/* ================================================================= */}
    {/* HORIZONTAL PAGING CONTAINER: Page 0 (Con sen) -> Page 1..N (Pets) */}
    {/* ================================================================= */}
    {/* ------------------------------------------------------------- */}
    {/* HORIZONTAL PAGING SCROLL VIEW                                 */}
    {/* ------------------------------------------------------------- */}
    <ScrollView
      ref={horizontalScrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScrollEnd}
      style={styles.horizontalScroll}
      contentContainerStyle={{ flexGrow: 1 }}
      style={styles.horizontalPagingScroll}
    >
      {/* ================================================================= */}
      {/* PAGE 0: HỒ SƠ CON SEN                                            */}
      {/* ================================================================= */}
      <View style={styles.pageWrapper}>
        <ScrollView
          style={styles.ownerScroll}
          contentContainerStyle={styles.ownerScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Cover Background Image & Nút Đổi ảnh bìa hoạt động mượt mà */}
          <View style={styles.ownerCoverWrap}>
            <Image source={{ uri: ownerCoverUrl }} style={styles.ownerCoverImg} />
            <View style={styles.ownerCoverGradient} pointerEvents="none" />
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
                  onPress={() => openLightboxMedia([ownerCoverUrl])}
                >
                  <Image source={{ uri: ownerCoverUrl }} style={styles.ownerCoverImg} resizeMode="cover" />
                </TouchableOpacity>

                {/* Nút Đổi ảnh bìa */}
                <TouchableOpacity
                  style={styles.changeCoverBtn}
                  onPress={() => setIsChangingCoverModal(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="camera" size={13} color="#FFFFFF" />
                  <Text style={styles.changeCoverBtnText}>Đổi ảnh bìa</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.changeCoverBtn}
                onPress={() => setIsChangingCoverModal(true)}
                activeOpacity={0.85}
              >
                <Feather name="camera" size={13} color="#FFFFFF" />
                <Text style={styles.changeCoverBtnText}>Đổi ảnh bìa</Text>
              </TouchableOpacity>
          </View>

          {/* 2. Floating Note Bubble */}
          {/* 2. Floating Note Bubble & Avatar Overlap (50% trên ảnh bìa) */}
          <View style={styles.avatarSectionRow}>
            {/* Note Bubble placed floating above avatar */}
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
                  {ownerNoteBubble || 'Chiều nay ai ra công viên không? 🐾'}
                  {ownerNoteBubble || 'Chiều nay ai ra công viên không?'}
                </Text>
                <View style={styles.noteBubbleTail} />
              </TouchableOpacity>
            </View>

            {/* 3. Avatar Row: Avatar with [+] & Sleek Pen Button on Right */}
            <View style={styles.avatarSectionRow}>
              <View style={styles.avatarSideSpacer} />
              {/* Avatar Wrap: Overlaps 50% on bottom of cover */}
              <View style={styles.ownerAvatarWrap}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openLightboxMedia([ownerAvatarUrl])}
                >
                  <Image source={{ uri: ownerAvatarUrl }} style={styles.ownerAvatarImg} />
                </TouchableOpacity>

                <View style={styles.ownerAvatarWrap}>
                  <TouchableOpacity
                    onPress={() => {
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
                    }}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: ownerAvatarUrl }} style={styles.ownerAvatarImg} />
                  </TouchableOpacity>
                  {/* Note '+' badge */}
                  <TouchableOpacity
                    style={[styles.avatarPlusBadge, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setTempNoteText(ownerNoteBubble || '');
                      setIsEditingNote(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="plus" size={13} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Small '+' badge on avatar to open Note modal */}
                  <TouchableOpacity
                    style={[styles.avatarPlusBadge, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setTempNoteText(ownerNoteBubble || '');
                      setIsEditingNote(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="plus" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Right Side: Sleek Pen Edit Icon [ ✎ ] */}
                <View style={styles.avatarSideBtnBox}>
                  <TouchableOpacity
                    style={styles.sleekEditPenBtn}
                    onPress={() => {
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
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="edit-2" size={16} color="#1C1815" />
                  </TouchableOpacity>
                </View>
                {/* Camera change avatar badge */}
                <TouchableOpacity
                  style={styles.avatarCameraBadge}
                  onPress={handlePickOwnerAvatar}
                  activeOpacity={0.85}
                >
                  <Feather name="camera" size={11} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* 4. Owner Information: Tên, Nghề nghiệp/Châm ngôn, Vị trí */}
              <View style={styles.ownerInfoCenterBox}>
                <Text style={styles.ownerFullNameText}>{ownerName}</Text>
                <Text style={styles.ownerJobTitleText}>
                  {ownerOccupation ? `${ownerOccupation} · ` : ''}{ownerBio || 'UI UX designer & Pet Parent'}
                </Text>
                {/* Right Side: Sleek Pen Edit Icon */}
                <TouchableOpacity
                  style={styles.sleekEditPenBtn}
                  onPress={openEditOwnerModal}
                  activeOpacity={0.85}
                >
                  <Feather name="edit-2" size={16} color="#1C1815" />
                </TouchableOpacity>
              </View>

              {ownerPrivacySettings?.area !== false && (
                <View style={styles.ownerLocationRow}>
                  <Feather name="map-pin" size={13} color="#E15B4C" />
                  <Text style={styles.ownerLocationText}>
                    {ownerArea || 'Vinhomes Grand Park, TP. Thủ Đức'}
                  </Text>
                </View>
              )}
              {/* 3. Owner Information: Tên, Nghề nghiệp, Câu giới thiệu, Vị trí */}
              <View style={styles.ownerInfoCenterBox}>
                <Text style={styles.ownerFullNameText}>{ownerName}</Text>

                {/* Badges / Chips for Owner Public Details (Zodiac, MBTI, Education, Age) */}
                <View style={styles.ownerBadgesRow}>
                  {ownerPrivacySettings?.zodiac !== false && ownerZodiac ? (
                    <View style={styles.ownerBadgeChip}>
                      <Text style={styles.ownerBadgeChipText}>✨ {ownerZodiac}</Text>
                    </View>
                  ) : null}
                  {ownerPrivacySettings?.mbti !== false && ownerMbti ? (
                    <View style={styles.ownerBadgeChip}>
                      <Text style={styles.ownerBadgeChipText}>🧠 {ownerMbti}</Text>
                    </View>
                  ) : null}
                  {ownerPrivacySettings?.age !== false && ownerAge ? (
                    <View style={styles.ownerBadgeChip}>
                      <Text style={styles.ownerBadgeChipText}>🎂 {ownerAge} tuổi</Text>
                    </View>
                  ) : null}
                  {ownerPrivacySettings?.education !== false && ownerEducation ? (
                    <View style={styles.ownerBadgeChip}>
                      <Text style={styles.ownerBadgeChipText}>🎓 {ownerEducation}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              {/* Profession: Dedicated line */}
              {ownerOccupation ? (
                <Text style={styles.ownerJobTitleText}>{ownerOccupation}</Text>
              ) : null}

              {/* 5. Thẻ 3 Con Số Thống Kê (followers | following | likes) */}
              <View style={styles.ownerStatsCard}>
                <View style={styles.statColumn}>
                  <Text style={styles.statNumberText}>1.2K</Text>
                  <Text style={styles.statLabelText}>người theo dõi</Text>
                </View>
                {/* Bio: Dedicated line */}
                {ownerBio ? (
                  <Text style={styles.ownerBioText}>{ownerBio}</Text>
                ) : null}

                <View style={styles.statDividerVertical} />

                <View style={styles.statColumn}>
                  <Text style={styles.statNumberText}>268</Text>
                  <Text style={styles.statLabelText}>đang theo dõi</Text>
                  {/* Location */}
                  {ownerPrivacySettings?.area !== false && (
                    <View style={styles.ownerLocationRow}>
                      <Feather name="map-pin" size={13} color="#FF6F61" />
                      <Text style={styles.ownerLocationText}>
                        {ownerArea || 'Vinhomes Grand Park, TP. Thủ Đức'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.statDividerVertical} />
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

                <View style={styles.statColumn}>
                  <Text style={styles.statNumberText}>4.5K</Text>
                  <Text style={styles.statLabelText}>lượt thích</Text>
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

                {/* 6. Section Khoảnh Khắc: Sub-tabs & Nút Đăng Bài Viết Mới */}
                <View style={styles.momentsHeaderRow}>
                  <View style={styles.momentsSubTabsBox}>
                    <TouchableOpacity
                      {/* 5. Section Khoảnh Khắc */}
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
                              styles.momentTabItem,
                              ownerMediaTab === 'moments' && styles.momentTabItemActive,
                              styles.momentSubTabText,
                              ownerMediaTab === 'moments' && styles.momentSubTabTextActive,
                            ]}
                            onPress={() => setOwnerMediaTab('moments')}
                          >
                            <Text
                              style={[
                                styles.momentTabText,
                                ownerMediaTab === 'moments' && styles.momentTabTextActive,
                              ]}
                            >
                              Khoảnh khắc ({displayPosts.length})
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
                        Khoảnh khắc ({displayPosts.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      <TouchableOpacity
                onPress={() => setOwnerMediaTab('saved')}
                      style={[
                        styles.momentSubTabBtn,
                        ownerMediaTab === 'saved' && styles.momentSubTabBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.momentTabItem,
                          ownerMediaTab === 'saved' && styles.momentTabItemActive,
                          styles.momentSubTabText,
                          ownerMediaTab === 'saved' && styles.momentSubTabTextActive,
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

                  {/* Nút Đăng bài */}
                  <TouchableOpacity
                    style={[styles.createMomentBtn, { backgroundColor: theme.primary }]}
                    onPress={() => setActiveModal('new_moment')}
                    activeOpacity={0.85}
                  >
                    <Feather name="plus" size={13} color="#FFFFFF" />
                    <Text style={styles.createMomentBtnText}>Đăng bài</Text>
                    Được lưu
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 7. Lưới Bài Đăng Khoảnh Khắc */}
              {displayPosts.length > 0 ? (
                <View style={styles.momentsGridBox}>
                  {displayPosts.map((post) => {
                    const urls = post.mediaUrls || [];
                    const thumb = urls[0] || ownerAvatarUrl;
                    <TouchableOpacity
                      style={styles.addPostQuickBtn}
                      onPress={() => setActiveModal('create_post')}
                      activeOpacity={0.85}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" />
                      <Text style={styles.addPostQuickBtnText}>Đăng bài</Text>
                    </TouchableOpacity>
          </View>

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
            ) : (
            <View style={styles.emptyMomentsBox}>
              <Feather name="camera" size={28} color="#C4B9AD" />
              <Text style={styles.emptyMomentsText}>
                Chưa có khoảnh khắc nào được đăng
              </Text>
              {/* 6. Media Grid */}
              <View style={styles.momentsGridContainer}>
                {displayPosts.map((post) => {
                  const urls = post.mediaUrls || [];
                  const thumb = urls[0] || ownerAvatarUrl;
                  return (
                    <TouchableOpacity
                      style={[styles.emptyPostBtn, { backgroundColor: theme.primary }]}
                      onPress={() => setActiveModal('new_moment')}
                      key={post.id}
                      style={styles.gridThumbItem}
                      activeOpacity={0.88}
                      onPress={() => setSelectedPreviewPost(post)}
                    >
                      <Text style={styles.emptyPostBtnText}>Đăng bài đầu tiên</Text>
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
              </View>
            )}
            </ScrollView>
          </View>
          );
            })}
      </View>
    </ScrollView>

    {/* ================================================================= */}
    {/* PAGES 1..N: HỒ SƠ TỪNG BÉ THÚ CƯNG (FULL MÀN HÌNH + THẺ SIÊU MỜ)  */}
    {/* ================================================================= */}
    {/* ========================================================= */}
    {/* PAGES 1..N: HỒ SƠ TỪNG BÉ THÚ CƯNG (FULLSCREEN PET PAGE)  */}
    {/* ========================================================= */}
    {pets.map((pet) => {
      const petLikeInfo = petLikes[pet.id] || { count: 128, isLiked: false };
      const gallery =
        pet.galleryUrls && pet.galleryUrls.length > 0
          ? pet.galleryUrls
          : [pet.coverUrl || pet.avatarUrl];
      const activePhotoIdx = (petGalleryIndices[pet.id] || 0) % gallery.length;
      const currentPetImg = gallery[activePhotoIdx] || pet.avatarUrl;
      const isExpanded = !!expandedPetDetails[pet.id];
      const isLiked = pet.isLiked ?? false;
      const likesCount = pet.likesCount ?? 148;

      return (
        <View key={pet.id} style={styles.pageWrapper}>
          <View style={styles.petFullScreenContainer}>
            {/* 1. Full-Screen Pet Image */}
            <Image
              source={{ uri: currentPetImg }}
              style={styles.petFullBgImage}
              resizeMode="cover"
            />
            <ScrollView
              key={pet.id}
              style={styles.petScrollContainer}
              contentContainerStyle={styles.petScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Pet Photo Container with Double-tap to Like */}
              <View style={styles.petPhotoContainer}>
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => handlePetContainerTap(pet.id)}
                  style={styles.petPhotoTouch}
                >
                  <Image
                    source={{ uri: currentPetImg }}
                    style={styles.petFullBgImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* 2. Top Floating Action Bar: Loài & Cụm nút Thả Tim + Thêm Ảnh + Bút Sửa */}
                {/* Top Floating Action Bar */}
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
                        petLikeInfo.isLiked && styles.petFloatingLikeBtnActive,
                        isLiked && styles.petFloatingLikeBtnActive,
                      ]}
                      onPress={() => handleTogglePetLike(pet.id)}
                      onPress={() => togglePetLike(pet.id)}
                      activeOpacity={0.85}
                    >
                      <Feather
                        name="heart"
                        size={15}
                        color={petLikeInfo.isLiked ? '#FF6F61' : '#FFFFFF'}
                        color={isLiked ? '#FF6F61' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          styles.petFloatingLikeText,
                          petLikeInfo.isLiked && { color: '#FF6F61' },
                          isLiked && { color: '#FF6F61' },
                        ]}
                      >
                        {petLikeInfo.count}
                        {likesCount}
                      </Text>
                    </TouchableOpacity>

                    {/* Thêm/Đổi ảnh bé */}
                    <TouchableOpacity
                      style={styles.petFloatingEditBtn}
                      onPress={() => handleAddPetPhotoFromDevice(pet.id)}
                      activeOpacity={0.85}
                    >
                      <Feather name="camera" size={15} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Bút chỉnh sửa */}
                    <TouchableOpacity
                      style={styles.petFloatingEditBtn}
                      onPress={() => openEditPetModal(pet)}
                      activeOpacity={0.85}
                    >
                      <Feather name="edit-2" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Gallery Pagination Dots (Nếu có nhiều ảnh) */}
                {/* Frosted Navigation Buttons on Left and Right edges */}
                {gallery.length > 1 && (
                  <View style={styles.petGalleryDotsRow}>
                    {gallery.map((_, gIdx) => (
                      <TouchableOpacity
                        key={gIdx}
                        onPress={() =>
                          setPetGalleryIndices((prev) => ({ ...prev, [pet.id]: gIdx }))
                        }
                        style={[
                          styles.petGalleryDot,
                          activePhotoIdx === gIdx && styles.petGalleryDotActive,
                        ]}
                      />
                    ))}
                    <>
                      <TouchableOpacity
                        style={styles.nextPhotoMiniBtn}
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
                        <Feather name="chevron-right" size={14} color="#FFFFFF" />
                        <Text style={styles.petGalleryNavArrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* 3. Ultra-Translucent Frosted Card: Mờ nhạt hơn, không che mất ảnh */}
                <View style={styles.petUltraTranslucentCard}>
                  {/* Header: Tên bé & Giống loài */}
                  <View style={styles.petCardHeaderRow}>
                    <Text style={styles.petCardMainName}>{pet.name}</Text>
                    <View style={styles.petBreedFullTag}>
                      <Text style={styles.petBreedFullText}>{pet.breed}</Text>
                    </View>
                    {/* Heart Burst Animated Overlay */}
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
                  </View>

                  {/* Translucent Frosted Card: Cuộn lướt cùng nội dung xuống phía dưới */}
                  <View style={styles.petUltraTranslucentCard}>
                    {/* Header: Tên bé & Giống */}
                    <View style={styles.petCardHeaderRow}>
                      <Text style={styles.petCardMainName}>{pet.name}</Text>
                      <View style={styles.petBreedFullTag}>
                        <Text style={styles.petBreedFullText}>{pet.breed}</Text>
                      </View>
                    </View>

                    {/* Chi tiết thông số cơ bản */}
                    <View style={styles.petSpecsWrapRow}>
                      {/* Thông số cơ bản */}
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
                            <Text style={styles.specChipLabel}>Giới tính</Text>
                            <Text style={styles.specChipValue}>{pet.gender || 'Đực'}</Text>
                            <Text style={styles.specChipLabel}>Ngày sinh</Text>
                            <Text style={styles.specChipValue}>{pet.birthDate}</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.specFrostedChip}>
                        <Text style={styles.specChipLabel}>Tuổi</Text>
                        <Text style={styles.specChipValue}>{pet.ageLabel}</Text>
                      </View>
                      {/* Toggle button */}
                      <TouchableOpacity
                        style={styles.expandToggleBtn}
                        onPress={() => togglePetDetailsExpanded(pet.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.expandToggleBtnText}>
                          {isExpanded ? 'Thu gọn chi tiết ⌃' : 'Hiện thêm chi tiết sức khỏe & sổ tiêm ⌄'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.specFrostedChip}>
                        <Text style={styles.specChipLabel}>Cân nặng</Text>
                        <Text style={styles.specChipValue}>{pet.weightKg} kg</Text>
                      </View>

                      {pet.birthDate ? (
                        <View style={styles.specFrostedChip}>
                          <Text style={styles.specChipLabel}>Ngày sinh</Text>
                          <Text style={styles.specChipValue}>{pet.birthDate}</Text>
                        </View>
                {/* Vùng chi tiết mở rộng: Cuộn tự nhiên */}
                      {isExpanded && (
                        <View style={styles.petExpandedContentBlock}>
                          {/* Mô tả */}
                          {pet.bio ? (
                            <Text style={styles.petCardBioText}>{pet.bio}</Text>
                          ) : null}
                        </View>

                  {/* Nút Hiện thêm chi tiết / Thu gọn để không che hình */}
                      <TouchableOpacity
                        style={styles.expandToggleBtn}
                        onPress={() => togglePetDetailsExpanded(pet.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.expandToggleBtnText}>
                          {isExpanded ? 'Thu gọn chi tiết ⌃' : 'Hiện thêm chi tiết sức khỏe & sổ tiêm ⌄'}
                        </Text>
                      </TouchableOpacity>
                      {/* Sở thích ăn uống */}
                      <View style={styles.petDetailCardRow}>
                        <Text style={styles.petDetailCardLabel}>Sở thích ăn uống:</Text>
                        <Text style={styles.petDetailCardValue}>
                          {pet.favoriteFood || 'Ức gà luộc, pate cá hồi, bánh thưởng dinh dưỡng'}
                        </Text>
                      </View>

                      {/* Vùng chi tiết mở rộng */}
                      {isExpanded && (
                        <ScrollView
                          style={styles.petExpandedScrollView}
                          showsVerticalScrollIndicator={false}
                        >
                          {/* Mô tả */}
                          {pet.bio ? (
                            <Text style={styles.petCardBioText}>{pet.bio}</Text>
                          ) : null}
                          {/* Lịch sử tẩy giun */}
                          <View style={styles.petDetailCardRow}>
                            <Text style={styles.petDetailCardLabel}>Lịch sử tẩy giun:</Text>
                            <Text style={styles.petDetailCardValue}>
                              {pet.dewormingHistory || '15/09/2025 (Định kỳ 3 tháng/lần - Thuốc Drontal)'}
                            </Text>
                          </View>

                          {/* Theo dõi cân nặng qua các tháng (Dạng cột trực quan) */}
                          <View style={styles.petHealthSectionBox}>
                            <Text style={styles.petHealthSectionTitle}>
                              📊 Theo dõi cân nặng theo tháng:
                            </Text>
                            <View style={styles.weightBarsRow}>
                              {(pet.weightHistory || [
                                { month: 'T8', weightKg: 26 },
                                { month: 'T9', weightKg: 27.2 },
                                { month: 'T10', weightKg: pet.weightKg },
                              ]).map((item, wIdx) => (
                                <View key={wIdx} style={styles.weightBarItem}>
                                  <Text style={styles.weightBarKgText}>{item.weightKg}kg</Text>
                                  <View
                                    style={[
                                      styles.weightBarPill,
                                      { height: Math.min(65, Math.max(20, item.weightKg * 2)) },
                                    ]}
                                  />
                                  <Text style={styles.weightBarMonthText}>{item.month}</Text>
                                </View>
                              ))}
                            </View>
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
                              💉 Sổ tiêm chủng & Vắc-xin:
                            </Text>
                            {(pet.vaccineRecords && pet.vaccineRecords.length > 0
                              ? pet.vaccineRecords
                    {/* Theo dõi cân nặng qua các tháng: Không đè chữ */}
                            <View style={styles.petHealthSectionBox}>
                              <Text style={styles.petHealthSectionTitle}>
                                Theo dõi cân nặng theo tháng:
                              </Text>
                              <View style={styles.weightBarsContainer}>
                                {(pet.weightHistory && pet.weightHistory.length > 0
                                  ? pet.weightHistory
                                  : [
                                    {
                                      id: 'v-1',
                                      vaccineName: 'Phòng dại & 7 bệnh cơ bản',
                                      date: '01/10/2026',
                                      doseNumber: 1,
                                      clinic: 'Bệnh viện thú y Pawty Care',
                                      isSafeVerified: true,
                                    },
                                    { month: 'T08', weightKg: 25.0 },
                                    { month: 'T09', weightKg: 26.2 },
                                    { month: 'T10', weightKg: 27.1 },
                                    { month: 'T11', weightKg: 27.9 },
                                    { month: 'T12', weightKg: pet.weightKg },
                                  ]
                                ).map((vac) => (
                                  <View key={vac.id} style={styles.vaccineCardItem}>
                                    <View style={styles.vaccineItemHeader}>
                                      <Feather name="shield" size={13} color="#A3E4D7" />
                                      <Text style={styles.vaccineItemName}>{vac.vaccineName}</Text>
                                      <View style={styles.doseBadge}>
                                        <Text style={styles.doseBadgeText}>Mũi {vac.doseNumber}</Text>
                                      </View>
                        ).map((item, wIdx, arr) => {
                          const maxKg = Math.max(...arr.map((x) => x.weightKg), 30);
                                      const barH = Math.max(20, Math.round((item.weightKg / maxKg) * 55));
                                      return (
                                      <View key={wIdx} style={styles.weightBarColumn}>
                                        <Text style={styles.weightBarKgText}>{item.weightKg}kg</Text>
                                        <View style={[styles.weightBarPill, { height: barH }]} />
                                        <Text style={styles.weightBarMonthText}>{item.month}</Text>
                                      </View>
                                      <Text style={styles.vaccineItemDetails}>
                                        Ngày tiêm: {vac.date} · Cơ sở: {vac.clinic}
                                      </Text>
                                    </View>
                        ))}
                                    );
                        })}
                                  </View>
                    </View>

                              {/* Thói quen & Lưu ý */}
                              <View style={styles.habitsSectionRow}>
                                <Text style={styles.habitsSectionTitle}>Tính cách:</Text>
                                <View style={styles.habitsChipsWrap}>
                                  {(pet.goodHabits || ['Thân thiện', 'Biết ngồi chờ']).map((h, i) => (
                                    <View key={i} style={styles.habitGoodPill}>
                                      <Text style={styles.habitGoodText}>✓ {h}</Text>
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
                          ))}
                                            </View>
                                          </View>

                      {
                                            pet.cautionHabits && pet.cautionHabits.length > 0 && (
                                              <View style={styles.habitsSectionRow}>
                                                <Text style={styles.habitsSectionTitle}>Lưu ý khi dắt chung:</Text>
                                                <View style={styles.habitsChipsWrap}>
                                                  {pet.cautionHabits.map((c, i) => (
                                                    <View key={i} style={styles.habitCautionPill}>
                                                      <Text style={styles.habitCautionText}>! {c}</Text>
                                                    </View>
                                                  ))}
                                                </View>
                                                <Text style={styles.vaccineItemSub}>
                                                  Ngày: {vac.date} • {vac.clinic || 'Phòng khám thú y'}
                                                </Text>
                                              </View>
                                            )
                                          }
                    </ScrollView>
                  )}
                      ))}
                                    </View>
                  </View>
                )}

                                {/* Bottom Action: CTA Hẹn dạo cùng bé */}
                                <TouchableOpacity
                                  style={styles.petFullWidthCtaBtn}
                                  onPress={() => {
                                    Alert.alert(
                                      'Hẹn dạo cùng bé',
                                      `Đã gửi lời mời hẹn dạo cùng bé ${pet.name}! Bạn có thể tiếp tục trò chuyện trong Tin nhắn.`,
                                      [{ text: 'Đã hiểu' }]
                                    );
                                  }}
                                  activeOpacity={0.88}
                                >
                                  <Text style={styles.petFullWidthCtaText}>Hẹn dạo cùng bé</Text>
                                </TouchableOpacity>
                              </View>
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
                          </View>
                        </ScrollView>
                      );
        })}
                    </ScrollView>

                    {/* ================================================================= */}
                    {/* POPUP 1: GHI CHÚ (Không 24h, không icon có sẵn)                    */}
                    {/* ================================================================= */}
                    {isEditingNote && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setIsEditingNote(false)}
      {/* ============================================================= */}
      {/* POPUP 1: GHI CHÚ (NOTE BUBBLE)                                */}
      {/* ============================================================= */}
      <Modal visible={isEditingNote} transparent animationType="fade" onRequestClose={() => setIsEditingNote(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.cleanModalOverlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdropCenter}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setIsEditingNote(false)}
              activeOpacity={1}
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
            <View style={styles.cleanModalCard}>
              <View style={styles.cleanModalHeaderRow}>
                <Text style={styles.cleanModalTitle}>Ghi chú</Text>

            <View style={styles.cleanModalActionRow}>
              {ownerNoteBubble ? (
                <TouchableOpacity
                  onPress={() => setIsEditingNote(false)}
                  style={styles.modalCloseBtn}
                  style={styles.cleanDeleteTextBtn}
                  onPress={() => {
                    setOwnerNoteBubble('');
                    setIsEditingNote(false);
                    showToast('Đã xóa ghi chú');
                  }}
                >
                  <Feather name="x" size={18} color="#7E6E60" />
                  <Text style={styles.cleanDeleteTextBtnText}>Xóa ghi chú</Text>
                </TouchableOpacity>
              </View>
              ) : null}

              <Text style={styles.cleanModalSubtitle}>
                Ghi chú ngắn sẽ hiển thị trên avatar của bạn.
              </Text>
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

              <TextInput
                style={styles.cleanTextInputArea}
                placeholder="Nhập suy nghĩ hoặc lời nhắn của bạn..."
                placeholderTextColor="#A89E94"
                value={tempNoteText}
                onChangeText={setTempNoteText}
                maxLength={60}
                multiline
              />
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
                                <Text style={styles.cleanDeleteText}>Xóa ghi chú</Text>
                              </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity style={styles.pickFromDeviceBtn} onPress={handlePickCoverFromDevice} activeOpacity={0.85}>
                              <Feather name="image" size={18} color="#1C1815" />
                              <Text style={styles.pickFromDeviceBtnText}>Tải ảnh từ thư viện thiết bị</Text>
                            </TouchableOpacity>

                            <Text style={styles.presetSectionTitle}>Hoặc chọn ảnh phong cảnh mẫu:</Text>
                            <View style={styles.coverPresetsRow}>
                              {COVER_PRESETS.map((item) => (
                                <TouchableOpacity
                                  style={[styles.cleanSaveBtn, { backgroundColor: theme.primary }]}
                                  key={item.id}
                                  style={styles.coverPresetItem}
                                  onPress={() => {
                                    setOwnerNoteBubble(tempNoteText.trim());
                                    setIsEditingNote(false);
                                    showToast('Đã lưu ghi chú');
                                    setOwnerCoverUrl(item.url);
                                    setIsChangingCoverModal(false);
                                    showToast(`Đã chọn ảnh bìa: ${item.name}`);
                                  }}
                                  activeOpacity={0.85}
                                >
                                  <Text style={styles.cleanSaveBtnText}>Lưu ghi chú</Text>
                                  <Image source={{ uri: item.url }} style={styles.coverPresetThumb} />
                                  <Text style={styles.coverPresetName} numberOfLines={1}>{item.name}</Text>
                                </TouchableOpacity>
              </View>
              ))}
                          </View>
                        </KeyboardAvoidingView>
                    </Modal>
      )}
                  </View>
                </View>
              </Modal>

              {/* ================================================================= */}
              {/* POPUP 2: CHỈNH SỬA HỒ SƠ CON SEN ĐẦY ĐỦ THÔNG TIN (Hình 1)          */}
              {/* ================================================================= */}
              {isEditingOwnerProfile && (
                <Modal
                  visible={true}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setIsEditingOwnerProfile(false)}
                >
                  <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.sheetBackdrop}
                  >
                    <TouchableOpacity
                      style={StyleSheet.absoluteFillObject}
                      onPress={() => setIsEditingOwnerProfile(false)}
                      activeOpacity={1}
                    />
                    <View style={styles.bottomSheetCard}>
                      <View style={styles.sheetHeaderRow}>
                        <Text style={styles.sheetHeaderTitle}>Chỉnh sửa Hồ sơ Con sen</Text>
                        <TouchableOpacity
                          onPress={() => setIsEditingOwnerProfile(false)}
                          style={styles.modalCloseBtn}
                        >
                          <Feather name="x" size={18} color="#7E6E60" />
                        </TouchableOpacity>
                      </View>
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

                            <ScrollView
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={{ paddingBottom: 30 }}
                            >
                              {/* 1. Họ và tên */}
                              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                                {/* Họ và tên */}
                                <View style={styles.fieldBlock}>
                                  <Text style={styles.fieldLabel}>Họ và tên của bạn</Text>
                                  <TextInput
                                    style={styles.fieldInput}
                                    value={ownerDraftName}
                                    onChangeText={setOwnerDraftName}
                                    placeholder="Nhập họ và tên..."
                                    placeholder="Nhập tên của bạn"
                                    placeholderTextColor="#A89E94"
                                  />
                                </View>

                                {/* 2. Giới tính & Tùy chọn Ẩn/Hiện */}
                                <View style={styles.fieldLabelWithToggleRow}>
                                  {/* Giới tính & Tuổi (Dùng Selector) */}
                                  <View style={styles.fieldsTwoColRow}>
                                    <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                                      <Text style={styles.fieldLabel}>Giới tính</Text>
                                      <TouchableOpacity
                                        style={styles.privacyToggleBtn}
                                        onPress={() =>
                                          setOwnerDraftPrivacy((p) => ({ ...p, gender: !p.gender }))
                                        }
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
                                        <Text
                                          style={[
                                            styles.privacyToggleText,
                                            ownerDraftPrivacy.gender && styles.privacyToggleTextActive,
                                          ]}
                                        >
                                          {ownerDraftPrivacy.gender ? '👁 Công khai' : '🔒 Đang ẩn'}
                                        </Text>
                                        <Text style={styles.pickerSelectorBtnText}>{ownerDraftGender || 'Chọn'}</Text>
                                        <Feather name="chevron-down" size={14} color="#7E6E60" />
                                      </TouchableOpacity>
                                    </View>
                                    <View style={styles.genderToggleRow}>
                                      {['Nữ', 'Nam', 'Khác'].map((g) => (
                                        <TouchableOpacity
                                          key={g}
                                          style={[
                                            styles.genderHalfBtn,
                                            ownerDraftGender === g && styles.genderHalfBtnActive,
                                          ]}
                                          onPress={() => setOwnerDraftGender(g)}
                                        >
                                          <Text
                                            style={[
                                              styles.genderHalfText,
                                              ownerDraftGender === g && styles.genderHalfTextActive,
                                            ]}
                                          >
                                            {g}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>

                                    {/* 3. Địa chỉ / Khu vực */}
                                    <View style={styles.fieldLabelWithToggleRow}>
                                      <Text style={styles.fieldLabel}>Khu vực sinh sống</Text>
                                      <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.fieldLabel}>Độ tuổi</Text>
                                        <TouchableOpacity
                                          style={styles.privacyToggleBtn}
                                          onPress={() =>
                                            setOwnerDraftPrivacy((p) => ({ ...p, area: !p.area }))
                                          }
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
                                          <Text
                                            style={[
                                              styles.privacyToggleText,
                                              ownerDraftPrivacy.area && styles.privacyToggleTextActive,
                                            ]}
                                          >
                                            {ownerDraftPrivacy.area ? '👁 Công khai' : '🔒 Đang ẩn'}
                                          </Text>
                                          <Text style={styles.pickerSelectorBtnText}>{ownerDraftAge} tuổi</Text>
                                          <Feather name="chevron-down" size={14} color="#7E6E60" />
                                        </TouchableOpacity>
                                      </View>
                                      <TextInput
                                        style={styles.fieldInput}
                                        value={ownerDraftArea}
                                        onChangeText={setOwnerDraftArea}
                                        placeholder="VD: Vinhomes Grand Park, TP. Thủ Đức"
                                        placeholderTextColor="#A89E94"
                                      />
                                    </View>

                                    {/* 4. Tuổi & Ngày sinh */}
                                    <View style={styles.twoInputsRow}>
                                      <View style={{ flex: 1 }}>
                                        <View style={styles.fieldLabelWithToggleRow}>
                                          <Text style={styles.fieldLabel}>Tuổi</Text>
                                          <TouchableOpacity
                                            style={styles.privacyToggleBtn}
                                            onPress={() =>
                                              setOwnerDraftPrivacy((p) => ({ ...p, age: !p.age }))
                                            }
                                          >
                                            <Text
                                              style={[
                                                styles.privacyToggleText,
                                                ownerDraftPrivacy.age && styles.privacyToggleTextActive,
                                              ]}
                                            >
                                              {ownerDraftPrivacy.age ? '👁' : '🔒'}
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                        <TextInput
                                          style={styles.fieldInput}
                                          keyboardType="numeric"
                                          value={ownerDraftAge}
                                          onChangeText={setOwnerDraftAge}
                                          placeholder="24"
                                          placeholderTextColor="#A89E94"
                                        />
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

                                      <View style={{ flex: 1 }}>
                                        <View style={styles.fieldLabelWithToggleRow}>
                                          <Text style={styles.fieldLabel}>Ngày sinh</Text>
                                          <TouchableOpacity
                                            style={styles.privacyToggleBtn}
                                            onPress={() =>
                                              setOwnerDraftPrivacy((p) => ({ ...p, birthDate: !p.birthDate }))
                                            }
                                          >
                                            <Text
                                              style={[
                                                styles.privacyToggleText,
                                                ownerDraftPrivacy.birthDate && styles.privacyToggleTextActive,
                                              ]}
                                            >
                                              {ownerDraftPrivacy.birthDate ? '👁' : '🔒'}
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                        <TextInput
                                          style={styles.fieldInput}
                                          value={ownerDraftBirthDate}
                                          onChangeText={setOwnerDraftBirthDate}
                                          placeholder="15/03/2000"
                                          placeholderTextColor="#A89E94"
                                        />
                                      </View>
                                    </View>

                                    {/* 5. Cung hoàng đạo */}
                                    <View style={styles.fieldLabelWithToggleRow}>
                                      {/* Cung hoàng đạo & MBTI (Dùng Selector) */}
                                      <View style={styles.fieldsTwoColRow}>
                                        <View style={[styles.fieldBlock, { flex: 1, marginRight: 8 }]}>
                                          <Text style={styles.fieldLabel}>Cung hoàng đạo</Text>
                                          <TouchableOpacity
                                            style={styles.privacyToggleBtn}
                                            onPress={() =>
                                              setOwnerDraftPrivacy((p) => ({ ...p, zodiac: !p.zodiac }))
                                            }
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
                                            <Text
                                              style={[
                                                styles.privacyToggleText,
                                                ownerDraftPrivacy.zodiac && styles.privacyToggleTextActive,
                                              ]}
                                            >
                                              {ownerDraftPrivacy.zodiac ? '👁 Công khai' : '🔒 Đang ẩn'}
                                            </Text>
                                            <Text style={styles.pickerSelectorBtnText}>{ownerDraftZodiac || 'Chọn'}</Text>
                                            <Feather name="chevron-down" size={14} color="#7E6E60" />
                                          </TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                                          <View style={{ flexDirection: 'row', gap: 6 }}>
                                            {ZODIAC_LIST.map((z) => (
                                              <TouchableOpacity
                                                key={z}
                                                style={[
                                                  styles.choiceChip,
                                                  ownerDraftZodiac === z && { backgroundColor: theme.primary, borderColor: theme.primary },
                                                ]}
                                                onPress={() => setOwnerDraftZodiac(z)}
                                              >
                                                <Text
                                                  style={[
                                                    styles.choiceChipText,
                                                    ownerDraftZodiac === z && { color: '#FFFFFF' },
                                                  ]}
                                                >
                                                  {z}
                                                </Text>
                                              </TouchableOpacity>
                                            ))}
                                          </View>
                                        </ScrollView>

                                        {/* 6. MBTI */}
                                        <View style={styles.fieldLabelWithToggleRow}>
                                          <Text style={styles.fieldLabel}>Nhóm tính cách MBTI</Text>
                                          <View style={[styles.fieldBlock, { flex: 1, marginLeft: 8 }]}>
                                            <Text style={styles.fieldLabel}>MBTI</Text>
                                            <TouchableOpacity
                                              style={styles.privacyToggleBtn}
                                              onPress={() =>
                                                setOwnerDraftPrivacy((p) => ({ ...p, mbti: !p.mbti }))
                                              }
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
                                              <Text
                                                style={[
                                                  styles.privacyToggleText,
                                                  ownerDraftPrivacy.mbti && styles.privacyToggleTextActive,
                                                ]}
                                              >
                                                {ownerDraftPrivacy.mbti ? '👁 Công khai' : '🔒 Đang ẩn'}
                                              </Text>
                                              <Text style={styles.pickerSelectorBtnText}>{ownerDraftMbti || 'Chọn'}</Text>
                                              <Feather name="chevron-down" size={14} color="#7E6E60" />
                                            </TouchableOpacity>
                                          </View>
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                              {MBTI_LIST.map((m) => (
                                                <TouchableOpacity
                                                  key={m}
                                                  style={[
                                                    styles.choiceChip,
                                                    ownerDraftMbti === m && { backgroundColor: theme.primary, borderColor: theme.primary },
                                                  ]}
                                                  onPress={() => setOwnerDraftMbti(m)}
                                                >
                                                  <Text
                                                    style={[
                                                      styles.choiceChipText,
                                                      ownerDraftMbti === m && { color: '#FFFFFF' },
                                                    ]}
                                                  >
                                                    {m}
                                                  </Text>
                                                </TouchableOpacity>
                                              ))}
                                            </View>
                                          </ScrollView>
                                        </View>

                                        {/* 7. Học vấn (Tốt nghiệp ở đâu & Học ngành gì) */}
                                        <View style={styles.fieldLabelWithToggleRow}>
                                          <Text style={styles.fieldLabel}>Học vấn & Trường tốt nghiệp</Text>
                                          <TouchableOpacity
                                            style={styles.privacyToggleBtn}
                                            onPress={() =>
                                              setOwnerDraftPrivacy((p) => ({ ...p, education: !p.education }))
                                            }
                                          >
                                            <Text
                                              style={[
                                                styles.privacyToggleText,
                                                ownerDraftPrivacy.education && styles.privacyToggleTextActive,
                                              ]}
                                            >
                                              {ownerDraftPrivacy.education ? '👁 Công khai' : '🔒 Đang ẩn'}
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                        {/* Khu vực sinh sống */}
                                        <View style={styles.fieldBlock}>
                                          <Text style={styles.fieldLabel}>Khu vực sinh sống</Text>
                                          <TextInput
                                            style={styles.fieldInput}
                                            value={ownerDraftEducation}
                                            onChangeText={setOwnerDraftEducation}
                                            placeholder="VD: ĐH Kiến Trúc TP.HCM"
                                            value={ownerDraftArea}
                                            onChangeText={setOwnerDraftArea}
                                            placeholder="VD: Vinhomes Grand Park, TP. Thủ Đức"
                                            placeholderTextColor="#A89E94"
                                          />
                                        </View>

                                        <Text style={styles.fieldLabel}>Chuyên ngành học</Text>
                                        {/* Nghề nghiệp */}
                                        <View style={styles.fieldBlock}>
                                          <Text style={styles.fieldLabel}>Nghề nghiệp hiện tại</Text>
                                          <TextInput
                                            style={styles.fieldInput}
                                            value={ownerDraftMajor}
                                            onChangeText={setOwnerDraftMajor}
                                            placeholder="VD: Thiết kế Đồ họa"
                                            value={ownerDraftOccupation}
                                            onChangeText={setOwnerDraftOccupation}
                                            placeholder="VD: UI/UX Designer"
                                            placeholderTextColor="#A89E94"
                                          />
                                        </View>

                                        {/* 8. Nghề nghiệp hiện tại */}
                                        <View style={styles.fieldLabelWithToggleRow}>
                                          <Text style={styles.fieldLabel}>Đang làm gì (Nghề nghiệp)</Text>
                                          <TouchableOpacity
                                            style={styles.privacyToggleBtn}
                                            onPress={() =>
                                              setOwnerDraftPrivacy((p) => ({ ...p, occupation: !p.occupation }))
                                            }
                                          >
                                            <Text
                                              style={[
                                                styles.privacyToggleText,
                                                ownerDraftPrivacy.occupation && styles.privacyToggleTextActive,
                                              ]}
                                            >
                                              {ownerDraftPrivacy.occupation ? '👁 Công khai' : '🔒 Đang ẩn'}
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                        {/* Học vấn / Trường học */}
                                        <View style={styles.fieldBlock}>
                                          <Text style={styles.fieldLabel}>Học vấn / Trường tốt nghiệp</Text>
                                          <TextInput
                                            style={styles.fieldInput}
                                            value={ownerDraftOccupation}
                                            onChangeText={setOwnerDraftOccupation}
                                            placeholder="VD: UI/UX Designer"
                                            value={ownerDraftEducation}
                                            onChangeText={setOwnerDraftEducation}
                                            placeholder="VD: Đại học Quốc gia TP.HCM"
                                            placeholderTextColor="#A89E94"
                                          />
                                        </View>

                                        {/* 9. Giới thiệu bản thân (Bio) */}
                                        <Text style={styles.fieldLabel}>Giới thiệu bản thân</Text>
                                        {/* Câu giới thiệu bản thân */}
                                        <View style={styles.fieldBlock}>
                                          <Text style={styles.fieldLabel}>Câu giới thiệu bản thân</Text>
                                          <TextInput
                                            style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
                                            multiline
                                            style={[styles.fieldInput, { height: 75, textAlignVertical: 'top' }]}
                                            value={ownerDraftBio}
                                            onChangeText={setOwnerDraftBio}
                                            placeholder="Chia sẻ về sở thích thú cưng của bạn..."
                                            placeholder="Viết đôi dòng về bạn và sở thích nuôi Boss..."
                                            placeholderTextColor="#A89E94"
                                            multiline
                                          />
                                        </View>

                                        <TouchableOpacity
                                          style={[styles.sheetPrimarySubmitBtn, { backgroundColor: theme.primary }]}
                                          onPress={handleSaveOwnerProfile}
                                          activeOpacity={0.85}
                                        >
                                          <Text style={styles.sheetPrimarySubmitBtnText}>Lưu Hồ sơ Con sen</Text>
                                        </TouchableOpacity>
                                      </ScrollView>
                                    </View>
                                  </KeyboardAvoidingView>
                                </Modal>
      )}
                                {/* Quyền riêng tư: Bật/Tắt công khai */}
                                <View style={styles.privacySectionBox}>
                                  <Text style={styles.privacySectionTitle}>Quyền riêng tư hồ sơ</Text>
                                  <Text style={styles.privacySectionDesc}>
                                    Chọn thông tin bạn muốn hiển thị công khai trên trang cá nhân:
                                  </Text>

                                  {/* ================================================================= */}
                                  {/* POPUP 3: MODAL THÊM BÉ CƯNG MỚI ĐẦY ĐỦ THÔNG TIN & SỨC KHỎE (Hình 3) */}
                                  {/* ================================================================= */}
                                  {isAddingPetModal && (
                                    <Modal
                                      visible={true}
                                      transparent
                                      animationType="slide"
                                      onRequestClose={() => setIsAddingPetModal(false)}
                                    >
                                      <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                        style={styles.sheetBackdrop}
                                      >
                                        <TouchableOpacity
                                          style={StyleSheet.absoluteFillObject}
                                          onPress={() => setIsAddingPetModal(false)}
                                          activeOpacity={1}
                                        />
                                        <View style={styles.bottomSheetCard}>
                                          <View style={styles.sheetHeaderRow}>
                                            <Text style={styles.sheetHeaderTitle}>Thêm bé cưng mới</Text>
                                            <TouchableOpacity
                                              onPress={() => setIsAddingPetModal(false)}
                                              style={styles.modalCloseBtn}
                                            >
                                              <Feather name="x" size={18} color="#7E6E60" />
                                            </TouchableOpacity>
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

                                        <ScrollView
                                          showsVerticalScrollIndicator={false}
                                          contentContainerStyle={{ paddingBottom: 30 }}
            <View style={styles.modalFooterActions}>
                                          <TouchableOpacity
                                            style={[styles.cleanSubmitBtn, { backgroundColor: theme.primary, width: '100%' }]}
                                            onPress={handleSaveOwnerProfile}
                                          >
                                            {/* Loài: Chó, Mèo, Khác */}
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
                                                style={[
                                                  styles.speciesChoiceBtn,
                                                  newPetSpecies === sp && {
                                                    backgroundColor: theme.primary,
                                                    borderColor: theme.primary,
                                                  },
                                                ]}
                                                style={[styles.speciesChoiceBtn, newPetSpecies === sp && styles.speciesChoiceBtnActive]}
                                                onPress={() => setNewPetSpecies(sp)}
                                              >
                                                <Text
                                                  style={[
                                                    styles.speciesChoiceText,
                                                    newPetSpecies === sp && { color: '#FFFFFF' },
                                                  ]}
                                                >
                                                  {sp === 'Khác' ? 'Loài Khác' : `Loài ${sp}`}
                                                  <Text style={[styles.speciesChoiceText, newPetSpecies === sp && styles.speciesChoiceTextActive]}>
                                                    {sp}
                                                  </Text>
                                              </TouchableOpacity>
                                            ))}
                                          </View>

                                          {newPetSpecies === 'Khác' && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.fieldLabel}>Nhập tên loài cụ thể</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={newPetCustomSpecies}
                      onChangeText={setNewPetCustomSpecies}
                      placeholder="VD: Thỏ, Hamster, Vẹt..."
                      placeholderTextColor="#A89E94"
                    />
                  </View>
                  <TextInput
                    style={[styles.fieldInput, { marginTop: 8 }]}
                    placeholder="Nhập loài thú cưng (VD: Hamster, Thỏ...)"
                    placeholderTextColor="#A89E94"
                    value={newPetCustomSpecies}
                    onChangeText={setNewPetCustomSpecies}
                  />
                                          )}
                                        </View>

                                        {/* Tên & Giới tính */}
                                        <View style={styles.twoInputsRow}>
                                          <View style={{ flex: 1 }}>
                                            <Text style={styles.fieldLabel}>Tên bé</Text>
                                            <TextInput
                                              style={styles.fieldInput}
                                              placeholder="VD: Coca, Bơ"
                                              placeholderTextColor="#A89E94"
                                              value={newPetName}
                                              onChangeText={setNewPetName}
                                            />
                                          </View>
                                          <View style={{ width: 120 }}>
                                            <Text style={styles.fieldLabel}>Giới tính</Text>
                                            <View style={styles.genderToggleRow}>
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
                        style={[
                          styles.genderHalfBtn,
                          newPetGender === 'Đực' && styles.genderHalfBtnActive,
                        ]}
                        onPress={() => setNewPetGender('Đực')}
                        key={g}
                        style={[styles.genderChoiceBtn, newPetGender === g && styles.genderChoiceBtnActive]}
                        onPress={() => setNewPetGender(g)}
                      >
                        <Text
                          style={[
                            styles.genderHalfText,
                            newPetGender === 'Đực' && styles.genderHalfTextActive,
                          ]}
                        >
                          Đực
                        <Text style={[styles.genderChoiceText, newPetGender === g && styles.genderChoiceTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderHalfBtn,
                          newPetGender === 'Cái' && styles.genderHalfBtnActive,
                        ]}
                        onPress={() => setNewPetGender('Cái')}
                      >
                        <Text
                          style={[
                            styles.genderHalfText,
                            newPetGender === 'Cái' && styles.genderHalfTextActive,
                          ]}
                        >
                          Cái
                        </Text>
                      </TouchableOpacity>
                    </View>
                    ))}
                                                </View>
                                              </View>
                                            </View>

                                            {/* Giống loài & Cân nặng */}
                                            <View style={styles.twoInputsRow}>
                                              <View style={{ flex: 1 }}>
                                                <Text style={styles.fieldLabel}>Giống loài</Text>
                                                <TextInput
                                                  style={styles.fieldInput}
                                                  placeholder="VD: Poodle, Corgi"
                                                  placeholderTextColor="#A89E94"
                                                  value={newPetBreed}
                                                  onChangeText={setNewPetBreed}
                                                />
                                              </View>
                                              <View style={{ width: 120 }}>
                                                <Text style={styles.fieldLabel}>Cân nặng (kg)</Text>
                                                <TextInput
                                                  style={styles.fieldInput}
                                                  placeholder="5.0"
                                                  placeholderTextColor="#A89E94"
                                                  keyboardType="decimal-pad"
                                                  value={newPetWeight}
                                                  onChangeText={setNewPetWeight}
                                                />
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

                                                {/* Tuổi & Ngày sinh */}
                                                <View style={styles.twoInputsRow}>
                                                  <View style={{ flex: 1 }}>
                                                    <Text style={styles.fieldLabel}>Độ tuổi</Text>
                                                    <TextInput
                                                      style={styles.fieldInput}
                                                      placeholder="VD: 1 tuổi"
                                                      placeholderTextColor="#A89E94"
                                                      value={newPetAge}
                                                      onChangeText={setNewPetAge}
                                                    />
                                                  </View>
                                                  <View style={{ flex: 1 }}>
                                                    <Text style={styles.fieldLabel}>Ngày sinh</Text>
                                                    <TextInput
                                                      style={styles.fieldInput}
                                                      placeholder="01/06/2024"
                                                      placeholderTextColor="#A89E94"
                                                      value={newPetBirthDate}
                                                      onChangeText={setNewPetBirthDate}
                                                    />
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

                                                {/* SỨC KHỎE CHI TIẾT 1: Theo dõi cân nặng theo tháng */}
                                                <View style={styles.modalSubSectionBox}>
                                                  <Text style={styles.modalSubSectionTitle}>
                                                    📊 Theo dõi cân nặng theo từng tháng:
                                                  </Text>
                                                  <View style={styles.weightRecordsMiniList}>
                                                    {newPetWeightHistory.map((item, idx) => (
                                                      <View key={idx} style={styles.weightRecordPill}>
                                                        <Text style={styles.weightRecordPillText}>
                                                          {item.month}: {item.weightKg}kg
                                                        </Text>
                                                      </View>
                                                    ))}
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

                                                    {/* Mô tả tính cách */}
                                                    <View style={styles.fieldBlock}>
                                                      <Text style={styles.fieldLabel}>Mô tả tính cách & Lưu ý</Text>
                                                      <TextInput
                                                        style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                                                        placeholder="Bé hiền lành, thích chạy nhảy, hơi sợ tiếng sấm..."
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

                                                      <View style={styles.addMiniRow}>
                                                        <TextInput
                                                          style={[styles.fieldInput, { width: 70, height: 36, paddingVertical: 6 }]}
                                                          placeholder="Tháng (T11)"
                                                          placeholderTextColor="#A89E94"
                                                          value={tempWeightMonth}
                                                          onChangeText={setTempWeightMonth}
                                                        />
                                                        <TextInput
                                                          style={[styles.fieldInput, { width: 80, height: 36, paddingVertical: 6 }]}
                                                          placeholder="Số kg"
                                                          placeholderTextColor="#A89E94"
                                                          keyboardType="decimal-pad"
                                                          value={tempWeightKg}
                                                          onChangeText={setTempWeightKg}
                                                        />
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
                                                              style={styles.addMiniBtn}
                                                              onPress={() => handleAddWeightToDraft(true)}
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
                                                              <Text style={styles.addMiniBtnText}>+ Thêm mốc</Text>
                                                              <Text style={styles.pickerSelectorBtnText}>{tempVacDate || 'Ngày tiêm'}</Text>
                                                              <Feather name="calendar" size={12} color="#7E6E60" />
                                                            </TouchableOpacity>
                                                          </View>
                                                        </View>

                                                        {/* SỨC KHỎE CHI TIẾT 2: Sổ tiêm chủng chi tiết */}
                                                        <View style={styles.modalSubSectionBox}>
                                                          <Text style={styles.modalSubSectionTitle}>
                                                            💉 Chi tiết mũi tiêm chủng:
                                                          </Text>
                                                          {newPetVaccineRecords.map((vac) => (
                                                            <View key={vac.id} style={styles.miniVacItem}>
                                                              <Text style={styles.miniVacTitle}>
                                                                {vac.vaccineName} (Mũi {vac.doseNumber})
                                                              </Text>
                                                              <Text style={styles.miniVacSub}>
                                                                Ngày tiêm: {vac.date} · Cơ sở: {vac.clinic}
                                                              </Text>
                                                            </View>
                                                          ))}

                                                          <View style={styles.addVacBlock}>
                                                            <TextInput
                                                              style={[styles.fieldInput, { marginBottom: 6 }]}
                                                              placeholder="Tên mũi vắc-xin (VD: Phòng dại)"
                                                              placeholderTextColor="#A89E94"
                                                              value={tempVacName}
                                                              onChangeText={setTempVacName}
                                                            />
                                                            <View style={styles.twoInputsRow}>
                                                              <TextInput
                                                                style={[styles.fieldInput, { flex: 1 }]}
                                                                placeholder="Ngày tiêm (DD/MM/YYYY)"
                                                                placeholderTextColor="#A89E94"
                                                                value={tempVacDate}
                                                                onChangeText={setTempVacDate}
                                                              />
                                                              <TextInput
                                                                style={[styles.fieldInput, { width: 90 }]}
                                                                placeholder="Mũi số (1)"
                                                                placeholderTextColor="#A89E94"
                                                                keyboardType="numeric"
                                                                value={tempVacDose}
                                                                onChangeText={setTempVacDose}
                                                              />
                                                            </View>
                                                            <TextInput
                                                              style={[styles.fieldInput, { marginTop: 6, marginBottom: 8 }]}
                                                              placeholder="Cơ sở / Bệnh viện thú y"
                                                              placeholderTextColor="#A89E94"
                                                              value={tempVacClinic}
                                                              onChangeText={setTempVacClinic}
                                                            />
                                                            <TouchableOpacity
                                                              style={styles.addMiniBtn}
                                                              onPress={() => handleAddVaccineToDraft(true)}
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
                                                              <Text style={styles.addMiniBtnText}>+ Thêm mũi tiêm</Text>
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

                                                    {/* Mô tả tính cách */}
                                                    <Text style={styles.fieldLabel}>Mô tả tính cách & thói quen</Text>
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
                                              {/* POPUP 5: CHỈNH SỬA THÚ CƯNG (CÓ PICKERS & ĐỦ TRƯỜNG THÔNG TIN)*/}
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
                                                        <Text style={styles.fieldLabel}>Tên của bé *</Text>
                                                        <TextInput
                                                          style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                                                          multiline
                                                          placeholder="Thân thiện, ham ăn, quấn người..."
                                                          style={styles.fieldInput}
                                                          value={editPetNameDraft}
                                                          onChangeText={setEditPetNameDraft}
                                                          placeholder="Tên bé"
                                                          placeholderTextColor="#A89E94"
                                                          value={newPetBio}
                                                          onChangeText={setNewPetBio}
                                                        />

                                                        <TouchableOpacity
                                                          style={[styles.sheetPrimarySubmitBtn, { backgroundColor: theme.primary }]}
                                                          onPress={handleSaveNewPetModal}
                                                          activeOpacity={0.85}
                                                        >
                                                          <Text style={styles.sheetPrimarySubmitBtnText}>Thêm bé vào Hồ sơ</Text>
                                                        </TouchableOpacity>
                                                    </ScrollView>
                                                  </View>
                                                </KeyboardAvoidingView>
                                              </Modal>
      )}

                                              {/* ================================================================= */}
                                              {/* POPUP 4: CHỈNH SỬA THÚ CƯNG ĐẦY ĐỦ THÔNG TIN & SỨC KHỎE (Hình 5)   */}
                                              {/* ================================================================= */}
                                              {editingPet && (
                                                <Modal
                                                  visible={true}
                                                  transparent
                                                  animationType="slide"
                                                  onRequestClose={() => setEditingPet(null)}
                                                >
                                                  <KeyboardAvoidingView
                                                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                                    style={styles.sheetBackdrop}
                                                  >
                                                    <TouchableOpacity
                                                      style={StyleSheet.absoluteFillObject}
                                                      onPress={() => setEditingPet(null)}
                                                      activeOpacity={1}
                                                    />
                                                    <View style={styles.bottomSheetCard}>
                                                      <View style={styles.sheetHeaderRow}>
                                                        <Text style={styles.sheetHeaderTitle}>
                                                          Chỉnh sửa Thú cưng: {editingPet.name}
                                                        </Text>
                                                        <TouchableOpacity
                                                          onPress={() => setEditingPet(null)}
                                                          style={styles.modalCloseBtn}
                                                        >
                                                          <Feather name="x" size={18} color="#7E6E60" />
                                                        </TouchableOpacity>
                                                      </View>

                                                      <ScrollView
                                                        showsVerticalScrollIndicator={false}
                                                        contentContainerStyle={{ paddingBottom: 30 }}
                                                      >
                                                        {/* Loài */}
                                                        {/* Giống loài */}
                                                        <View style={styles.fieldBlock}>
                                                          <Text style={styles.fieldLabel}>Loài thú cưng</Text>
                                                          <View style={styles.speciesChoiceRow}>
                                                            {(['Chó', 'Mèo', 'Khác'] as const).map((sp) => (
                                                              <TouchableOpacity
                                                                key={sp}
                                                                style={[
                                                                  styles.speciesChoiceBtn,
                                                                  editPetSpeciesDraft === sp && {
                                                                    backgroundColor: theme.primary,
                                                                    borderColor: theme.primary,
                                                                  },
                                                                ]}
                                                                style={[styles.speciesChoiceBtn, editPetSpeciesDraft === sp && styles.speciesChoiceBtnActive]}
                                                                onPress={() => setEditPetSpeciesDraft(sp)}
                                                              >
                                                                <Text
                                                                  style={[
                                                                    styles.speciesChoiceText,
                                                                    editPetSpeciesDraft === sp && { color: '#FFFFFF' },
                                                                  ]}
                                                                >
                                                                  {sp === 'Khác' ? 'Loài Khác' : `Loài ${sp}`}
                                                                  <Text style={[styles.speciesChoiceText, editPetSpeciesDraft === sp && styles.speciesChoiceTextActive]}>
                                                                    {sp}
                                                                  </Text>
                                                              </TouchableOpacity>
                                                            ))}
                                                          </View>

                                                          {editPetSpeciesDraft === 'Khác' && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.fieldLabel}>Tên loài cụ thể</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={editPetCustomSpeciesDraft}
                      onChangeText={setEditPetCustomSpeciesDraft}
                      placeholder="VD: Thỏ, Hamster, Vẹt..."
                      placeholderTextColor="#A89E94"
                    />
                  </View>
                  <TextInput
                    style={[styles.fieldInput, { marginTop: 8 }]}
                    placeholder="Nhập loài thú cưng"
                    placeholderTextColor="#A89E94"
                    value={editPetCustomSpeciesDraft}
                    onChangeText={setEditPetCustomSpeciesDraft}
                  />
                                                          )}
                                                        </View>

                                                        {/* Tên & Giới tính */}
                                                        <View style={styles.twoInputsRow}>
                                                          <View style={{ flex: 1 }}>
                                                            <Text style={styles.fieldLabel}>Tên bé</Text>
                                                            <TextInput
                                                              style={styles.fieldInput}
                                                              value={editPetNameDraft}
                                                              onChangeText={setEditPetNameDraft}
                                                              placeholder="VD: Lu, Coca"
                                                              placeholderTextColor="#A89E94"
                                                            />
                                                          </View>
                                                          <View style={{ width: 120 }}>
                                                            <Text style={styles.fieldLabel}>Giới tính</Text>
                                                            <View style={styles.genderToggleRow}>
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
                        style={[
                          styles.genderHalfBtn,
                          editPetGenderDraft === 'Đực' && styles.genderHalfBtnActive,
                        ]}
                        onPress={() => setEditPetGenderDraft('Đực')}
                        key={g}
                        style={[styles.genderChoiceBtn, editPetGenderDraft === g && styles.genderChoiceBtnActive]}
                        onPress={() => setEditPetGenderDraft(g)}
                      >
                        <Text
                          style={[
                            styles.genderHalfText,
                            editPetGenderDraft === 'Đực' && styles.genderHalfTextActive,
                          ]}
                        >
                          Đực
                        <Text style={[styles.genderChoiceText, editPetGenderDraft === g && styles.genderChoiceTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderHalfBtn,
                          editPetGenderDraft === 'Cái' && styles.genderHalfBtnActive,
                        ]}
                        onPress={() => setEditPetGenderDraft('Cái')}
                      >
                        <Text
                          style={[
                            styles.genderHalfText,
                            editPetGenderDraft === 'Cái' && styles.genderHalfTextActive,
                          ]}
                        >
                          Cái
                        </Text>
                      </TouchableOpacity>
                    </View>
                    ))}
                                                                </View>
                                                              </View>
                                                            </View>

                                                            {/* Giống loài & Cân nặng */}
                                                            <View style={styles.twoInputsRow}>
                                                              <View style={{ flex: 1 }}>
                                                                <Text style={styles.fieldLabel}>Giống loài</Text>
                                                                <TextInput
                                                                  style={styles.fieldInput}
                                                                  value={editPetBreedDraft}
                                                                  onChangeText={setEditPetBreedDraft}
                                                                  placeholder="VD: Golden Retriever, Poodle"
                                                                  placeholderTextColor="#A89E94"
                                                                />
                                                              </View>
                                                              <View style={{ width: 120 }}>
                                                                <Text style={styles.fieldLabel}>Cân nặng (kg)</Text>
                                                                <TextInput
                                                                  style={styles.fieldInput}
                                                                  keyboardType="decimal-pad"
                                                                  value={editPetWeightDraft}
                                                                  onChangeText={setEditPetWeightDraft}
                                                                  placeholder="28.4"
                                                                  placeholderTextColor="#A89E94"
                                                                />
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

                                                                {/* Tuổi & Ngày sinh */}
                                                                <View style={styles.twoInputsRow}>
                                                                  <View style={{ flex: 1 }}>
                                                                    <Text style={styles.fieldLabel}>Độ tuổi</Text>
                                                                    <TextInput
                                                                      style={styles.fieldInput}
                                                                      value={editPetAgeDraft}
                                                                      onChangeText={setEditPetAgeDraft}
                                                                      placeholder="VD: 2 tuổi"
                                                                      placeholderTextColor="#A89E94"
                                                                    />
                                                                  </View>
                                                                  <View style={{ flex: 1 }}>
                                                                    <Text style={styles.fieldLabel}>Ngày sinh</Text>
                                                                    <TextInput
                                                                      style={styles.fieldInput}
                                                                      value={editPetBirthDateDraft}
                                                                      onChangeText={setEditPetBirthDateDraft}
                                                                      placeholder="15/03/2024"
                                                                      placeholderTextColor="#A89E94"
                                                                    />
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

                                                                {/* SỨC KHỎE CHI TIẾT: Cân nặng theo tháng */}
                                                                <View style={styles.modalSubSectionBox}>
                                                                  <Text style={styles.modalSubSectionTitle}>
                                                                    📊 Cập nhật cân nặng theo từng tháng:
                                                                  </Text>
                                                                  <View style={styles.weightRecordsMiniList}>
                                                                    {editPetWeightHistoryDraft.map((item, idx) => (
                                                                      <View key={idx} style={styles.weightRecordPill}>
                                                                        <Text style={styles.weightRecordPillText}>
                                                                          {item.month}: {item.weightKg}kg
                                                                        </Text>
                                                                      </View>
                                                                    ))}
                                                                  </View>
                                                                  <View style={styles.addMiniRow}>
                                                                    <TextInput
                                                                      style={[styles.fieldInput, { width: 70, height: 36, paddingVertical: 6 }]}
                                                                      placeholder="T11"
                                                                      placeholderTextColor="#A89E94"
                                                                      value={tempWeightMonth}
                                                                      onChangeText={setTempWeightMonth}
                                                                    />
                                                                    <TextInput
                                                                      style={[styles.fieldInput, { width: 80, height: 36, paddingVertical: 6 }]}
                                                                      placeholder="kg"
                                                                      placeholderTextColor="#A89E94"
                                                                      keyboardType="decimal-pad"
                                                                      value={tempWeightKg}
                                                                      onChangeText={setTempWeightKg}
                                                                    />
                                                                    <TouchableOpacity
                                                                      style={styles.addMiniBtn}
                                                                      onPress={() => handleAddWeightToDraft(false)}
                                                                    >
                                                                      <Text style={styles.addMiniBtnText}>+ Thêm mốc</Text>
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

                                                                {/* SỨC KHỎE CHI TIẾT: Sổ tiêm chủng chi tiết */}
                                                                <View style={styles.modalSubSectionBox}>
                                                                  <Text style={styles.modalSubSectionTitle}>
                                                                    💉 Chi tiết các mũi tiêm phòng:
                                                                  </Text>
                                                                  {editPetVaccineRecordsDraft.map((vac) => (
                                                                    <View key={vac.id} style={styles.miniVacItem}>
                                                                      <Text style={styles.miniVacTitle}>
                                                                        {vac.vaccineName} (Mũi {vac.doseNumber})
                                                                      </Text>
                                                                      <Text style={styles.miniVacSub}>
                                                                        Ngày tiêm: {vac.date} · {vac.clinic}
                                                                      </Text>
                                                                    </View>
                                                                  ))}
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

                                                                  <View style={styles.addVacBlock}>
                                                                    <TextInput
                                                                      style={[styles.fieldInput, { marginBottom: 6 }]}
                                                                      placeholder="Tên mũi vắc-xin"
                                                                      placeholderTextColor="#A89E94"
                                                                      value={tempVacName}
                                                                      onChangeText={setTempVacName}
                                                                    />
                                                                    <View style={styles.twoInputsRow}>
                                                                      <TextInput
                                                                        style={[styles.fieldInput, { flex: 1 }]}
                                                                        placeholder="Ngày tiêm (DD/MM/YYYY)"
                                                                        placeholderTextColor="#A89E94"
                                                                        value={tempVacDate}
                                                                        onChangeText={setTempVacDate}
                                                                      />
                                                                      <TextInput
                                                                        style={[styles.fieldInput, { width: 90 }]}
                                                                        placeholder="Mũi số (1)"
                                                                        placeholderTextColor="#A89E94"
                                                                        keyboardType="numeric"
                                                                        value={tempVacDose}
                                                                        onChangeText={setTempVacDose}
                                                                      />
                                                                    </View>
                                                                    <TextInput
                                                                      style={[styles.fieldInput, { marginTop: 6, marginBottom: 8 }]}
                                                                      placeholder="Cơ sở y tế thú y"
                                                                      placeholderTextColor="#A89E94"
                                                                      value={tempVacClinic}
                                                                      onChangeText={setTempVacClinic}
                                                                    />
                                                                    <TouchableOpacity
                                                                      style={styles.addMiniBtn}
                                                                      onPress={() => handleAddVaccineToDraft(false)}
                                                                    >
                                                                      <Text style={styles.addMiniBtnText}>+ Thêm mũi tiêm</Text>
                                                                    </TouchableOpacity>
                                                                  </View>
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

                                                                {/* Mô tả */}
                                                                <Text style={styles.fieldLabel}>Mô tả tính cách & thói quen</Text>
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
                                                                  <Text style={styles.fieldLabel}>Mô tả tính cách & Lưu ý</Text>
                                                                  <TextInput
                                                                    style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                                                                    multiline
                                                                    value={editPetBioDraft}
                                                                    onChangeText={setEditPetBioDraft}
                                                                    placeholder="Thân thiện, mê chạy bộ công viên..."
                                                                    placeholderTextColor="#A89E94"
                                                                    multiline
                                                                  />
                                                                </View>

                                                                {/* Xóa hồ sơ thú cưng */}
                                                                {pets.length > 1 && (
                                                                  {/* Bảng cân nặng theo tháng */ }
                                                                  < View style={styles.innerSectionBox}>
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
                                                                    style={styles.deletePetInModalBtn}
                                                                    onPress={handleDeletePetFromEdit}
                                                                    activeOpacity={0.8}
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
                                                                    <Feather name="trash-2" size={15} color="#C93B2B" />
                                                                    <Text style={styles.deletePetInModalText}>
                                                                      Xóa hồ sơ bé {editingPet.name}
                                                                    </Text>
                                                                    <Text style={styles.pickerSelectorBtnText}>{tempWeightMonth || 'Tháng'}</Text>
                                                                    <Feather name="chevron-down" size={12} color="#7E6E60" />
                                                                  </TouchableOpacity>
                )}

                                                                  <TouchableOpacity
                                                                    style={[styles.sheetPrimarySubmitBtn, { backgroundColor: theme.primary }]}
                                                                    onPress={handleSavePetEdits}
                                                                    activeOpacity={0.85}
                                                                  >
                                                                    <Text style={styles.sheetPrimarySubmitBtnText}>Lưu Hồ sơ Thú cưng</Text>
                                                                  </TouchableOpacity>
                                                                </ScrollView>
                                                              </View>
                                                            </KeyboardAvoidingView>
                                                          </Modal>
      )}
                                                          <TextInput
                                                            style={[styles.fieldInput, { flex: 1, height: 38, marginHorizontal: 8 }]}
                                                            placeholder="Số kg (5.2)"
                                                            placeholderTextColor="#A89E94"
                                                            keyboardType="numeric"
                                                            value={tempWeightKg}
                                                            onChangeText={setTempWeightKg}
                                                          />

                                                          {/* ================================================================= */}
                                                          {/* POPUP 5: MODAL ĐỔI ẢNH BÌA COVER (Hoạt động ổn định)               */}
                                                          {/* ================================================================= */}
                                                          {isChangingCoverModal && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setIsChangingCoverModal(false)}
        >
          <View style={styles.modalBackdropCenter}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setIsChangingCoverModal(false)}
              activeOpacity={1}
            />
            <View style={styles.cleanModalCard}>
              <View style={styles.cleanModalHeaderRow}>
                <Text style={styles.cleanModalTitle}>Thay đổi ảnh bìa</Text>
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
                  onPress={() => setIsChangingCoverModal(false)}
                  style={styles.modalCloseBtn}
                  style={styles.deletePetFullBtn}
                  onPress={() => handleConfirmDeletePet(editingPet)}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={18} color="#7E6E60" />
                  <Feather name="trash-2" size={16} color="#E15B4C" />
                  <Text style={styles.deletePetFullBtnText}>Xóa hồ sơ bé này khỏi tài khoản</Text>
                </TouchableOpacity>
              </View>
              )}
            </ScrollView>

              <Text style={styles.cleanModalSubtitle}>
                Chọn ảnh bìa từ thư viện máy hoặc chọn phong cảnh bên dưới:
              </Text>

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={[styles.pickGalleryBtn, { backgroundColor: theme.primarySoft }]}
                onPress={handlePickCoverFromDevice}
                activeOpacity={0.85}
                style={[styles.cleanSubmitBtn, { backgroundColor: theme.primary, width: '100%' }]}
                onPress={handleSavePetEdits}
              >
                <Feather name="image" size={18} color={theme.primary} />
                <Text style={[styles.pickGalleryBtnText, { color: theme.primary }]}>
                  Chọn ảnh từ máy điện thoại
                </Text>
                <Text style={styles.cleanSubmitBtnText}>Lưu Thay đổi Bé cưng</Text>
              </TouchableOpacity>

              <Text style={[styles.fieldLabel, { marginTop: 12, marginBottom: 8 }]}>
                Hoặc chọn ảnh mẫu có sẵn:
              </Text>
              <View style={styles.coverPresetsGrid}>
                {COVER_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.coverPresetThumbItem,
                      ownerCoverUrl === preset.url && styles.coverPresetThumbItemActive,
                    ]}
                    onPress={() => {
                      setOwnerCoverUrl(preset.url);
                      setIsChangingCoverModal(false);
                      showToast(`Đã đổi ảnh bìa: "${preset.name}"`);
                    }}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: preset.url }} style={styles.coverPresetImg} />
                    <Text style={styles.coverPresetTitle} numberOfLines={1}>
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
                                                      </Modal>
      )}
                                                  </KeyboardAvoidingView>
                                                </Modal>

      {/* ================================================================= */}
                                              {/* POPUP 6: POST PREVIEW MODAL (Hình 2: Bỏ audio, caption dưới ảnh,    */}
                                              {/* nút Thích, Xóa khỏi bảng tin, Xem bài viết)                       */}
                                              {/* ================================================================= */}
                                              {selectedPreviewPost && (
                                                <Modal
                                                  visible={true}
                                                  transparent
                                                  animationType="fade"
                                                  onRequestClose={() => setSelectedPreviewPost(null)}
                                                >
                                                  <View style={styles.postPreviewBackdrop}>
                                                    <TouchableOpacity
                                                      style={StyleSheet.absoluteFillObject}
                                                      onPress={() => setSelectedPreviewPost(null)}
                                                      activeOpacity={1}
                                                    />

                                                    <View style={styles.postPreviewCardBox}>
                                                      {/* Header: Chỉ còn @handle & nút Close (Đã loại bỏ hoàn toàn dòng Say You Do) */}
                                                      <View style={styles.postPreviewAuthorHeader}>
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
                                                                    source={{
                                                                      uri: selectedPreviewPost.authorAvatar || ownerAvatarUrl,
                                                                    }}
                                                                    source={{ uri: selectedPreviewPost.authorAvatar || ownerAvatarUrl }}
                                                                    style={styles.postPreviewAvatar}
                                                                  />
                                                                  <View style={styles.postPreviewAuthorTextBox}>
                                                                    <Text style={styles.postPreviewHandleText}>
                                                                      @{selectedPreviewPost.authorHandle.replace('@', '')}
                                                                    </Text>
                                                                    <Text style={styles.postPreviewTimeAgoText}>Vừa xong · Công khai</Text>
                                                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                                                      <Text style={styles.previewAuthorHandle}>{selectedPreviewPost.authorHandle}</Text>
                                                                      <Text style={styles.previewMetaText}>Vừa xong • Công khai</Text>
                                                                    </View>

                                                                    <TouchableOpacity
                                                                      style={styles.postPreviewCloseBtn}
                                                                      onPress={() => setSelectedPreviewPost(null)}
                                                                    >
                                                                      <TouchableOpacity onPress={() => setSelectedPreviewPost(null)} style={styles.previewCloseBtn}>
                                                                        <Feather name="x" size={18} color="#FFFFFF" />
                                                                      </TouchableOpacity>
                                                                  </View>

                                                                  {/* Ảnh bài viết sạch sẽ, không bị text che phủ hình */}
                                                                  <View style={styles.postPreviewImageWrap}>
                                                                    {/* Post Image */}
                                                                    <TouchableOpacity
                                                                      activeOpacity={0.9}
                                                                      onPress={() => {
                                                                        openLightboxMedia(selectedPreviewPost.mediaUrls || []);
                                                                      }}
                                                                    >
                                                                      <Image
                                                                        source={{
                                                                          uri: selectedPreviewPost.mediaUrls?.[0] || ownerAvatarUrl,
                                                                        }}
                                                                        style={styles.postPreviewImage}
                                                                        source={{ uri: selectedPreviewPost.mediaUrls?.[0] || ownerAvatarUrl }}
                                                                        style={styles.previewPostImage}
                                                                        resizeMode="cover"
                                                                      />
                                                                  </View>
                                                                </TouchableOpacity>

                                                                {/* Caption & Lượt thích đặt trang nhã PHÍA DƯỚI ảnh (Không che hình) */}
                                                                <View style={styles.postPreviewBottomCaptionBox}>
                                                                  <View style={styles.postPreviewLikesLine}>
                                                                    {/* Caption hiển thị dưới ảnh, không che ảnh */}
                                                                    <View style={styles.previewCaptionBox}>
                                                                      <View style={styles.previewLikeCountRow}>
                                                                        <Feather name="heart" size={14} color="#FF6F61" />
                                                                        <Text style={styles.postPreviewLikesCountText}>
                                                                          {1200 + (selectedPreviewPost.userReaction ? 1 : 0)} lượt thích
                                                                          <Text style={styles.previewLikeCountText}>
                                                                            {selectedPreviewPost.reactions?.love || 120} lượt thích
                                                                          </Text>
                                                                      </View>
                                                                      <Text style={styles.postPreviewFullCaptionText}>
                                                                        <Text style={styles.previewCaptionText} numberOfLines={3}>
                                                                          {selectedPreviewPost.content}
                                                                        </Text>
                                                                    </View>

                                                                    {/* Action Sheet tinh gọn: Nút Xem bài viết, Thích, Xóa khỏi bảng tin */}
                                                                    <View style={styles.postPreviewActionSheet}>
                                                                      {/* 1. Nút Xem bài viết mở toàn bộ Post Detail */}
                                                                      {/* Actions: "Xem chi tiết bài viết" (Bỏ ngoặc) */}
                                                                      <View style={styles.previewActionsContainer}>
                                                                        <TouchableOpacity
                                                                          style={[styles.previewMenuRowItem, { backgroundColor: '#2C343E' }]}
                                                                          style={styles.previewMainActionBtn}
                                                                          onPress={() => {
                                                                            const target = selectedPreviewPost;
                                                                            setSelectedPreviewPost(null);
                                                                            setActivePostDetail(target);
                                                                          }}
                                                                          activeOpacity={0.7}
                                                                          activeOpacity={0.85}
                                                                        >
                                                                          <Feather name="eye" size={17} color="#A3E4D7" />
                                                                          <Text style={[styles.previewMenuRowText, { color: '#A3E4D7', fontWeight: '800' }]}>
                                                                            Xem chi tiết bài viết (Bình luận & Thả tim)
                                                                          </Text>
                                                                          <Feather name="message-circle" size={16} color="#A3E4D7" />
                                                                          <Text style={styles.postPreviewActionText}>Xem chi tiết bài viết</Text>
                                                                        </TouchableOpacity>

                                                                        {/* 2. Nút Thích bài viết */}
                                                                        <TouchableOpacity
                                                                          style={styles.previewMenuRowItem}
                                                                          onPress={() => handleTogglePostLike(selectedPreviewPost.id)}
                                                                          activeOpacity={0.7}
                                                                          style={styles.previewSecondaryActionBtn}
                                                                          onPress={() => {
                                                                            toggleReaction(selectedPreviewPost.id, 'love');
                                                                            showToast('Đã thả tim bài viết!');
                                                                          }}
                                                                          activeOpacity={0.8}
                                                                        >
                                                                          <Feather
                                                                            name="heart"
                                                                            size={17}
                                                                            color={selectedPreviewPost.userReaction ? '#FF6F61' : '#FFFFFF'}
                                                                          />
                                                                          <Text
                                                                            style={[
                                                                              styles.previewMenuRowText,
                                                                              selectedPreviewPost.userReaction && { color: '#FF6F61' },
                                                                            ]}
                                                                          >
                                                                            {selectedPreviewPost.userReaction ? 'Đã thích' : 'Thích bài viết'}
                                                                          </Text>
                                                                          <Feather name="heart" size={15} color="#FF6F61" />
                                                                          <Text style={styles.previewSecondaryActionText}>Đã thích</Text>
                                                                        </TouchableOpacity>

                                                                        {/* 3. Nút Xóa khỏi bảng tin (Thay cho Gỡ khỏi lưới chính) */}
                                                                        <TouchableOpacity
                                                                          style={[styles.previewMenuRowItem, { borderBottomWidth: 0 }]}
                                                                          onPress={() => handleDeletePostConfirmed(selectedPreviewPost.id)}
                                                                          activeOpacity={0.7}
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
                                                                          <Feather name="trash-2" size={17} color="#FF6F61" />
                                                                          <Text style={[styles.previewMenuRowText, { color: '#FF6F61' }]}>
                                                                            Xóa khỏi bảng tin
                                                                          </Text>
                                                                          <Feather name="trash-2" size={15} color="#E15B4C" />
                                                                          <Text style={styles.previewDangerActionText}>Xóa khỏi bảng tin</Text>
                                                                        </TouchableOpacity>
                                                                      </View>
                                                                    </View>
                                                                  </View>
                                                                </Modal>
      )}
          )}
                                                              </View>
      </Modal>

                                                        {/* ================================================================= */}
                                                        {/* POPUP 7: CHI TIẾT BÀI VIẾT (POST DETAIL) - Bình luận & Thả react   */}
                                                        {/* ================================================================= */}
                                                        {activePostDetail && (
                                                          <Modal
                                                            visible={true}
                                                            transparent
                                                            animationType="slide"
                                                            onRequestClose={() => setActivePostDetail(null)}
                                                          >
                                                            <KeyboardAvoidingView
                                                              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                                              style={styles.sheetBackdrop}
                                                            >
                                                              <TouchableOpacity
                                                                style={StyleSheet.absoluteFillObject}
                                                                onPress={() => setActivePostDetail(null)}
                                                                activeOpacity={1}
                                                              />
                                                              <View style={styles.postDetailSheetCard}>
                                                                {/* Header */}
                                                                <View style={styles.postDetailHeaderRow}>
                                                                  <View style={styles.postDetailAuthorBox}>
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
                                                                                  source={{ uri: activePostDetail.authorAvatar || ownerAvatarUrl }}
                                                                                  style={styles.postDetailAvatar}
                                                                                  source={{ uri: activePostDetail.mediaUrls?.[0] || ownerAvatarUrl }}
                                                                                  style={styles.postDetailImage}
                                                                                  resizeMode="cover"
                                                                                />
                                                                                <View>
                                                                                  <Text style={styles.postDetailAuthorName}>{activePostDetail.authorName}</Text>
                                                                                  <Text style={styles.postDetailAuthorHandle}>{activePostDetail.authorHandle}</Text>
                                                                                </View>
                                                                              </View>
                                                                              <TouchableOpacity
                                                                                onPress={() => setActivePostDetail(null)}
                                                                                style={styles.modalCloseBtn}
                                                                              >
                                                                                <Feather name="x" size={20} color="#1C1815" />
                                                                              </TouchableOpacity>
                                                                            </View>

                                                                          <ScrollView style={styles.postDetailScroll} showsVerticalScrollIndicator={false}>
                                                                            {/* Image */}
                                                                            <Image
                                                                              source={{ uri: activePostDetail.mediaUrls?.[0] || ownerAvatarUrl }}
                                                                              style={styles.postDetailImage}
                                                                              resizeMode="cover"
                                                                            />
                                                                            {/* Caption */}
                                                                            <Text style={styles.postDetailContentText}>{activePostDetail.content}</Text>

                                                                            {/* Content */}
                                                                            <View style={styles.postDetailContentBox}>
                                                                              <Text style={styles.postDetailCaption}>{activePostDetail.content}</Text>
                                                                              <Text style={styles.postDetailTimeText}>{activePostDetail.createdAt} · Chia sẻ công khai</Text>
                                                                            </View>
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

                                                                            {/* Reactions Bar */}
                                                                            <View style={styles.postDetailReactionsBar}>
                                                                              {(['love', 'paws', 'haha', 'wow'] as const).map((rKey) => {
                                                                                const iconName = rKey === 'love' ? '❤️' : rKey === 'paws' ? '🐾' : rKey === 'haha' ? '😂' : '😮';
                                                                                const isSelected = activePostDetail.userReaction === rKey;
                                                                                const count = activePostDetail.reactions[rKey] || 0;
                                                                                return (
                                                                                  <TouchableOpacity
                                                                                    key={rKey}
                                                                                    style={[
                                                                                      styles.reactionButtonPill,
                                                                                      isSelected && styles.reactionButtonPillActive,
                                                                                    ]}
                                                                                    onPress={() => toggleReaction(activePostDetail.id, rKey)}
                                                                                  >
                                                                                    <Text style={styles.reactionEmojiText}>{iconName}</Text>
                                                                                    <Text style={[styles.reactionCountText, isSelected && { color: '#FF6F61', fontWeight: '800' }]}>
                                                                                      {count}
                                                                                    </Text>
                                                                                  </TouchableOpacity>
                                                                                );
                                                                              })}
                                                                            </View>
                                                                            {/* Comments list */}
                                                                            <View style={styles.commentsListBlock}>
                                                                              <Text style={styles.commentsHeaderTitle}>
                                                                                Bình luận ({activePostDetail.comments?.length || 0})
                                                                              </Text>

                                                                              {/* Comments List */}
                                                                              <View style={styles.postDetailCommentsBox}>
                                                                                <Text style={styles.commentsListTitle}>
                                                                                  Bình luận ({activePostDetail.comments.length})
                                                                                </Text>
                                                                                {activePostDetail.comments.map((cmt) => (
                                                                                  <View key={cmt.id} style={styles.commentItemWrap}>
                                                                                    <Image
                                                                                      source={{ uri: cmt.authorAvatar || ownerAvatarUrl }}
                                                                                      style={styles.commentAvatar}
                                                                                    />
                                                                                    <View style={{ flex: 1 }}>
                                                                                      <View style={styles.commentBubble}>
                                                                                        <Text style={styles.commentAuthorName}>{cmt.authorName}</Text>
                                                                                        <Text style={styles.commentContent}>{cmt.content}</Text>
                                                                                      </View>
                                                                                      <View style={styles.commentFooterRow}>
                                                                                        <Text style={styles.commentTimeAgo}>{cmt.createdAt}</Text>
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
                                                                                                style={styles.commentLikeBtn}
                                                                                              >
                                                                                                <Feather
                                                                                                  name="heart"
                                                                                                  size={12}
                                                                                                  color={cmt.isLiked ? '#FF6F61' : '#8E7F73'}
                                                                                                />
                                                                                                <Text
                                                                                                  style={[
                                                                                                    styles.commentLikeText,
                                                                                                    cmt.isLiked && { color: '#FF6F61', fontWeight: '800' },
                                                                                                  ]}
                                                                                                >
                                                                                                  <Feather name="heart" size={12} color={cmt.isLiked ? '#FF6F61' : '#A89E94'} />
                                                                                                  <Text style={[styles.commentLikeCount, cmt.isLiked && { color: '#FF6F61' }]}>
                                                                                                    {cmt.likesCount || 0}
                                                                                                  </Text>
                                                                                              </TouchableOpacity>
                                                                                              <TouchableOpacity
                                                                                                onPress={() => {
                                                                                                  setReplyingCommentId(cmt.id);
                                                                                                  setCommentInputText(`@${cmt.authorHandle.replace('@', '')} `);
                                                                                                }}
                                                                                              >
                                                                                                <Text style={styles.commentReplyActionText}>Trả lời</Text>
                                                                                              </TouchableOpacity>
                                                                                            </View>

                                                                                            {/* Nested Replies */}
                                                                                            {cmt.replies && cmt.replies.length > 0 && (
                                                                                              <View style={styles.nestedRepliesContainer}>
                                                                                                {cmt.replies.map((rep) => (
                                                                                                  <View key={rep.id} style={styles.replyItemWrap}>
                                                                                                    <Image
                                                                                                      source={{ uri: rep.authorAvatar || ownerAvatarUrl }}
                                                                                                      style={styles.replyAvatar}
                                                                                                    />
                                                                                                    <View style={{ flex: 1 }}>
                                                                                                      <View style={styles.commentBubble}>
                                                                                                        <Text style={styles.commentAuthorName}>{rep.authorName}</Text>
                                                                                                        <Text style={styles.commentContent}>{rep.content}</Text>
                                                                                                      </View>
                                                                                                      <Text style={styles.commentTimeAgo}>{rep.createdAt}</Text>
                                                                                                    </View>
                                                                                                  </View>
                                                                                                ))}
                                                                                                {/* Replies */}
                                                                                                {(cmt.replies || []).map((rep) => (
                                                                                                  <View key={rep.id} style={styles.replyRow}>
                                                                                                    <Image source={{ uri: rep.authorAvatar || ownerAvatarUrl }} style={styles.replyAvatar} />
                                                                                                    <View style={styles.replyBubble}>
                                                                                                      <Text style={styles.commentAuthorName}>{rep.authorName}</Text>
                                                                                                      <Text style={styles.commentContentText}>{rep.content}</Text>
                                                                                                    </View>
                                                                                                  </View>
                                                                                                )}
                        ))}
                                                                                              </View>
                    </View>
                                                                                        ))}
                                                                                      </View>
                                                                                    </ScrollView>
                    ))}
                                                                                  </View>
                </ScrollView>

                                                                              {/* Bottom Comment Input */}
                                                                              <View style={styles.commentInputRow}>
                                                                                {replyingCommentId && (
                                                                                  <View style={styles.replyingNoticeBox}>
                                                                                    <Text style={styles.replyingNoticeText}>Đang trả lời bình luận...</Text>
                                                                                    <TouchableOpacity onPress={() => setReplyingCommentId(null)}>
                                                                                      <Feather name="x" size={13} color="#7E6E60" />
                                                                                    </TouchableOpacity>
                                                                                  </View>
                                                                                )}
                                                                                <View style={styles.commentInputContainer}>
                                                                                  {/* Input Bar */}
                                                                                  <View style={styles.commentInputBar}>
                                                                                    <TextInput
                                                                                      style={styles.commentTextInput}
                                                                                      placeholder="Viết bình luận cho bài viết..."
                                                                                      style={styles.commentInput}
                                                                                      placeholder={replyingCommentId ? 'Trả lời bình luận...' : 'Viết bình luận...'}
                                                                                      placeholderTextColor="#A89E94"
                                                                                      value={commentInputText}
                                                                                      onChangeText={setCommentInputText}
                                                                                    />
                                                                                    <TouchableOpacity
                                                                                      style={[styles.sendCommentBtn, { backgroundColor: theme.primary }]}
                                                                                      onPress={handleSendComment}
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
                                                                                      <Feather name="send" size={14} color="#FFFFFF" />
                                                                                      <Feather name="send" size={16} color="#FFFFFF" />
                                                                                    </TouchableOpacity>
                                                                                  </View>
                                                                                </View>
                                                                              </View>
                                                                            </KeyboardAvoidingView>
                                                                          </Modal>
      )}
                                                                        </>
            )}
                                                                      </View>
                                                                    </KeyboardAvoidingView>
                                                                  </Modal>

                                                                  {/* ============================================================= */}
                                                                  {/* 8. UNIVERSAL PICKER MODAL (Dropdown tự chọn)                  */}
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
                                                                  {/* 9. DATE PICKER MODAL (Chọn Ngày/Tháng/Năm dạng cột)           */}
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
                                                                backgroundColor: '#FAF8F5',
                                                                backgroundColor: '#FDFBF7',
  },

                                                                /* TOP HEADER */
                                                                topProfileHeader: {
                                                                  height: 52,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                paddingHorizontal: 14,
                                                                paddingVertical: 10,
                                                                backgroundColor: '#FFFFFF',
                                                                paddingHorizontal: 16,
                                                                backgroundColor: '#FDFBF7',
                                                                borderBottomWidth: 1,
                                                                borderBottomColor: '#EFEBE4',
                                                                minHeight: 52,
                                                                borderBottomColor: '#F0ECE6',
  },
                                                                headerPillsScrollContent: {
                                                                  flexDirection: 'row',
                                                                alignItems: 'center',
                                                                paddingRight: 10,
                                                                gap: 8,
                                                                paddingRight: 8,
  },
                                                                headerPill: {
                                                                  paddingHorizontal: 16,
                                                                paddingVertical: 7,
                                                                borderRadius: 20,
                                                                backgroundColor: '#FAF7F2',
                                                                backgroundColor: '#FFFFFF',
                                                                borderWidth: 1,
                                                                borderColor: '#ECE6DF',
                                                                borderColor: '#E8E2D9',
  },
                                                                headerPillText: {
                                                                  fontSize: 13,
                                                                fontWeight: '700',
                                                                color: '#332B25',
                                                                fontWeight: '600',
                                                                color: '#5A4E47',
  },
                                                                headerPillTextActive: {
                                                                  color: '#FFFFFF',
                                                                fontWeight: '800',
                                                                fontWeight: '700',
  },
                                                                headerAddPill: {
                                                                  headerAddPetPill: {
                                                                  width: 32,
                                                                height: 32,
                                                                borderRadius: 16,
                                                                backgroundColor: '#FFF0EE',
                                                                borderWidth: 1,
                                                                borderColor: '#FFD9D4',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
  },
                                                                headerRightMenuBox: {
                                                                  flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 8,
                                                                paddingLeft: 6,
  },
                                                                vipMiniBadge: {
                                                                  flexDirection: 'row',
                                                                headerHamburgerBtn: {
                                                                  width: 36,
                                                                height: 36,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                gap: 3,
                                                                paddingHorizontal: 7,
                                                                paddingVertical: 3,
                                                                borderRadius: 10,
                                                                marginLeft: 4,
  },
                                                                vipMiniText: {
                                                                  fontSize: 10,
                                                                fontWeight: '900',
  },
                                                                hamburgerBtn: {
                                                                  padding: 6,
  },

                                                                /* HORIZONTAL SCROLL */
                                                                horizontalScroll: {
                                                                  horizontalPagingScroll: {
                                                                  flex: 1,
  },
                                                                pageWrapper: {
                                                                  width: SCREEN_WIDTH,
                                                                flex: 1,
  },

                                                                /* OWNER PROFILE (CON SEN) */
                                                                ownerScroll: {
                                                                  flex: 1,
  },
                                                                ownerScrollContent: {
                                                                  ownerPageScrollContent: {
                                                                  paddingBottom: 40,
  },
                                                                ownerCoverWrap: {

                                                                  /* OWNER COVER & AVATAR */
                                                                  ownerCoverContainer: {
                                                                  height: 160,
                                                                width: '100%',
                                                                height: 160,
                                                                backgroundColor: '#EAE4DC',
                                                                position: 'relative',
                                                                backgroundColor: '#EBE5DC',
  },
                                                                coverTouchArea: {
                                                                  width: '100%',
                                                                height: '100%',
  },
                                                                ownerCoverImg: {
                                                                  width: '100%',
                                                                height: '100%',
  },
                                                                ownerCoverGradient: {
                                                                  position: 'absolute',
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: 50,
                                                                backgroundColor: 'rgba(0,0,0,0.22)',
  },
                                                                changeCoverBtn: {
                                                                  position: 'absolute',
                                                                right: 14,
                                                                bottom: 12,
                                                                right: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 5,
                                                                backgroundColor: 'rgba(28, 24, 21, 0.72)',
                                                                paddingHorizontal: 11,
                                                                paddingVertical: 6,
                                                                borderRadius: 16,
                                                                borderWidth: 1,
                                                                borderColor: 'rgba(255, 255, 255, 0.35)',
                                                                zIndex: 50,
                                                                elevation: 10,
                                                                gap: 6,
                                                                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 5,
                                                                borderRadius: 14,
  },
                                                                changeCoverBtnText: {
                                                                  fontSize: 11,
                                                                fontWeight: '700',
                                                                fontWeight: '600',
                                                                color: '#FFFFFF',
  },

                                                                /* NOTE BUBBLE */
                                                                noteBubbleAnchor: {
                                                                  /* AVATAR ROW: 50% Overlap onto cover */
                                                                  avatarSectionRow: {
                                                                  position: 'relative',
                                                                marginTop: -52,
                                                                alignItems: 'center',
                                                                marginTop: -32,
                                                                marginBottom: 4,
                                                                justifyContent: 'center',
                                                                zIndex: 10,
  },
                                                                noteBubbleAnchor: {
                                                                  marginBottom: 6,
                                                                alignItems: 'center',
  },
                                                                noteBubbleBox: {
                                                                  maxWidth: 240,
                                                                backgroundColor: '#FFFFFF',
                                                                paddingHorizontal: 14,
                                                                paddingVertical: 7,
                                                                paddingVertical: 6,
                                                                borderRadius: 18,
                                                                maxWidth: 220,
                                                                shadowColor: '#000',
                                                                shadowOffset: {width: 0, height: 3 },
                                                                shadowOpacity: 0.12,
                                                                shadowRadius: 6,
                                                                elevation: 4,
                                                                borderWidth: 1,
                                                                borderColor: '#ECE6DF',
                                                                alignItems: 'center',
                                                                shadowOffset: {width: 0, height: 2 },
                                                                shadowOpacity: 0.08,
                                                                shadowRadius: 4,
                                                                elevation: 3,
                                                                position: 'relative',
  },
                                                                noteBubbleText: {
                                                                  fontSize: 12,
                                                                fontWeight: '700',
                                                                color: '#2C2520',
                                                                fontWeight: '600',
                                                                color: '#3A332C',
                                                                textAlign: 'center',
  },
                                                                noteBubbleTail: {
                                                                  position: 'absolute',
                                                                bottom: -6,
                                                                bottom: -5,
                                                                alignSelf: 'center',
                                                                width: 10,
                                                                height: 6,
                                                                height: 10,
                                                                backgroundColor: '#FFFFFF',
                                                                borderBottomLeftRadius: 6,
                                                                borderBottomRightRadius: 6,
                                                                transform: [{rotate: '45deg' }],
  },

                                                                /* AVATAR ROW */
                                                                avatarSectionRow: {
                                                                  flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                paddingHorizontal: 20,
                                                                marginTop: 2,
                                                                marginBottom: 8,
  },
                                                                avatarSideSpacer: {
                                                                  width: 36,
  },
                                                                ownerAvatarWrap: {
                                                                  width: 90,
                                                                height: 90,
                                                                borderRadius: 45,
                                                                borderWidth: 3,
                                                                borderColor: '#FFFFFF',
                                                                shadowColor: '#000',
                                                                shadowOffset: {width: 0, height: 4 },
                                                                shadowOpacity: 0.15,
                                                                shadowRadius: 8,
                                                                elevation: 6,
                                                                width: 104,
                                                                height: 104,
                                                                borderRadius: 52,
                                                                borderWidth: 4,
                                                                borderColor: '#FDFBF7',
                                                                backgroundColor: '#FDFBF7',
                                                                position: 'relative',
                                                                backgroundColor: '#FAF7F2',
  },
                                                                ownerAvatarImg: {
                                                                  width: '100%',
                                                                height: '100%',
                                                                borderRadius: 45,
                                                                width: 96,
                                                                height: 96,
                                                                borderRadius: 48,
  },
                                                                avatarPlusBadge: {
                                                                  position: 'absolute',
                                                                bottom: 2,
                                                                right: 2,
                                                                width: 22,
                                                                height: 22,
                                                                borderRadius: 11,
                                                                width: 26,
                                                                height: 26,
                                                                borderRadius: 13,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                borderWidth: 2,
                                                                borderColor: '#FFFFFF',
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
                                                                avatarSideBtnBox: {
                                                                  sleekEditPenBtn: {
                                                                  position: 'absolute',
                                                                right: 24,
                                                                top: 54,
                                                                width: 36,
                                                                alignItems: 'flex-end',
  },
                                                                sleekEditPenBtn: {
                                                                  width: 34,
                                                                height: 34,
                                                                borderRadius: 17,
                                                                height: 36,
                                                                borderRadius: 18,
                                                                backgroundColor: '#FFFFFF',
                                                                borderWidth: 1,
                                                                borderColor: '#ECE6DF',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                shadowColor: '#000',
                                                                shadowOffset: {width: 0, height: 2 },
                                                                shadowOpacity: 0.08,
                                                                shadowRadius: 4,
                                                                shadowOffset: {width: 0, height: 1 },
                                                                shadowOpacity: 0.1,
                                                                shadowRadius: 3,
                                                                elevation: 2,
  },

                                                                /* OWNER INFO */
                                                                ownerInfoCenterBox: {
                                                                  alignItems: 'center',
                                                                paddingHorizontal: 20,
                                                                marginBottom: 12,
                                                                paddingHorizontal: 24,
                                                                marginTop: 8,
  },
                                                                ownerFullNameText: {
                                                                  fontSize: 20,
                                                                fontWeight: '900',
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
                                                                color: '#7E6E60',
                                                                lineHeight: 18,
                                                                color: '#6B5E59',
                                                                textAlign: 'center',
                                                                marginBottom: 6,
                                                                paddingHorizontal: 10,
                                                                lineHeight: 18,
                                                                marginBottom: 8,
  },
                                                                ownerLocationRow: {
                                                                  flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                marginBottom: 8,
                                                                marginBottom: 10,
  },
                                                                ownerLocationText: {
                                                                  fontSize: 12,
                                                                fontWeight: '600',
                                                                color: '#605448',
                                                                color: '#7E6E60',
  },
                                                                ownerBadgesRow: {
                                                                  flexDirection: 'row',
                                                                flexWrap: 'wrap',
                                                                justifyContent: 'center',
                                                                gap: 6,
                                                                marginTop: 4,
  },
                                                                ownerBadgeChip: {
                                                                  backgroundColor: '#FAF5EE',
                                                                borderWidth: 1,
                                                                borderColor: '#EFE5D8',
                                                                paddingHorizontal: 9,
                                                                paddingVertical: 3,
                                                                backgroundColor: '#F5EFE6',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 5,
                                                                borderRadius: 12,
  },
                                                                ownerBadgeChipText: {
                                                                  fontSize: 11,
                                                                fontWeight: '700',
                                                                color: '#655444',
                                                                fontSize: 12,
                                                                fontWeight: '600',
                                                                color: '#5A4E47',
  },

                                                                /* STATS CARD */
                                                                ownerStatsCard: {
                                                                  flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-around',
                                                                backgroundColor: '#FFFFFF',
                                                                marginHorizontal: 16,
                                                                borderRadius: 20,
                                                                marginTop: 16,
                                                                paddingVertical: 14,
                                                                borderRadius: 16,
                                                                borderWidth: 1,
                                                                borderColor: '#ECE6DF',
                                                                shadowColor: '#000',
                                                                shadowOffset: {width: 0, height: 2 },
                                                                shadowOpacity: 0.05,
                                                                shadowRadius: 6,
                                                                elevation: 2,
                                                                marginBottom: 16,
                                                                borderColor: '#F0ECE6',
                                                                alignItems: 'center',
  },
                                                                statColumn: {
                                                                  flex: 1,
                                                                alignItems: 'center',
                                                                flex: 1,
  },
                                                                statNumberText: {
                                                                  fontSize: 17,
                                                                fontWeight: '900',
                                                                fontSize: 16,
                                                                fontWeight: '800',
                                                                color: '#1C1815',
  },
                                                                statLabelText: {
                                                                  fontSize: 11,
                                                                color: '#8E7F73',
                                                                fontWeight: '600',
                                                                fontWeight: '500',
                                                                color: '#8A7D75',
                                                                marginTop: 2,
  },
                                                                statDividerVertical: {
                                                                  width: 1,
                                                                height: 28,
                                                                backgroundColor: '#F0EBE4',
                                                                height: 24,
                                                                backgroundColor: '#EBE5DC',
  },

                                                                /* MOMENTS */
                                                                momentsHeaderRow: {
                                                                  flexDirection: 'row',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                paddingHorizontal: 16,
                                                                marginBottom: 10,
                                                                marginTop: 20,
                                                                marginBottom: 12,
  },
                                                                momentsSubTabsBox: {
                                                                  flexDirection: 'row',
                                                                gap: 16,
                                                                gap: 12,
  },
                                                                momentTabItem: {
                                                                  paddingVertical: 6,
                                                                position: 'relative',
                                                                momentSubTabBtn: {
                                                                  paddingBottom: 4,
  },
                                                                momentTabItemActive: { },
                                                                momentTabText: {
                                                                  momentSubTabBtnActive: {
                                                                  borderBottomWidth: 2,
                                                                borderBottomColor: '#1C1815',
  },
                                                                momentSubTabText: {
                                                                  fontSize: 14,
                                                                fontWeight: '700',
                                                                color: '#8E7F73',
                                                                fontWeight: '600',
                                                                color: '#8A7D75',
  },
                                                                momentTabTextActive: {
                                                                  momentSubTabTextActive: {
                                                                  color: '#1C1815',
                                                                fontWeight: '900',
                                                                fontWeight: '700',
  },
                                                                momentTabIndicator: {
                                                                  position: 'absolute',
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: 2.5,
                                                                borderRadius: 2,
  },
                                                                createMomentBtn: {
                                                                  addPostQuickBtn: {
                                                                  flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                gap: 5,
                                                                backgroundColor: '#FF6F61',
                                                                paddingHorizontal: 12,
                                                                paddingVertical: 6,
                                                                borderRadius: 16,
                                                                borderRadius: 14,
  },
                                                                createMomentBtnText: {
                                                                  addPostQuickBtnText: {
                                                                  fontSize: 12,
                                                                fontWeight: '800',
                                                                fontWeight: '700',
                                                                color: '#FFFFFF',
  },
                                                                momentsGridBox: {
                                                                  momentsGridContainer: {
                                                                  flexDirection: 'row',
                                                                flexWrap: 'wrap',
                                                                paddingHorizontal: 16,
                                                                gap: 8,
                                                                paddingHorizontal: 16,
  },
                                                                gridThumbItem: {
                                                                  width: MOMENT_GRID_SIZE,
                                                                height: MOMENT_GRID_SIZE,
                                                                borderRadius: 14,
                                                                borderRadius: 12,
                                                                overflow: 'hidden',
                                                                backgroundColor: '#EFEBE4',
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
                                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                                padding: 4,
                                                                borderRadius: 6,
                                                                backgroundColor: 'rgba(0,0,0,0.45)',
                                                                padding: 3,
                                                                borderRadius: 4,
  },
                                                                emptyMomentsBox: {
                                                                  alignItems: 'center',
                                                                justifyContent: 'center',
                                                                paddingVertical: 36,
                                                                gap: 8,

                                                                /* PET FULLSCREEN & SCROLLABLE PAGE */
                                                                petScrollContainer: {
                                                                  width: SCREEN_WIDTH,
                                                                flex: 1,
  },
                                                                emptyMomentsText: {
                                                                  fontSize: 13,
                                                                color: '#8E7F73',
                                                                fontWeight: '600',
                                                                petScrollContent: {
                                                                  paddingBottom: 60,
  },
                                                                emptyPostBtn: {
                                                                  paddingHorizontal: 18,
                                                                paddingVertical: 9,
                                                                borderRadius: 20,
                                                                marginTop: 6,
  },
                                                                emptyPostBtnText: {
                                                                  fontSize: 13,
                                                                fontWeight: '800',
                                                                color: '#FFFFFF',
  },

                                                                /* PET FULL SCREEN */
                                                                petFullScreenContainer: {
                                                                  petPhotoContainer: {
                                                                  width: SCREEN_WIDTH,
                                                                height: '100%',
                                                                height: SCREEN_HEIGHT * 0.62,
                                                                position: 'relative',
                                                                justifyContent: 'space-between',
                                                                backgroundColor: '#1C1815',
  },
                                                                petPhotoTouch: {
                                                                  width: '100%',
                                                                height: '100%',
  },
                                                                petFullBgImage: {
                                                                  width: '100%',
                                                                height: '100%',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
  },
                                                                petTopFloatingBar: {
                                                                  position: 'absolute',
                                                                top: 14,
                                                                left: 16,
                                                                right: 16,
                                                                flexDirection: 'row',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                paddingHorizontal: 16,
                                                                paddingTop: 12,
                                                                zIndex: 5,
                                                                zIndex: 12,
  },
                                                                petSpeciesPillBadge: {
                                                                  backgroundColor: 'rgba(28, 22, 18, 0.55)',
                                                                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                                                                paddingHorizontal: 12,
                                                                paddingVertical: 6,
                                                                borderRadius: 16,
                                                                borderWidth: 1,
                                                                borderColor: 'rgba(255, 255, 255, 0.25)',
                                                                paddingVertical: 5,
                                                                borderRadius: 14,
  },
                                                                petSpeciesPillText: {
                                                                  fontSize: 12,
                                                                fontWeight: '800',
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
                                                                backgroundColor: 'rgba(28, 22, 18, 0.55)',
                                                                paddingHorizontal: 12,
                                                                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 6,
                                                                borderRadius: 16,
                                                                borderWidth: 1,
                                                                borderColor: 'rgba(255, 255, 255, 0.25)',
  },
                                                                petFloatingLikeBtnActive: {
                                                                  backgroundColor: 'rgba(255, 111, 97, 0.35)',
                                                                borderColor: '#FF6F61',
                                                                backgroundColor: '#FFFFFF',
  },
                                                                petFloatingLikeText: {
                                                                  fontSize: 12,
                                                                fontWeight: '800',
                                                                fontWeight: '700',
                                                                color: '#FFFFFF',
  },
                                                                petFloatingEditBtn: {
                                                                  width: 32,
                                                                height: 32,
                                                                borderRadius: 16,
                                                                backgroundColor: 'rgba(28, 22, 18, 0.55)',
                                                                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
  },

  /* Frosted Nav Buttons < and > */
                                                                  petGalleryPrevBtn: {
                                                                    position: 'absolute',
                                                                  left: 14,
                                                                  top: '42%',
                                                                  width: 38,
                                                                  height: 38,
                                                                  borderRadius: 19,
                                                                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(255, 255, 255, 0.25)',
                                                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                                                  justifyContent: 'center',
                                                                  alignItems: 'center',
                                                                  zIndex: 15,
  },
                                                                  petGalleryNextBtn: {
                                                                    position: 'absolute',
                                                                  right: 14,
                                                                  top: '42%',
                                                                  width: 38,
                                                                  height: 38,
                                                                  borderRadius: 19,
                                                                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                                                  justifyContent: 'center',
  },
                                                                  petGalleryDotsRow: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  gap: 6,
                                                                  marginTop: 8,
                                                                  zIndex: 5,
                                                                  zIndex: 15,
  },
                                                                  petGalleryDot: {
                                                                    width: 6,
                                                                  height: 6,
                                                                  borderRadius: 3,
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                                                  petGalleryNavArrow: {
                                                                    color: '#FFFFFF',
                                                                  fontSize: 24,
                                                                  fontWeight: '700',
                                                                  lineHeight: 26,
                                                                  textAlign: 'center',
  },
                                                                  petGalleryDotActive: {
                                                                    width: 16,
                                                                  backgroundColor: '#FFFFFF',

                                                                  /* Heart Burst */
                                                                  heartBurstWrap: {
                                                                    position: 'absolute',
                                                                  top: '36%',
                                                                  alignSelf: 'center',
                                                                  zIndex: 30,
                                                                  shadowColor: '#FF6F61',
                                                                  shadowOffset: {width: 0, height: 4 },
                                                                  shadowOpacity: 0.4,
                                                                  shadowRadius: 10,
  },
                                                                  nextPhotoMiniBtn: {
                                                                    padding: 3,
                                                                  marginLeft: 4,
                                                                  backgroundColor: 'rgba(0,0,0,0.3)',
                                                                  borderRadius: 10,
  },

                                                                  /* ULTRA TRANSLUCENT CARD */
                                                                  /* Ultra-Translucent Card (Scrolls with page content) */
                                                                  petUltraTranslucentCard: {
                                                                    backgroundColor: 'rgba(20, 16, 14, 0.32)',
                                                                  borderTopLeftRadius: 28,
                                                                  borderTopRightRadius: 28,
                                                                  paddingHorizontal: 18,
                                                                  paddingTop: 16,
                                                                  paddingBottom: 22,
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                                                  shadowColor: '#000',
                                                                  shadowOffset: {width: 0, height: -4 },
                                                                  shadowOpacity: 0.18,
                                                                  shadowRadius: 8,
                                                                  elevation: 6,
                                                                  marginHorizontal: 16,
                                                                  marginTop: -40,
                                                                  backgroundColor: 'rgba(24, 20, 18, 0.72)',
                                                                  borderRadius: 24,
                                                                  padding: 16,
                                                                  zIndex: 10,
  },
                                                                  petCardHeaderRow: {
                                                                    flexDirection: 'row',
                                                                  justifyContent: 'space-between',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  marginBottom: 8,
                                                                  flexWrap: 'wrap',
                                                                  gap: 8,
                                                                  marginBottom: 10,
  },
                                                                  petCardMainName: {
                                                                    fontSize: 24,
                                                                  fontWeight: '900',
                                                                  fontWeight: '800',
                                                                  color: '#FFFFFF',
                                                                  letterSpacing: 0.3,
  },
                                                                  petBreedFullTag: {
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                                  paddingHorizontal: 10,
                                                                  paddingVertical: 4,
                                                                  borderRadius: 12,
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(255, 255, 255, 0.28)',
  },
                                                                  petBreedFullText: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  fontWeight: '600',
                                                                  color: '#FFFFFF',
  },
                                                                  petSpecsWrapRow: {
                                                                    flexDirection: 'row',
                                                                  flexWrap: 'wrap',
                                                                  gap: 8,
                                                                  marginBottom: 10,
                                                                  marginBottom: 12,
  },
                                                                  specFrostedChip: {
                                                                    paddingVertical: 5,
                                                                  paddingHorizontal: 10,
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                                                  paddingHorizontal: 12,
                                                                  paddingVertical: 6,
                                                                  borderRadius: 12,
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(255, 255, 255, 0.22)',
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
                                                                  specChipLabel: {
                                                                    fontSize: 9,
                                                                  fontWeight: '700',
                                                                  color: 'rgba(255, 255, 255, 0.7)',
                                                                  fontSize: 10,
                                                                  fontWeight: '500',
                                                                  color: 'rgba(255, 255, 255, 0.65)',
  },
                                                                  specChipValue: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
                                                                  marginTop: 1,
  },
                                                                  expandToggleBtn: {
                                                                    paddingVertical: 8,
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  paddingVertical: 6,
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                                                  borderRadius: 12,
                                                                  marginBottom: 10,
                                                                  borderTopWidth: 1,
                                                                  borderTopColor: 'rgba(255, 255, 255, 0.1)',
                                                                  marginTop: 4,
  },
                                                                  expandToggleBtnText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '800',
                                                                  color: '#FFFFFF',
                                                                  fontSize: 12,
                                                                  fontWeight: '700',
                                                                  color: '#A3E4D7',
  },
                                                                  petExpandedScrollView: {
                                                                    maxHeight: 180,
                                                                  marginBottom: 10,
                                                                  petExpandedContentBlock: {
                                                                    marginTop: 10,
  },
                                                                  petCardBioText: {
                                                                    fontSize: 12,
                                                                  lineHeight: 17,
                                                                  color: 'rgba(255, 255, 255, 0.95)',
                                                                  marginBottom: 10,
                                                                  fontSize: 13,
                                                                  lineHeight: 18,
                                                                  color: 'rgba(255, 255, 255, 0.9)',
                                                                  marginBottom: 12,
  },
                                                                  petHealthSectionBox: {
                                                                    petDetailCardRow: {
                                                                    marginBottom: 8,
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                                  borderRadius: 14,
                                                                  padding: 10,
                                                                  marginBottom: 10,
                                                                  borderRadius: 12,
  },
                                                                  petHealthSectionTitle: {
                                                                    petDetailCardLabel: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
                                                                  color: '#A3E4D7',
                                                                  marginBottom: 2,
  },
                                                                  petDetailCardValue: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  color: '#FFFFFF',
                                                                  marginBottom: 8,
                                                                  lineHeight: 16,
  },
                                                                  weightBarsRow: {

                                                                    /* Weight Chart: Không đè chữ */
                                                                    petHealthSectionBox: {
                                                                    marginTop: 10,
                                                                  marginBottom: 12,
  },
                                                                  petHealthSectionTitle: {
                                                                    fontSize: 13,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
                                                                  marginBottom: 10,
  },
                                                                  weightBarsContainer: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'flex-end',
                                                                  justifyContent: 'space-around',
                                                                  height: 70,
                                                                  paddingBottom: 2,
                                                                  height: 90,
                                                                  paddingBottom: 6,
                                                                  backgroundColor: 'rgba(0, 0, 0, 0.22)',
                                                                  borderRadius: 14,
                                                                  paddingHorizontal: 8,
  },
                                                                  weightBarItem: {
                                                                    weightBarColumn: {
                                                                    alignItems: 'center',
                                                                  gap: 3,
                                                                  justifyContent: 'flex-end',
  },
                                                                  weightBarKgText: {
                                                                    fontSize: 10,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
                                                                  marginBottom: 5,
  },
                                                                  weightBarPill: {
                                                                    width: 20,
                                                                  borderRadius: 6,
                                                                  width: 22,
                                                                  borderRadius: 8,
                                                                  backgroundColor: '#A3E4D7',
  },
                                                                  weightBarMonthText: {
                                                                    fontSize: 10,
                                                                  color: 'rgba(255, 255, 255, 0.8)',
                                                                  fontSize: 11,
                                                                  fontWeight: '600',
                                                                  color: 'rgba(255, 255, 255, 0.85)',
                                                                  marginTop: 5,
  },

                                                                  /* Vaccines */
                                                                  vaccineCardItem: {
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                                  borderRadius: 10,
                                                                  padding: 8,
                                                                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                                  borderRadius: 12,
                                                                  padding: 10,
                                                                  marginBottom: 6,
  },
                                                                  vaccineItemHeader: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 6,
  },
                                                                  vaccineItemName: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
                                                                  flex: 1,
  },
                                                                  doseBadge: {
                                                                    backgroundColor: 'rgba(163, 228, 215, 0.3)',
                                                                  paddingHorizontal: 6,
                                                                  backgroundColor: 'rgba(163, 228, 215, 0.25)',
                                                                  paddingHorizontal: 7,
                                                                  paddingVertical: 2,
                                                                  borderRadius: 6,
                                                                  borderRadius: 8,
  },
                                                                  doseBadgeText: {
                                                                    fontSize: 10,
                                                                  fontWeight: '800',
                                                                  color: '#D1F5ED',
  },
                                                                  vaccineItemDetails: {
                                                                    fontSize: 10,
                                                                  color: 'rgba(255, 255, 255, 0.75)',
                                                                  marginTop: 3,
  },
                                                                  habitsSectionRow: {
                                                                    marginBottom: 8,
  },
                                                                  habitsSectionTitle: {
                                                                    fontSize: 11,
                                                                  fontWeight: '800',
                                                                  color: 'rgba(255, 255, 255, 0.8)',
                                                                  marginBottom: 4,
  },
                                                                  habitsChipsWrap: {
                                                                    flexDirection: 'row',
                                                                  flexWrap: 'wrap',
                                                                  gap: 6,
  },
                                                                  habitGoodPill: {
                                                                    backgroundColor: 'rgba(16, 126, 102, 0.35)',
                                                                  paddingHorizontal: 9,
                                                                  paddingVertical: 4,
                                                                  borderRadius: 10,
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(163, 228, 215, 0.4)',
  },
                                                                  habitGoodText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
                                                                  color: '#D1F5ED',
                                                                  color: '#A3E4D7',
  },
                                                                  habitCautionPill: {
                                                                    backgroundColor: 'rgba(201, 59, 43, 0.35)',
                                                                  paddingHorizontal: 9,
                                                                  paddingVertical: 4,
                                                                  borderRadius: 10,
                                                                  borderWidth: 1,
                                                                  borderColor: 'rgba(255, 168, 158, 0.4)',
  },
                                                                  habitCautionText: {
                                                                    vaccineItemSub: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
                                                                  color: '#FFE5E2',
                                                                  color: 'rgba(255, 255, 255, 0.65)',
                                                                  marginTop: 3,
  },
                                                                  petFullWidthCtaBtn: {
                                                                    width: '100%',
                                                                  height: 48,
                                                                  borderRadius: 24,
                                                                  backgroundColor: '#FAD8A0',

                                                                  /* Pet CTA */
                                                                  petCtaBookWalkBtn: {
                                                                    backgroundColor: '#FF6F61',
                                                                  paddingVertical: 14,
                                                                  borderRadius: 16,
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  shadowColor: '#FAD8A0',
                                                                  shadowOffset: {width: 0, height: 3 },
                                                                  shadowOpacity: 0.3,
                                                                  shadowRadius: 5,
                                                                  elevation: 3,
                                                                  marginTop: 14,
  },
                                                                  petFullWidthCtaText: {
                                                                    fontSize: 14,
                                                                  fontWeight: '900',
                                                                  color: '#28201A',
                                                                  petCtaBookWalkText: {
                                                                    fontSize: 15,
                                                                  fontWeight: '800',
                                                                  color: '#FFFFFF',
  },

                                                                  /* MODALS & BOTTOM SHEETS */
                                                                  modalBackdropCenter: {
                                                                    /* MODALS & POPUPS */
                                                                    cleanModalOverlay: {
                                                                    flex: 1,
                                                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  paddingHorizontal: 20,
                                                                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                                                                  justifyContent: 'flex-end',
  },
                                                                  cleanModalCard: {
                                                                    width: '100%',
                                                                  maxWidth: 380,
                                                                  backgroundColor: '#FFFFFF',
                                                                  borderRadius: 24,
                                                                  borderTopLeftRadius: 24,
                                                                  borderTopRightRadius: 24,
                                                                  padding: 20,
                                                                  shadowColor: '#000',
                                                                  shadowOffset: {width: 0, height: 6 },
                                                                  shadowOpacity: 0.15,
                                                                  shadowRadius: 10,
                                                                  elevation: 6,
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
                                                                  justifyContent: 'space-between',
                                                                  marginBottom: 6,
                                                                  marginBottom: 12,
  },
                                                                  cleanModalTitle: {
                                                                    fontSize: 17,
                                                                  fontWeight: '900',
                                                                  fontWeight: '800',
                                                                  color: '#1C1815',
  },
                                                                  modalCloseBtn: {
                                                                    padding: 4,
                                                                  padding: 6,
  },
                                                                  cleanModalSubtitle: {
                                                                    fontSize: 12,
                                                                  color: '#8E7F73',
                                                                  lineHeight: 17,
                                                                  fontSize: 13,
                                                                  color: '#7E6E60',
                                                                  marginBottom: 14,
  },
                                                                  cleanTextInputArea: {
                                                                    backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  borderColor: '#E8E2D9',
                                                                  borderRadius: 14,
                                                                  padding: 12,
                                                                  fontSize: 13,
                                                                  fontSize: 14,
                                                                  color: '#1C1815',
                                                                  minHeight: 75,
                                                                  minHeight: 80,
                                                                  textAlignVertical: 'top',
                                                                  marginBottom: 14,
  },
                                                                  cleanModalActionRow: {
                                                                    flexDirection: 'row',
                                                                  justifyContent: 'flex-end',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'flex-end',
                                                                  gap: 10,
                                                                  gap: 12,
                                                                  marginTop: 16,
  },
                                                                  cleanDeleteTextBtn: {
                                                                    paddingVertical: 8,
                                                                  paddingHorizontal: 12,
                                                                  paddingVertical: 10,
  },
                                                                  cleanDeleteText: {
                                                                    cleanDeleteTextBtnText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '700',
                                                                  color: '#C93B2B',
                                                                  fontWeight: '600',
                                                                  color: '#E15B4C',
  },
                                                                  cleanSaveBtn: {
                                                                    cleanSubmitBtn: {
                                                                    paddingVertical: 12,
                                                                  paddingHorizontal: 20,
                                                                  paddingVertical: 11,
                                                                  borderRadius: 16,
                                                                  borderRadius: 14,
                                                                  alignItems: 'center',
  },
                                                                  cleanSaveBtnText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '800',
                                                                  cleanSubmitBtnText: {
                                                                    fontSize: 14,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
  },

                                                                  sheetBackdrop: {
                                                                    flex: 1,
                                                                  backgroundColor: 'rgba(0,0,0,0.55)',
                                                                  justifyContent: 'flex-end',
  },
                                                                  bottomSheetCard: {
                                                                    backgroundColor: '#FFFFFF',
                                                                  borderTopLeftRadius: 28,
                                                                  borderTopRightRadius: 28,
                                                                  paddingHorizontal: 20,
                                                                  paddingTop: 18,
                                                                  paddingBottom: 28,
                                                                  maxHeight: SCREEN_HEIGHT * 0.9,
  },
                                                                  sheetHeaderRow: {
                                                                    /* Pick Cover presets */
                                                                    pickFromDeviceBtn: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  marginBottom: 14,
                                                                  paddingBottom: 8,
                                                                  borderBottomWidth: 1,
                                                                  borderBottomColor: '#F0EBE4',
                                                                  gap: 8,
                                                                  backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#E8E2D9',
                                                                  paddingVertical: 12,
                                                                  paddingHorizontal: 16,
                                                                  borderRadius: 14,
                                                                  marginBottom: 16,
  },
                                                                  sheetHeaderTitle: {
                                                                    fontSize: 17,
                                                                  fontWeight: '900',
                                                                  pickFromDeviceBtnText: {
                                                                    fontSize: 14,
                                                                  fontWeight: '600',
                                                                  color: '#1C1815',
  },
                                                                  fieldLabel: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  color: '#4A3F35',
                                                                  marginBottom: 5,
                                                                  marginTop: 8,
                                                                  presetSectionTitle: {
                                                                    fontSize: 13,
                                                                  fontWeight: '700',
                                                                  color: '#5A4E47',
                                                                  marginBottom: 10,
  },
                                                                  fieldLabelWithToggleRow: {
                                                                    coverPresetsRow: {
                                                                    flexDirection: 'row',
                                                                  gap: 8,
  },
                                                                  coverPresetItem: {
                                                                    flex: 1,
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  marginTop: 8,
  },
                                                                  privacyToggleBtn: {
                                                                    paddingHorizontal: 8,
                                                                  paddingVertical: 3,
                                                                  coverPresetThumb: {
                                                                    width: '100%',
                                                                  height: 60,
                                                                  borderRadius: 10,
                                                                  backgroundColor: '#F5EFE8',
                                                                  marginBottom: 4,
  },
                                                                  privacyToggleText: {
                                                                    fontSize: 10,
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
                                                                  color: '#8E7F73',
                                                                  color: '#4A3E3D',
                                                                  marginBottom: 5,
  },
                                                                  privacyToggleTextActive: {
                                                                    color: '#1C1815',
  },
                                                                  fieldInput: {
                                                                    backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  borderColor: '#E8E2D9',
                                                                  borderRadius: 12,
                                                                  paddingHorizontal: 12,
                                                                  paddingVertical: 9,
                                                                  fontSize: 13,
                                                                  fontSize: 14,
                                                                  color: '#1C1815',
  },
                                                                  choiceChip: {
                                                                    paddingHorizontal: 12,
                                                                  paddingVertical: 7,
                                                                  borderRadius: 14,
                                                                  fieldsTwoColRow: {
                                                                    flexDirection: 'row',
  },
                                                                  pickerSelectorBtn: {
                                                                    flexDirection: 'row',
                                                                  justifyContent: 'space-between',
                                                                  alignItems: 'center',
                                                                  backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  borderColor: '#E8E2D9',
                                                                  borderRadius: 12,
                                                                  paddingHorizontal: 12,
                                                                  paddingVertical: 9,
  },
                                                                  choiceChipText: {
                                                                    fontSize: 12,
                                                                  fontWeight: '700',
                                                                  color: '#554A40',
                                                                  pickerSelectorBtnText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '600',
                                                                  color: '#1C1815',
  },
                                                                  speciesChoiceRow: {
                                                                    flexDirection: 'row',
                                                                  gap: 8,
                                                                  marginBottom: 6,
  },
                                                                  speciesChoiceBtn: {
                                                                    flex: 1,
                                                                  paddingVertical: 9,
                                                                  borderRadius: 12,
                                                                  paddingVertical: 8,
                                                                  borderRadius: 10,
                                                                  backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  borderColor: '#E8E2D9',
                                                                  alignItems: 'center',
                                                                  backgroundColor: '#FAF7F2',
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
                                                                  color: '#4A3F35',
  },
                                                                  twoInputsRow: {
                                                                    genderRow: {
                                                                    flexDirection: 'row',
                                                                  gap: 10,
                                                                  gap: 8,
  },
                                                                  genderToggleRow: {
                                                                    flexDirection: 'row',
                                                                  borderRadius: 12,
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  overflow: 'hidden',
  },
                                                                  genderHalfBtn: {
                                                                    genderChoiceBtn: {
                                                                    flex: 1,
                                                                  paddingVertical: 9,
                                                                  borderRadius: 10,
                                                                  backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#E8E2D9',
                                                                  alignItems: 'center',
                                                                  backgroundColor: '#FAF7F2',
  },
                                                                  genderHalfBtnActive: {
                                                                    backgroundColor: '#2C2520',
                                                                  genderChoiceBtnActive: {
                                                                    backgroundColor: '#FF6F61',
                                                                  borderColor: '#FF6F61',
  },
                                                                  genderHalfText: {
                                                                    fontSize: 12,
                                                                  fontWeight: '700',
                                                                  color: '#685D52',
                                                                  genderChoiceText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '600',
                                                                  color: '#5A4E47',
  },
                                                                  genderHalfTextActive: {
                                                                    genderChoiceTextActive: {
                                                                    color: '#FFFFFF',
                                                                  fontWeight: '700',
  },
                                                                  modalSubSectionBox: {
                                                                    innerSectionBox: {
                                                                    backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  borderRadius: 14,
                                                                  padding: 12,
                                                                  marginTop: 12,
                                                                  marginBottom: 12,
  },
                                                                  modalSubSectionTitle: {
                                                                    innerSectionTitle: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  color: '#332B25',
                                                                  fontWeight: '700',
                                                                  color: '#4A3E3D',
                                                                  marginBottom: 8,
  },
                                                                  weightRecordsMiniList: {
                                                                    weightRecordsWrap: {
                                                                    flexDirection: 'row',
                                                                  flexWrap: 'wrap',
                                                                  gap: 6,
                                                                  marginBottom: 8,
  },
                                                                  weightRecordPill: {
                                                                    backgroundColor: '#FFFFFF',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  backgroundColor: '#E8E2D9',
                                                                  paddingHorizontal: 8,
                                                                  paddingVertical: 4,
                                                                  borderRadius: 10,
                                                                  borderRadius: 8,
  },
                                                                  weightRecordPillText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
                                                                  color: '#332B25',
                                                                  fontWeight: '600',
                                                                  color: '#3A332C',
  },
                                                                  addMiniRow: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 8,
  },
                                                                  addMiniBtn: {
                                                                    backgroundColor: '#FF6F61',
                                                                  paddingHorizontal: 12,
                                                                  paddingVertical: 8,
                                                                  backgroundColor: '#2C2520',
                                                                  height: 38,
                                                                  borderRadius: 10,
                                                                  justifyContent: 'center',
                                                                  alignItems: 'center',
  },
                                                                  addMiniBtnText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '800',
                                                                  fontSize: 12,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
  },
                                                                  miniVacItem: {
                                                                    vacMiniItem: {
                                                                    backgroundColor: '#FFFFFF',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
                                                                  borderRadius: 10,
                                                                  padding: 8,
                                                                  marginBottom: 6,
                                                                  borderRadius: 8,
                                                                  marginBottom: 4,
  },
                                                                  miniVacTitle: {
                                                                    vacMiniItemTitle: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  fontWeight: '700',
                                                                  color: '#1C1815',
  },
                                                                  miniVacSub: {
                                                                    fontSize: 10,
                                                                  vacMiniItemSub: {
                                                                    fontSize: 11,
                                                                  color: '#7E6E60',
                                                                  marginTop: 2,
  },
                                                                  addVacBlock: {
                                                                    marginTop: 6,
  },
                                                                  deletePetInModalBtn: {
                                                                    deletePetFullBtn: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  gap: 6,
                                                                  paddingVertical: 12,
                                                                  borderWidth: 1,
                                                                  borderColor: '#FFD9D4',
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
                                                                  backgroundColor: '#FFF5F4',
                                                                  marginTop: 14,
                                                                  marginBottom: 6,
                                                                  padding: 12,
                                                                  marginBottom: 14,
  },
                                                                  deletePetInModalText: {
                                                                    privacySectionTitle: {
                                                                    fontSize: 13,
                                                                  fontWeight: '800',
                                                                  color: '#C93B2B',
                                                                  fontWeight: '700',
                                                                  color: '#1C1815',
                                                                  marginBottom: 4,
  },
                                                                  sheetPrimarySubmitBtn: {
                                                                    paddingVertical: 12,
                                                                  borderRadius: 16,
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  marginTop: 16,
                                                                  privacySectionDesc: {
                                                                    fontSize: 11,
                                                                  color: '#7E6E60',
                                                                  marginBottom: 10,
  },
                                                                  sheetPrimarySubmitBtnText: {
                                                                    fontSize: 14,
                                                                  fontWeight: '800',
                                                                  color: '#FFFFFF',
  },

                                                                  /* COVER PRESETS MODAL */
                                                                  pickGalleryBtn: {
                                                                    privacyToggleRow: {
                                                                    flexDirection: 'row',
                                                                  justifyContent: 'space-between',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  gap: 8,
                                                                  paddingVertical: 12,
                                                                  borderRadius: 14,
                                                                  marginBottom: 10,
                                                                  paddingVertical: 8,
                                                                  borderBottomWidth: 1,
                                                                  borderBottomColor: '#F0ECE6',
  },
                                                                  pickGalleryBtnText: {
                                                                    privacyToggleLabel: {
                                                                    fontSize: 13,
                                                                  fontWeight: '800',
                                                                  fontWeight: '600',
                                                                  color: '#3A332C',
  },
                                                                  coverPresetsGrid: {
                                                                    flexDirection: 'row',
                                                                  flexWrap: 'wrap',
                                                                  gap: 8,
                                                                  privacyBadgeTag: {
                                                                    paddingHorizontal: 8,
                                                                  paddingVertical: 3,
                                                                  borderRadius: 8,
  },
                                                                  coverPresetThumbItem: {
                                                                    width: (SCREEN_WIDTH - 80) / 2,
                                                                  height: 75,
                                                                  borderRadius: 12,
                                                                  overflow: 'hidden',
                                                                  position: 'relative',
                                                                  borderWidth: 2,
                                                                  borderColor: 'transparent',
                                                                  privacyBadgePublic: {
                                                                    backgroundColor: '#E8F8F5',
  },
                                                                  coverPresetThumbItemActive: {
                                                                    borderColor: '#FF6F61',
                                                                  privacyBadgeHidden: {
                                                                    backgroundColor: '#F0ECE6',
  },
                                                                  coverPresetImg: {
                                                                    width: '100%',
                                                                  height: '100%',
                                                                  privacyBadgeText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
  },
                                                                  coverPresetTitle: {
                                                                    position: 'absolute',
                                                                  bottom: 4,
                                                                  left: 6,
                                                                  right: 6,
                                                                  fontSize: 10,
                                                                  fontWeight: '800',
                                                                  color: '#FFFFFF',
                                                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                                                  paddingHorizontal: 4,
                                                                  paddingVertical: 2,
                                                                  borderRadius: 4,
                                                                  privacyBadgeTextPublic: {
                                                                    color: '#27AE60',
  },
                                                                  privacyBadgeTextHidden: {
                                                                    color: '#8A7D75',
  },
                                                                  modalFooterActions: {
                                                                    paddingTop: 10,
  },

                                                                  /* POST PREVIEW MODAL (Hình 2) */
                                                                  postPreviewBackdrop: {
                                                                    /* POST PREVIEW MODAL */
                                                                    previewOverlay: {
                                                                    flex: 1,
                                                                  backgroundColor: 'rgba(0, 0, 0, 0.78)',
                                                                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                                                  justifyContent: 'center',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  paddingHorizontal: 20,
                                                                  paddingVertical: 30,
                                                                  padding: 20,
  },
                                                                  postPreviewCardBox: {
                                                                    previewCard: {
                                                                    width: '100%',
                                                                  maxWidth: 360,
                                                                  backgroundColor: '#1E2328',
                                                                  maxHeight: SCREEN_HEIGHT * 0.82,
                                                                  backgroundColor: '#20242C',
                                                                  borderRadius: 24,
                                                                  padding: 16,
                                                                  shadowColor: '#000',
                                                                  shadowOffset: {width: 0, height: 8 },
                                                                  shadowOpacity: 0.4,
                                                                  shadowRadius: 14,
                                                                  elevation: 10,
                                                                  overflow: 'hidden',
                                                                  paddingBottom: 16,
  },
                                                                  postPreviewAuthorHeader: {
                                                                    previewHeaderRow: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  marginBottom: 12,
                                                                  padding: 14,
  },
                                                                  postPreviewAvatar: {
                                                                    width: 36,
                                                                  height: 36,
                                                                  borderRadius: 18,
                                                                  borderWidth: 1,
                                                                  borderColor: '#3D444D',
                                                                  width: 38,
                                                                  height: 38,
                                                                  borderRadius: 19,
  },
                                                                  postPreviewAuthorTextBox: {
                                                                    flex: 1,
                                                                  paddingHorizontal: 10,
  },
                                                                  postPreviewHandleText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '800',
                                                                  previewAuthorHandle: {
                                                                    fontSize: 14,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
  },
                                                                  postPreviewTimeAgoText: {
                                                                    previewMetaText: {
                                                                    fontSize: 11,
                                                                  color: '#A89E94',
                                                                  color: '#8A7D75',
                                                                  marginTop: 1,
  },
                                                                  postPreviewCloseBtn: {
                                                                    padding: 4,
                                                                  previewCloseBtn: {
                                                                    padding: 6,
  },
                                                                  postPreviewImageWrap: {
                                                                    previewPostImage: {
                                                                    width: '100%',
                                                                  height: 270,
                                                                  borderRadius: 18,
                                                                  overflow: 'hidden',
                                                                  backgroundColor: '#121518',
                                                                  height: 240,
                                                                  backgroundColor: '#16191F',
  },
                                                                  postPreviewImage: {
                                                                    width: '100%',
                                                                  height: '100%',
                                                                  previewCaptionBox: {
                                                                    paddingHorizontal: 16,
                                                                  paddingTop: 12,
  },
                                                                  postPreviewBottomCaptionBox: {
                                                                    paddingVertical: 10,
  },
                                                                  postPreviewLikesLine: {
                                                                    previewLikeCountRow: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 6,
                                                                  marginBottom: 6,
  },
                                                                  postPreviewLikesCountText: {
                                                                    fontSize: 12,
                                                                  fontWeight: '800',
                                                                  previewLikeCountText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
  },
                                                                  postPreviewFullCaptionText: {
                                                                    previewCaptionText: {
                                                                    fontSize: 13,
                                                                  lineHeight: 18,
                                                                  color: 'rgba(255, 255, 255, 0.9)',
                                                                  color: '#D1D5DB',
  },
                                                                  postPreviewActionSheet: {
                                                                    marginTop: 6,
                                                                  backgroundColor: '#272D34',
                                                                  borderRadius: 16,
                                                                  overflow: 'hidden',
                                                                  previewActionsContainer: {
                                                                    paddingHorizontal: 16,
                                                                  marginTop: 14,
                                                                  gap: 8,
  },
                                                                  previewMenuRowItem: {
                                                                    previewMainActionBtn: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 12,
                                                                  paddingHorizontal: 16,
                                                                  justifyContent: 'center',
                                                                  gap: 8,
                                                                  backgroundColor: '#2D3440',
                                                                  paddingVertical: 12,
                                                                  borderBottomWidth: 1,
                                                                  borderBottomColor: '#323942',
                                                                  borderRadius: 14,
  },
                                                                  previewMenuRowText: {
                                                                    fontSize: 13,
                                                                  postPreviewActionText: {
                                                                    fontSize: 14,
                                                                  fontWeight: '700',
                                                                  color: '#FFFFFF',
                                                                  color: '#A3E4D7',
  },

                                                                  /* POST DETAIL MODAL */
                                                                  postDetailSheetCard: {
                                                                    backgroundColor: '#FFFFFF',
                                                                  borderTopLeftRadius: 28,
                                                                  borderTopRightRadius: 28,
                                                                  paddingHorizontal: 18,
                                                                  paddingTop: 16,
                                                                  paddingBottom: 20,
                                                                  maxHeight: SCREEN_HEIGHT * 0.92,
                                                                  previewSecondaryActionBtn: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  gap: 6,
                                                                  paddingVertical: 10,
  },
                                                                  postDetailHeaderRow: {
                                                                    previewSecondaryActionText: {
                                                                    fontSize: 13,
                                                                  fontWeight: '600',
                                                                  color: '#FF6F61',
  },
                                                                  previewDangerActionBtn: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  paddingBottom: 12,
                                                                  borderBottomWidth: 1,
                                                                  borderBottomColor: '#F0EBE4',
                                                                  justifyContent: 'center',
                                                                  gap: 6,
                                                                  paddingVertical: 6,
  },
                                                                  postDetailAuthorBox: {
                                                                    previewDangerActionText: {
                                                                    fontSize: 12,
                                                                  fontWeight: '600',
                                                                  color: '#E15B4C',
  },

                                                                  /* POST DETAIL MODAL */
                                                                  postDetailAuthorRow: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 10,
                                                                  marginBottom: 12,
  },
                                                                  postDetailAvatar: {
                                                                    width: 38,
                                                                  height: 38,
                                                                  borderRadius: 19,
                                                                  width: 40,
                                                                  height: 40,
                                                                  borderRadius: 20,
  },
                                                                  postDetailAuthorName: {
                                                                    fontSize: 14,
                                                                  fontWeight: '800',
                                                                  fontWeight: '700',
                                                                  color: '#1C1815',
  },
                                                                  postDetailAuthorHandle: {
                                                                    fontSize: 11,
                                                                  color: '#8E7F73',
                                                                  fontSize: 12,
                                                                  color: '#8A7D75',
  },
                                                                  postDetailScroll: {
                                                                    maxHeight: SCREEN_HEIGHT * 0.65,
  },
                                                                  postDetailImage: {
                                                                    width: '100%',
                                                                  height: 250,
                                                                  borderRadius: 16,
                                                                  marginTop: 10,
                                                                  backgroundColor: '#EAE4DC',
                                                                  height: 220,
                                                                  borderRadius: 14,
                                                                  marginBottom: 10,
  },
                                                                  postDetailContentBox: {
                                                                    paddingVertical: 10,
  },
                                                                  postDetailCaption: {
                                                                    postDetailContentText: {
                                                                    fontSize: 14,
                                                                  lineHeight: 20,
                                                                  color: '#2C2520',
                                                                  color: '#3A332C',
                                                                  marginBottom: 12,
  },
                                                                  postDetailTimeText: {
                                                                    fontSize: 11,
                                                                  color: '#8E7F73',
                                                                  marginTop: 4,
  },
                                                                  postDetailReactionsBar: {
                                                                    postDetailReactionsRow: {
                                                                    flexDirection: 'row',
                                                                  gap: 10,
                                                                  paddingVertical: 8,
                                                                  borderTopWidth: 1,
                                                                  borderBottomWidth: 1,
                                                                  borderColor: '#F0EBE4',
                                                                  marginVertical: 6,
                                                                  gap: 8,
                                                                  marginBottom: 16,
  },
                                                                  reactionButtonPill: {
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
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
  },
                                                                  reactionButtonPillActive: {
                                                                    backgroundColor: '#FFF0EE',
                                                                  borderColor: '#FF6F61',
  },
                                                                  reactionEmojiText: {
                                                                    fontSize: 14,
  },
                                                                  reactionCountText: {
                                                                    reactionPillText: {
                                                                    fontSize: 12,
                                                                  fontWeight: '700',
                                                                  color: '#4A3F35',
                                                                  color: '#1C1815',
  },
                                                                  postDetailCommentsBox: {
                                                                    paddingVertical: 10,
                                                                  commentsListBlock: {
                                                                    borderTopWidth: 1,
                                                                  borderTopColor: '#F0ECE6',
                                                                  paddingTop: 12,
  },
                                                                  commentsListTitle: {
                                                                    commentsHeaderTitle: {
                                                                    fontSize: 13,
                                                                  fontWeight: '800',
                                                                  fontWeight: '700',
                                                                  color: '#1C1815',
                                                                  marginBottom: 10,
  },
                                                                  commentItemWrap: {
                                                                    flexDirection: 'row',
                                                                  gap: 10,
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
                                                                  fontWeight: '800',
                                                                  fontWeight: '700',
                                                                  color: '#1C1815',
                                                                  marginBottom: 2,
  },
                                                                  commentContent: {
                                                                    commentContentText: {
                                                                    fontSize: 13,
                                                                  lineHeight: 18,
                                                                  color: '#2C2520',
                                                                  color: '#3A332C',
                                                                  lineHeight: 17,
  },
                                                                  commentFooterRow: {
                                                                    commentMetaRow: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 14,
                                                                  gap: 12,
                                                                  marginTop: 4,
                                                                  paddingLeft: 4,
  },
                                                                  commentTimeAgo: {
                                                                    commentTimeText: {
                                                                    fontSize: 10,
                                                                  color: '#8A7D75',
  },
                                                                  commentReplyLink: {
                                                                    fontSize: 11,
                                                                  color: '#8E7F73',
                                                                  fontWeight: '700',
                                                                  color: '#FF6F61',
  },
                                                                  commentLikeBtn: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 3,
                                                                  paddingTop: 4,
  },
                                                                  commentLikeText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
                                                                  color: '#8E7F73',
                                                                  commentLikeCount: {
                                                                    fontSize: 10,
                                                                  fontWeight: '600',
                                                                  color: '#8A7D75',
                                                                  marginTop: 2,
  },
                                                                  commentReplyActionText: {
                                                                    fontSize: 11,
                                                                  fontWeight: '700',
                                                                  color: '#1C1815',
  },
                                                                  nestedRepliesContainer: {
                                                                    marginTop: 8,
                                                                  paddingLeft: 12,
                                                                  borderLeftWidth: 2,
                                                                  borderLeftColor: '#ECE6DF',
                                                                  gap: 8,
  },
                                                                  replyItemWrap: {
                                                                    replyRow: {
                                                                    flexDirection: 'row',
                                                                  gap: 8,
                                                                  alignItems: 'flex-start',
                                                                  marginLeft: 40,
                                                                  marginTop: 6,
  },
                                                                  replyAvatar: {
                                                                    width: 24,
                                                                  height: 24,
                                                                  borderRadius: 12,
  },
                                                                  commentInputRow: {
                                                                    borderTopWidth: 1,
                                                                  borderTopColor: '#F0EBE4',
                                                                  paddingTop: 8,
                                                                  replyBubble: {
                                                                    flex: 1,
                                                                  backgroundColor: '#F5EFE6',
                                                                  padding: 8,
                                                                  borderRadius: 12,
                                                                  marginLeft: 6,
  },
                                                                  replyingNoticeBox: {
                                                                    commentInputBar: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'space-between',
                                                                  backgroundColor: '#FAF7F2',
                                                                  paddingHorizontal: 10,
                                                                  paddingVertical: 4,
                                                                  borderRadius: 8,
                                                                  marginBottom: 6,
                                                                  borderTopWidth: 1,
                                                                  borderTopColor: '#F0ECE6',
                                                                  paddingTop: 8,
  },
                                                                  replyingNoticeText: {
                                                                    fontSize: 11,
                                                                  color: '#7E6E60',
                                                                  fontWeight: '600',
  },
                                                                  commentInputContainer: {
                                                                    flexDirection: 'row',
                                                                  alignItems: 'center',
                                                                  gap: 8,
  },
                                                                  commentTextInput: {
                                                                    commentInput: {
                                                                    flex: 1,
                                                                  backgroundColor: '#FAF7F2',
                                                                  borderWidth: 1,
                                                                  borderColor: '#E8E2D9',
                                                                  borderRadius: 20,
                                                                  paddingHorizontal: 14,
                                                                  paddingVertical: 9,
                                                                  paddingVertical: 8,
                                                                  fontSize: 13,
                                                                  color: '#1C1815',
                                                                  borderWidth: 1,
                                                                  borderColor: '#ECE6DF',
  },
                                                                  sendCommentBtn: {
                                                                    commentSendBtn: {
                                                                    backgroundColor: '#FF6F61',
                                                                  width: 36,
                                                                  height: 36,
                                                                  borderRadius: 18,
                                                                  justifyContent: 'center',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  marginLeft: 8,
  },
});
