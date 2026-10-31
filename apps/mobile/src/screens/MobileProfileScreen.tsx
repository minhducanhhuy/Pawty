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
  Modal,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
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

export const MobileProfileScreen: React.FC = () => {
  const {
    theme,
    ownerName,
    ownerHandle,
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
    ownerPrivacySettings,
    updateOwnerProfile,
    ownerNoteBubble,
    setOwnerNoteBubble,
    pets,
    addNewPetProfile,
    deletePetProfile,
    updatePetProfile,
    posts,
    deletePost,
    toggleReaction,
    toggleCommentLike,
    addComment,
    addCommentReply,
    setActiveModal,
    isVip,
    showToast,
  } = useMobilePawty();

  const horizontalScrollRef = useRef<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Cover image modal state
  const [isChangingCoverModal, setIsChangingCoverModal] = useState(false);

  // Per-pet likes & active photo in multi-photo gallery
  const [petLikes, setPetLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({
    [pets[0]?.id || 'pet-lu']: { count: 148, isLiked: false },
    [pets[1]?.id || 'pet-miu']: { count: 96, isLiked: false },
    [pets[2]?.id || 'pet-coca']: { count: 52, isLiked: false },
  });
  const [petGalleryIndices, setPetGalleryIndices] = useState<Record<string, number>>({});
  const [expandedPetDetails, setExpandedPetDetails] = useState<Record<string, boolean>>({});

  // Owner moments tab
  const [ownerMediaTab, setOwnerMediaTab] = useState<'moments' | 'saved'>('moments');

  // Popup 1: Ghi chú
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');

  // Popup 2: Chỉnh sửa Hồ sơ Con Sen đầy đủ thông tin (Hình 1)
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
  const [newPetWeightHistory, setNewPetWeightHistory] = useState<PetWeightEntry[]>([
    { month: 'T8', weightKg: 4.2, date: '15/08/2026' },
    { month: 'T9', weightKg: 4.6, date: '15/09/2026' },
    { month: 'T10', weightKg: 5.0, date: '15/10/2026' },
  ]);
  const [newPetVaccineRecords, setNewPetVaccineRecords] = useState<PetVaccineRecord[]>([
    {
      id: 'vac-1',
      vaccineName: 'Phòng dại & 7 bệnh cơ bản',
      date: '10/08/2026',
      doseNumber: 2,
      clinic: 'Bệnh viện thú y Pawty Care',
      isSafeVerified: true,
    },
  ]);
  // Temp inputs for adding record inside Add Pet Modal
  const [tempWeightMonth, setTempWeightMonth] = useState('');
  const [tempWeightKg, setTempWeightKg] = useState('');
  const [tempVacName, setTempVacName] = useState('');
  const [tempVacDate, setTempVacDate] = useState('');
  const [tempVacDose, setTempVacDose] = useState('1');
  const [tempVacClinic, setTempVacClinic] = useState('');

  // Popup 4: Chỉnh sửa Thú Cưng đầy đủ thông tin & sức khỏe (Hình 5)
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
  const [editPetVaccineRecordsDraft, setEditPetVaccineRecordsDraft] = useState<PetVaccineRecord[]>([]);
  const [editPetWeightHistoryDraft, setEditPetWeightHistoryDraft] = useState<PetWeightEntry[]>([]);
  const [editPetGalleryDraft, setEditPetGalleryDraft] = useState<string[]>([]);
  const [editPetVaccineSafeDraft, setEditPetVaccineSafeDraft] = useState(true);

  // Popup 5: Post Preview Modal & Post Detail Modal (Hình 2)
  const [selectedPreviewPost, setSelectedPreviewPost] = useState<MobilePost | null>(null);
  const [activePostDetail, setActivePostDetail] = useState<MobilePost | null>(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);

  // Moments list calculation
  const myPosts = posts.filter((p) => p.authorHandle === ownerHandle);
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
    });
  };

  // Cycle pet gallery photos
  const handleNextPetPhoto = (petId: string, totalPhotos: number) => {
    if (totalPhotos <= 1) return;
    setPetGalleryIndices((prev) => {
      const current = prev[petId] || 0;
      return { ...prev, [petId]: (current + 1) % totalPhotos };
    });
  };

  // Toggle expanded details on pet card
  const togglePetDetailsExpanded = (petId: string) => {
    setExpandedPetDetails((prev) => ({
      ...prev,
      [petId]: !prev[petId],
    }));
  };

  // Open Edit Pet Modal
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

    updatePetProfile(editingPet.id, {
      name: editPetNameDraft.trim(),
      species: editPetSpeciesDraft,
      customSpecies: editPetSpeciesDraft === 'Khác' ? editPetCustomSpeciesDraft.trim() : undefined,
      breed: editPetBreedDraft.trim() || editingPet.breed,
      gender: editPetGenderDraft,
      ageLabel: editPetAgeDraft.trim() || editingPet.ageLabel,
      birthDate: editPetBirthDateDraft.trim() || editingPet.birthDate,
      weightKg: parseFloat(editPetWeightDraft) || editingPet.weightKg,
      bio: editPetBioDraft.trim() || editingPet.bio,
      isVaccinatedAndRabies: editPetVaccineSafeDraft,
      vaccineRecords: editPetVaccineRecordsDraft,
      weightHistory: editPetWeightHistoryDraft,
      galleryUrls: editPetGalleryDraft,
      avatarUrl: editPetGalleryDraft[0] || editingPet.avatarUrl,
      coverUrl: editPetGalleryDraft[0] || editingPet.coverUrl,
    });
    setEditingPet(null);
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

    Alert.alert(
      'Xác nhận xóa thú cưng',
      `Bạn có chắc chắn muốn xóa hồ sơ bé ${editingPet.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bé',
          style: 'destructive',
          onPress: () => {
            const petIdToDelete = editingPet.id;
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
    if (!newPetName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho bé thú cưng mới.');
      return;
    }

    const defaultImg =
      newPetSpecies === 'Mèo'
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80';

    addNewPetProfile({
      name: newPetName.trim(),
      species: newPetSpecies,
      customSpecies: newPetSpecies === 'Khác' ? newPetCustomSpecies.trim() : undefined,
      breed: newPetBreed.trim() || (newPetSpecies === 'Chó' ? 'Poodle' : newPetSpecies === 'Mèo' ? 'Mèo Anh' : 'Thú cưng'),
      gender: newPetGender,
      birthDate: newPetBirthDate.trim() || '01/06/2024',
      weightKg: parseFloat(newPetWeight) || 5.0,
      ageLabel: newPetAge.trim() || '1 tuổi',
      bio: newPetBio.trim() || `${newPetName.trim()} là thành viên mới rất quấn chủ.`,
      avatarUrl: defaultImg,
      galleryUrls: [defaultImg],
      weightHistory: newPetWeightHistory,
      vaccineRecords: newPetVaccineRecords,
      isVaccinatedAndRabies: true,
    });

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
          {pets.length < MAX_FREE_PETS && (
            <TouchableOpacity
              style={styles.headerAddPill}
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
      </View>

      {/* ================================================================= */}
      {/* HORIZONTAL PAGING CONTAINER: Page 0 (Con sen) -> Page 1..N (Pets) */}
      {/* ================================================================= */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.horizontalScroll}
        contentContainerStyle={{ flexGrow: 1 }}
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

            {/* 2. Floating Note Bubble */}
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
                </Text>
                <View style={styles.noteBubbleTail} />
              </TouchableOpacity>
            </View>

            {/* 3. Avatar Row: Avatar with [+] & Sleek Pen Button on Right */}
            <View style={styles.avatarSectionRow}>
              <View style={styles.avatarSideSpacer} />

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
            </View>

            {/* 4. Owner Information: Tên, Nghề nghiệp/Châm ngôn, Vị trí */}
            <View style={styles.ownerInfoCenterBox}>
              <Text style={styles.ownerFullNameText}>{ownerName}</Text>
              <Text style={styles.ownerJobTitleText}>
                {ownerOccupation ? `${ownerOccupation} · ` : ''}{ownerBio || 'UI UX designer & Pet Parent'}
              </Text>

              {ownerPrivacySettings?.area !== false && (
                <View style={styles.ownerLocationRow}>
                  <Feather name="map-pin" size={13} color="#E15B4C" />
                  <Text style={styles.ownerLocationText}>
                    {ownerArea || 'Vinhomes Grand Park, TP. Thủ Đức'}
                  </Text>
                </View>
              )}

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

            {/* 5. Thẻ 3 Con Số Thống Kê (followers | following | likes) */}
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

              {/* Nút Đăng bài */}
              <TouchableOpacity
                style={[styles.createMomentBtn, { backgroundColor: theme.primary }]}
                onPress={() => setActiveModal('new_moment')}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.createMomentBtnText}>Đăng bài</Text>
              </TouchableOpacity>
            </View>

            {/* 7. Lưới Bài Đăng Khoảnh Khắc */}
            {displayPosts.length > 0 ? (
              <View style={styles.momentsGridBox}>
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
                  <Text style={styles.emptyPostBtnText}>Đăng bài đầu tiên</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ================================================================= */}
        {/* PAGES 1..N: HỒ SƠ TỪNG BÉ THÚ CƯNG (FULL MÀN HÌNH + THẺ SIÊU MỜ)  */}
        {/* ================================================================= */}
        {pets.map((pet) => {
          const petLikeInfo = petLikes[pet.id] || { count: 128, isLiked: false };
          const gallery =
            pet.galleryUrls && pet.galleryUrls.length > 0
              ? pet.galleryUrls
              : [pet.coverUrl || pet.avatarUrl];
          const activePhotoIdx = (petGalleryIndices[pet.id] || 0) % gallery.length;
          const currentPetImg = gallery[activePhotoIdx] || pet.avatarUrl;
          const isExpanded = !!expandedPetDetails[pet.id];

          return (
            <View key={pet.id} style={styles.pageWrapper}>
              <View style={styles.petFullScreenContainer}>
                {/* 1. Full-Screen Pet Image */}
                <Image
                  source={{ uri: currentPetImg }}
                  style={styles.petFullBgImage}
                  resizeMode="cover"
                />

                {/* 2. Top Floating Action Bar: Loài & Cụm nút Thả Tim + Thêm Ảnh + Bút Sửa */}
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
                      ]}
                      onPress={() => handleTogglePetLike(pet.id)}
                      activeOpacity={0.85}
                    >
                      <Feather
                        name="heart"
                        size={15}
                        color={petLikeInfo.isLiked ? '#FF6F61' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          styles.petFloatingLikeText,
                          petLikeInfo.isLiked && { color: '#FF6F61' },
                        ]}
                      >
                        {petLikeInfo.count}
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
                    <TouchableOpacity
                      style={styles.nextPhotoMiniBtn}
                      onPress={() => handleNextPetPhoto(pet.id, gallery.length)}
                    >
                      <Feather name="chevron-right" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. Ultra-Translucent Frosted Card: Mờ nhạt hơn, không che mất ảnh */}
                <View style={styles.petUltraTranslucentCard}>
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

                      {/* Sổ tiêm chủng chi tiết */}
                      <View style={styles.petHealthSectionBox}>
                        <Text style={styles.petHealthSectionTitle}>
                          💉 Sổ tiêm chủng & Vắc-xin:
                        </Text>
                        {(pet.vaccineRecords && pet.vaccineRecords.length > 0
                          ? pet.vaccineRecords
                          : [
                              {
                                id: 'v-1',
                                vaccineName: 'Phòng dại & 7 bệnh cơ bản',
                                date: '01/10/2026',
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
                            <Text style={styles.vaccineItemDetails}>
                              Ngày tiêm: {vac.date} · Cơ sở: {vac.clinic}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Thói quen & Lưu ý */}
                      <View style={styles.habitsSectionRow}>
                        <Text style={styles.habitsSectionTitle}>Tính cách:</Text>
                        <View style={styles.habitsChipsWrap}>
                          {(pet.goodHabits || ['Thân thiện', 'Biết ngồi chờ']).map((h, i) => (
                            <View key={i} style={styles.habitGoodPill}>
                              <Text style={styles.habitGoodText}>✓ {h}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {pet.cautionHabits && pet.cautionHabits.length > 0 && (
                        <View style={styles.habitsSectionRow}>
                          <Text style={styles.habitsSectionTitle}>Lưu ý khi dắt chung:</Text>
                          <View style={styles.habitsChipsWrap}>
                            {pet.cautionHabits.map((c, i) => (
                              <View key={i} style={styles.habitCautionPill}>
                                <Text style={styles.habitCautionText}>! {c}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </ScrollView>
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
              </View>
            </View>
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
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdropCenter}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setIsEditingNote(false)}
              activeOpacity={1}
            />
            <View style={styles.cleanModalCard}>
              <View style={styles.cleanModalHeaderRow}>
                <Text style={styles.cleanModalTitle}>Ghi chú</Text>
                <TouchableOpacity
                  onPress={() => setIsEditingNote(false)}
                  style={styles.modalCloseBtn}
                >
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
                    <Text style={styles.cleanDeleteText}>Xóa ghi chú</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.cleanSaveBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setOwnerNoteBubble(tempNoteText.trim());
                    setIsEditingNote(false);
                    showToast('Đã lưu ghi chú');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cleanSaveBtnText}>Lưu ghi chú</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

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

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {/* 1. Họ và tên */}
                <Text style={styles.fieldLabel}>Họ và tên của bạn</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftName}
                  onChangeText={setOwnerDraftName}
                  placeholder="Nhập họ và tên..."
                  placeholderTextColor="#A89E94"
                />

                {/* 2. Giới tính & Tùy chọn Ẩn/Hiện */}
                <View style={styles.fieldLabelWithToggleRow}>
                  <Text style={styles.fieldLabel}>Giới tính</Text>
                  <TouchableOpacity
                    style={styles.privacyToggleBtn}
                    onPress={() =>
                      setOwnerDraftPrivacy((p) => ({ ...p, gender: !p.gender }))
                    }
                  >
                    <Text
                      style={[
                        styles.privacyToggleText,
                        ownerDraftPrivacy.gender && styles.privacyToggleTextActive,
                      ]}
                    >
                      {ownerDraftPrivacy.gender ? '👁 Công khai' : '🔒 Đang ẩn'}
                    </Text>
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
                  <TouchableOpacity
                    style={styles.privacyToggleBtn}
                    onPress={() =>
                      setOwnerDraftPrivacy((p) => ({ ...p, area: !p.area }))
                    }
                  >
                    <Text
                      style={[
                        styles.privacyToggleText,
                        ownerDraftPrivacy.area && styles.privacyToggleTextActive,
                      ]}
                    >
                      {ownerDraftPrivacy.area ? '👁 Công khai' : '🔒 Đang ẩn'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftArea}
                  onChangeText={setOwnerDraftArea}
                  placeholder="VD: Vinhomes Grand Park, TP. Thủ Đức"
                  placeholderTextColor="#A89E94"
                />

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
                  <Text style={styles.fieldLabel}>Cung hoàng đạo</Text>
                  <TouchableOpacity
                    style={styles.privacyToggleBtn}
                    onPress={() =>
                      setOwnerDraftPrivacy((p) => ({ ...p, zodiac: !p.zodiac }))
                    }
                  >
                    <Text
                      style={[
                        styles.privacyToggleText,
                        ownerDraftPrivacy.zodiac && styles.privacyToggleTextActive,
                      ]}
                    >
                      {ownerDraftPrivacy.zodiac ? '👁 Công khai' : '🔒 Đang ẩn'}
                    </Text>
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
                  <TouchableOpacity
                    style={styles.privacyToggleBtn}
                    onPress={() =>
                      setOwnerDraftPrivacy((p) => ({ ...p, mbti: !p.mbti }))
                    }
                  >
                    <Text
                      style={[
                        styles.privacyToggleText,
                        ownerDraftPrivacy.mbti && styles.privacyToggleTextActive,
                      ]}
                    >
                      {ownerDraftPrivacy.mbti ? '👁 Công khai' : '🔒 Đang ẩn'}
                    </Text>
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
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftEducation}
                  onChangeText={setOwnerDraftEducation}
                  placeholder="VD: ĐH Kiến Trúc TP.HCM"
                  placeholderTextColor="#A89E94"
                />

                <Text style={styles.fieldLabel}>Chuyên ngành học</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftMajor}
                  onChangeText={setOwnerDraftMajor}
                  placeholder="VD: Thiết kế Đồ họa"
                  placeholderTextColor="#A89E94"
                />

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
                <TextInput
                  style={styles.fieldInput}
                  value={ownerDraftOccupation}
                  onChangeText={setOwnerDraftOccupation}
                  placeholder="VD: UI/UX Designer"
                  placeholderTextColor="#A89E94"
                />

                {/* 9. Giới thiệu bản thân (Bio) */}
                <Text style={styles.fieldLabel}>Giới thiệu bản thân</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
                  multiline
                  value={ownerDraftBio}
                  onChangeText={setOwnerDraftBio}
                  placeholder="Chia sẻ về sở thích thú cưng của bạn..."
                  placeholderTextColor="#A89E94"
                />

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
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {/* Loài: Chó, Mèo, Khác */}
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
                      onPress={() => setNewPetSpecies(sp)}
                    >
                      <Text
                        style={[
                          styles.speciesChoiceText,
                          newPetSpecies === sp && { color: '#FFFFFF' },
                        ]}
                      >
                        {sp === 'Khác' ? 'Loài Khác' : `Loài ${sp}`}
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
                )}

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
                      <TouchableOpacity
                        style={[
                          styles.genderHalfBtn,
                          newPetGender === 'Đực' && styles.genderHalfBtnActive,
                        ]}
                        onPress={() => setNewPetGender('Đực')}
                      >
                        <Text
                          style={[
                            styles.genderHalfText,
                            newPetGender === 'Đực' && styles.genderHalfTextActive,
                          ]}
                        >
                          Đực
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
                  </View>

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
                    <TouchableOpacity
                      style={styles.addMiniBtn}
                      onPress={() => handleAddWeightToDraft(true)}
                    >
                      <Text style={styles.addMiniBtnText}>+ Thêm mốc</Text>
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
                    >
                      <Text style={styles.addMiniBtnText}>+ Thêm mũi tiêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Mô tả tính cách */}
                <Text style={styles.fieldLabel}>Mô tả tính cách & thói quen</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Thân thiện, ham ăn, quấn người..."
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
                      onPress={() => setEditPetSpeciesDraft(sp)}
                    >
                      <Text
                        style={[
                          styles.speciesChoiceText,
                          editPetSpeciesDraft === sp && { color: '#FFFFFF' },
                        ]}
                      >
                        {sp === 'Khác' ? 'Loài Khác' : `Loài ${sp}`}
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
                )}

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
                      <TouchableOpacity
                        style={[
                          styles.genderHalfBtn,
                          editPetGenderDraft === 'Đực' && styles.genderHalfBtnActive,
                        ]}
                        onPress={() => setEditPetGenderDraft('Đực')}
                      >
                        <Text
                          style={[
                            styles.genderHalfText,
                            editPetGenderDraft === 'Đực' && styles.genderHalfTextActive,
                          ]}
                        >
                          Đực
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

                {/* Mô tả */}
                <Text style={styles.fieldLabel}>Mô tả tính cách & thói quen</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  multiline
                  value={editPetBioDraft}
                  onChangeText={setEditPetBioDraft}
                  placeholder="Thân thiện, mê chạy bộ công viên..."
                  placeholderTextColor="#A89E94"
                />

                {/* Xóa hồ sơ thú cưng */}
                {pets.length > 1 && (
                  <TouchableOpacity
                    style={styles.deletePetInModalBtn}
                    onPress={handleDeletePetFromEdit}
                    activeOpacity={0.8}
                  >
                    <Feather name="trash-2" size={15} color="#C93B2B" />
                    <Text style={styles.deletePetInModalText}>
                      Xóa hồ sơ bé {editingPet.name}
                    </Text>
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
                  onPress={() => setIsChangingCoverModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Feather name="x" size={18} color="#7E6E60" />
                </TouchableOpacity>
              </View>

              <Text style={styles.cleanModalSubtitle}>
                Chọn ảnh bìa từ thư viện máy hoặc chọn phong cảnh bên dưới:
              </Text>

              <TouchableOpacity
                style={[styles.pickGalleryBtn, { backgroundColor: theme.primarySoft }]}
                onPress={handlePickCoverFromDevice}
                activeOpacity={0.85}
              >
                <Feather name="image" size={18} color={theme.primary} />
                <Text style={[styles.pickGalleryBtnText, { color: theme.primary }]}>
                  Chọn ảnh từ máy điện thoại
                </Text>
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
                <Image
                  source={{
                    uri: selectedPreviewPost.authorAvatar || ownerAvatarUrl,
                  }}
                  style={styles.postPreviewAvatar}
                />
                <View style={styles.postPreviewAuthorTextBox}>
                  <Text style={styles.postPreviewHandleText}>
                    @{selectedPreviewPost.authorHandle.replace('@', '')}
                  </Text>
                  <Text style={styles.postPreviewTimeAgoText}>Vừa xong · Công khai</Text>
                </View>

                <TouchableOpacity
                  style={styles.postPreviewCloseBtn}
                  onPress={() => setSelectedPreviewPost(null)}
                >
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Ảnh bài viết sạch sẽ, không bị text che phủ hình */}
              <View style={styles.postPreviewImageWrap}>
                <Image
                  source={{
                    uri: selectedPreviewPost.mediaUrls?.[0] || ownerAvatarUrl,
                  }}
                  style={styles.postPreviewImage}
                  resizeMode="cover"
                />
              </View>

              {/* Caption & Lượt thích đặt trang nhã PHÍA DƯỚI ảnh (Không che hình) */}
              <View style={styles.postPreviewBottomCaptionBox}>
                <View style={styles.postPreviewLikesLine}>
                  <Feather name="heart" size={14} color="#FF6F61" />
                  <Text style={styles.postPreviewLikesCountText}>
                    {1200 + (selectedPreviewPost.userReaction ? 1 : 0)} lượt thích
                  </Text>
                </View>
                <Text style={styles.postPreviewFullCaptionText}>
                  {selectedPreviewPost.content}
                </Text>
              </View>

              {/* Action Sheet tinh gọn: Nút Xem bài viết, Thích, Xóa khỏi bảng tin */}
              <View style={styles.postPreviewActionSheet}>
                {/* 1. Nút Xem bài viết mở toàn bộ Post Detail */}
                <TouchableOpacity
                  style={[styles.previewMenuRowItem, { backgroundColor: '#2C343E' }]}
                  onPress={() => {
                    const target = selectedPreviewPost;
                    setSelectedPreviewPost(null);
                    setActivePostDetail(target);
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="eye" size={17} color="#A3E4D7" />
                  <Text style={[styles.previewMenuRowText, { color: '#A3E4D7', fontWeight: '800' }]}>
                    Xem chi tiết bài viết (Bình luận & Thả tim)
                  </Text>
                </TouchableOpacity>

                {/* 2. Nút Thích bài viết */}
                <TouchableOpacity
                  style={styles.previewMenuRowItem}
                  onPress={() => handleTogglePostLike(selectedPreviewPost.id)}
                  activeOpacity={0.7}
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
                </TouchableOpacity>

                {/* 3. Nút Xóa khỏi bảng tin (Thay cho Gỡ khỏi lưới chính) */}
                <TouchableOpacity
                  style={[styles.previewMenuRowItem, { borderBottomWidth: 0 }]}
                  onPress={() => handleDeletePostConfirmed(selectedPreviewPost.id)}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={17} color="#FF6F61" />
                  <Text style={[styles.previewMenuRowText, { color: '#FF6F61' }]}>
                    Xóa khỏi bảng tin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
                  <Image
                    source={{ uri: activePostDetail.authorAvatar || ownerAvatarUrl }}
                    style={styles.postDetailAvatar}
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

                {/* Content */}
                <View style={styles.postDetailContentBox}>
                  <Text style={styles.postDetailCaption}>{activePostDetail.content}</Text>
                  <Text style={styles.postDetailTimeText}>{activePostDetail.createdAt} · Chia sẻ công khai</Text>
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
                          <TouchableOpacity
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
                          </View>
                        )}
                      </View>
                    </View>
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
                  <TextInput
                    style={styles.commentTextInput}
                    placeholder="Viết bình luận cho bài viết..."
                    placeholderTextColor="#A89E94"
                    value={commentInputText}
                    onChangeText={setCommentInputText}
                  />
                  <TouchableOpacity
                    style={[styles.sendCommentBtn, { backgroundColor: theme.primary }]}
                    onPress={handleSendComment}
                  >
                    <Feather name="send" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },

  /* TOP HEADER */
  topProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE4',
    minHeight: 52,
  },
  headerPillsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  headerPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  headerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#332B25',
  },
  headerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerAddPill: {
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
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
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
    paddingBottom: 40,
  },
  ownerCoverWrap: {
    width: '100%',
    height: 160,
    backgroundColor: '#EAE4DC',
    position: 'relative',
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
  },
  changeCoverBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* NOTE BUBBLE */
  noteBubbleAnchor: {
    alignItems: 'center',
    marginTop: -32,
    marginBottom: 4,
    zIndex: 10,
  },
  noteBubbleBox: {
    maxWidth: 240,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    alignItems: 'center',
    position: 'relative',
  },
  noteBubbleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C2520',
    textAlign: 'center',
  },
  noteBubbleTail: {
    position: 'absolute',
    bottom: -6,
    width: 10,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    backgroundColor: '#FAF7F2',
  },
  ownerAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarPlusBadge: {
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
  avatarSideBtnBox: {
    width: 36,
    alignItems: 'flex-end',
  },
  sleekEditPenBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  /* OWNER INFO */
  ownerInfoCenterBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  ownerFullNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1815',
    marginBottom: 4,
  },
  ownerJobTitleText: {
    fontSize: 13,
    color: '#7E6E60',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  ownerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ownerLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#605448',
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
    borderRadius: 12,
  },
  ownerBadgeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#655444',
  },

  /* STATS CARD */
  ownerStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statNumberText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1815',
  },
  statLabelText: {
    fontSize: 11,
    color: '#8E7F73',
    fontWeight: '600',
    marginTop: 2,
  },
  statDividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: '#F0EBE4',
  },

  /* MOMENTS */
  momentsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  momentsSubTabsBox: {
    flexDirection: 'row',
    gap: 16,
  },
  momentTabItem: {
    paddingVertical: 6,
    position: 'relative',
  },
  momentTabItemActive: {},
  momentTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E7F73',
  },
  momentTabTextActive: {
    color: '#1C1815',
    fontWeight: '900',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createMomentBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  momentsGridBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  gridThumbItem: {
    width: MOMENT_GRID_SIZE,
    height: MOMENT_GRID_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#EFEBE4',
    position: 'relative',
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
  },
  emptyMomentsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyMomentsText: {
    fontSize: 13,
    color: '#8E7F73',
    fontWeight: '600',
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
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 5,
  },
  petSpeciesPillBadge: {
    backgroundColor: 'rgba(28, 22, 18, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  petSpeciesPillText: {
    fontSize: 12,
    fontWeight: '800',
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
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  petFloatingLikeBtnActive: {
    backgroundColor: 'rgba(255, 111, 97, 0.35)',
    borderColor: '#FF6F61',
  },
  petFloatingLikeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  petFloatingEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 22, 18, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petGalleryDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    zIndex: 5,
  },
  petGalleryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  petGalleryDotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  nextPhotoMiniBtn: {
    padding: 3,
    marginLeft: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },

  /* ULTRA TRANSLUCENT CARD */
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
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  petCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  petCardMainName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  petBreedFullTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  petBreedFullText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  petSpecsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  specFrostedChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  specChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  specChipValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  expandToggleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    marginBottom: 10,
  },
  expandToggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  petExpandedScrollView: {
    maxHeight: 180,
    marginBottom: 10,
  },
  petCardBioText: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 10,
  },
  petHealthSectionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  petHealthSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  weightBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 70,
    paddingBottom: 2,
  },
  weightBarItem: {
    alignItems: 'center',
    gap: 3,
  },
  weightBarKgText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weightBarPill: {
    width: 20,
    borderRadius: 6,
    backgroundColor: '#A3E4D7',
  },
  weightBarMonthText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  vaccineCardItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
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
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  doseBadge: {
    backgroundColor: 'rgba(163, 228, 215, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#FFE5E2',
  },
  petFullWidthCtaBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAD8A0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FAD8A0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  petFullWidthCtaText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#28201A',
  },

  /* MODALS & BOTTOM SHEETS */
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cleanModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cleanModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cleanModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1815',
  },
  modalCloseBtn: {
    padding: 4,
  },
  cleanModalSubtitle: {
    fontSize: 12,
    color: '#8E7F73',
    lineHeight: 17,
    marginBottom: 14,
  },
  cleanTextInputArea: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: '#1C1815',
    minHeight: 75,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  cleanModalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cleanDeleteTextBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cleanDeleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C93B2B',
  },
  cleanSaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 16,
  },
  cleanSaveBtnText: {
    fontSize: 13,
    fontWeight: '800',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE4',
  },
  sheetHeaderTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1815',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A3F35',
    marginBottom: 5,
    marginTop: 8,
  },
  fieldLabelWithToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  privacyToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F5EFE8',
  },
  privacyToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E7F73',
  },
  privacyToggleTextActive: {
    color: '#1C1815',
  },
  fieldInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1C1815',
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#554A40',
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
    borderWidth: 1,
    borderColor: '#ECE6DF',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  speciesChoiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  twoInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderToggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    overflow: 'hidden',
  },
  genderHalfBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
  },
  genderHalfBtnActive: {
    backgroundColor: '#2C2520',
  },
  genderHalfText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#685D52',
  },
  genderHalfTextActive: {
    color: '#FFFFFF',
  },
  modalSubSectionBox: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  modalSubSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#332B25',
    marginBottom: 8,
  },
  weightRecordsMiniList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  weightRecordPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  weightRecordPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#332B25',
  },
  addMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addMiniBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2C2520',
    borderRadius: 10,
  },
  addMiniBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  miniVacItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
  },
  miniVacTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1815',
  },
  miniVacSub: {
    fontSize: 10,
    color: '#7E6E60',
    marginTop: 2,
  },
  addVacBlock: {
    marginTop: 6,
  },
  deletePetInModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFD9D4',
    borderRadius: 14,
    backgroundColor: '#FFF5F4',
    marginTop: 14,
    marginBottom: 6,
  },
  deletePetInModalText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C93B2B',
  },
  sheetPrimarySubmitBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  sheetPrimarySubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* COVER PRESETS MODAL */
  pickGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  pickGalleryBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  coverPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverPresetThumbItem: {
    width: (SCREEN_WIDTH - 80) / 2,
    height: 75,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  coverPresetThumbItemActive: {
    borderColor: '#FF6F61',
  },
  coverPresetImg: {
    width: '100%',
    height: '100%',
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
  },

  /* POST PREVIEW MODAL (Hình 2) */
  postPreviewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  postPreviewCardBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E2328',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  postPreviewAuthorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postPreviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3D444D',
  },
  postPreviewAuthorTextBox: {
    flex: 1,
    paddingHorizontal: 10,
  },
  postPreviewHandleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  postPreviewTimeAgoText: {
    fontSize: 11,
    color: '#A89E94',
    marginTop: 1,
  },
  postPreviewCloseBtn: {
    padding: 4,
  },
  postPreviewImageWrap: {
    width: '100%',
    height: 270,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#121518',
  },
  postPreviewImage: {
    width: '100%',
    height: '100%',
  },
  postPreviewBottomCaptionBox: {
    paddingVertical: 10,
  },
  postPreviewLikesLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  postPreviewLikesCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  postPreviewFullCaptionText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  postPreviewActionSheet: {
    marginTop: 6,
    backgroundColor: '#272D34',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewMenuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#323942',
  },
  previewMenuRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  },
  postDetailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE4',
  },
  postDetailAuthorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postDetailAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  postDetailAuthorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1815',
  },
  postDetailAuthorHandle: {
    fontSize: 11,
    color: '#8E7F73',
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
  },
  postDetailContentBox: {
    paddingVertical: 10,
  },
  postDetailCaption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C2520',
  },
  postDetailTimeText: {
    fontSize: 11,
    color: '#8E7F73',
    marginTop: 4,
  },
  postDetailReactionsBar: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0EBE4',
    marginVertical: 6,
  },
  reactionButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF7F2',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
  },
  postDetailCommentsBox: {
    paddingVertical: 10,
  },
  commentsListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1815',
    marginBottom: 10,
  },
  commentItemWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentBubble: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 14,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1815',
    marginBottom: 2,
  },
  commentContent: {
    fontSize: 13,
    lineHeight: 18,
    color: '#2C2520',
  },
  commentFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
    paddingLeft: 4,
  },
  commentTimeAgo: {
    fontSize: 11,
    color: '#8E7F73',
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentLikeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E7F73',
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
    flexDirection: 'row',
    gap: 8,
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
  },
  replyingNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
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
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1C1815',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
