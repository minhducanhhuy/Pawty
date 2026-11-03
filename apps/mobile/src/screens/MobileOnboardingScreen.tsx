import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { MobileAnimatedLogo } from '../components/MobileAnimatedLogo';
import { DatePickerModal } from '../components/DatePickerModal';
import {
  POPULAR_DOG_BREEDS,
  POPULAR_CAT_BREEDS,
  calculatePetAgeFromBirthDate,
} from '../types/mobileTypes';

const PAWTY_LOGO_FULL = require('../../assets/pawty-logo-full.png');
const PAWTY_ICON = require('../../assets/pawty-icon.png');

export const MobileOnboardingScreen: React.FC = () => {
  const {
    theme,
    ownerName,
    ownerHandle,
    ownerBio,
    hasSavedSession,
    savedSessionIdentifier,
    bootAuthError,
    loginOrRegister,
    showToast,
  } = useMobilePawty();

  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'pet_setup'>(
    hasSavedSession ? 'welcome' : 'login'
  );
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields (Step 1)
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [petNameInput, setPetNameInput] = useState('');
  const [petSpeciesInput, setPetSpeciesInput] = useState<'Chó' | 'Mèo'>('Chó');
  const [petBreedInput, setPetBreedInput] = useState('');
  const [petVaccinated, setPetVaccinated] = useState(true);

  // Pet Setup fields (Step 2)
  const [petAvatarUri, setPetAvatarUri] = useState<string | null>(null);
  const [petGenderInput, setPetGenderInput] = useState<'Đực' | 'Cái'>('Đực');
  const [petIsNeutered, setPetIsNeutered] = useState(false);
  const [petBirthDateInput, setPetBirthDateInput] = useState<string>('');
  const [petWeightInput, setPetWeightInput] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Breed selector modal state
  const [isBreedPickerOpen, setIsBreedPickerOpen] = useState(false);
  const [breedSearchQuery, setBreedSearchQuery] = useState('');

  const currentBreedsList = useMemo(() => {
    return petSpeciesInput === 'Mèo' ? POPULAR_CAT_BREEDS : POPULAR_DOG_BREEDS;
  }, [petSpeciesInput]);

  const filteredBreeds = useMemo(() => {
    const q = breedSearchQuery.trim().toLowerCase();
    if (!q) return currentBreedsList;
    return currentBreedsList.filter((b) => b.toLowerCase().includes(q));
  }, [breedSearchQuery, currentBreedsList]);

  const [authError, setAuthError] = useState<string | null>(bootAuthError);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (bootAuthError) {
      setAuthError(bootAuthError);
    }
  }, [bootAuthError]);

  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardOpen(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToOffset = (yOffset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
    }, 180);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setAuthError(null);
    if (!identifierInput.trim()) {
      setAuthError('Vui lòng nhập Số điện thoại hoặc Tên đăng nhập.');
      return;
    }
    if (!passwordInput.trim()) {
      setAuthError('Vui lòng nhập Mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      await loginOrRegister({
        identifier: identifierInput.trim(),
        password: passwordInput.trim(),
      });
    } catch (err: any) {
      setAuthError(err.message || 'Số điện thoại / tên đăng nhập hoặc mật khẩu không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPetSetup = () => {
    Keyboard.dismiss();
    setAuthError(null);
    if (!fullNameInput.trim()) {
      setAuthError('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!phoneInput.trim()) {
      setAuthError('Vui lòng nhập Số điện thoại.');
      return;
    }
    if (!passwordInput.trim()) {
      setAuthError('Vui lòng nhập Mật khẩu.');
      return;
    }
    if (!petNameInput.trim()) {
      setAuthError('Vui lòng nhập Tên bé thú cưng.');
      return;
    }
    if (!petBreedInput.trim()) {
      setAuthError('Vui lòng chọn Giống loài cho bé.');
      return;
    }
    setMode('pet_setup');
  };

  const handlePickPetPhoto = async (fromCamera = false) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        quality: 0.5,
      };

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const rawUri = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setPetAvatarUri(rawUri);
      }
    } catch (err: any) {
      showToast('Không thể mở máy ảnh hoặc thư viện ảnh trên thiết bị.');
    }
  };

  const handleRegister = async (skipPetDetails = false) => {
    Keyboard.dismiss();
    setAuthError(null);
    if (!fullNameInput.trim()) {
      setAuthError('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!phoneInput.trim()) {
      setAuthError('Vui lòng nhập Số điện thoại.');
      return;
    }
    if (!passwordInput.trim()) {
      setAuthError('Vui lòng nhập Mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const weightNum = parseFloat(petWeightInput.replace(',', '.'));
      await loginOrRegister({
        isRegister: true,
        name: fullNameInput.trim(),
        phone: phoneInput.trim(),
        username: usernameInput.trim() || undefined,
        password: passwordInput.trim(),
        petName: petNameInput.trim() || 'Boss',
        petSpecies: petSpeciesInput,
        petBreed: petBreedInput.trim() || 'Chưa rõ',
        petGender: skipPetDetails ? 'Đực' : (petIsNeutered ? `${petGenderInput} (Đã triệt sản)` : petGenderInput),
        petBirthDate: skipPetDetails ? undefined : (petBirthDateInput || undefined),
        petWeightKg: skipPetDetails || isNaN(weightNum) ? undefined : weightNum,
        petAvatarUrl: skipPetDetails ? undefined : (petAvatarUri || undefined),
        petVaccinated: petVaccinated,
      });
    } catch (err: any) {
      const msg = err.message || 'Đăng ký không thành công. Vui lòng thử lại.';
      setAuthError(msg);
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 28}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardOpen && { paddingBottom: 240 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoCard}>
            <MobileAnimatedLogo width={160} />
          </View>
          <View style={[styles.badgeRow, { backgroundColor: theme.primarySoft }]}>
            <Image source={PAWTY_ICON} style={styles.smallIcon} resizeMode="contain" />
            <Text style={[styles.badgeText, { color: theme.primary }]}>
              Những bàn chân nhỏ đang tới
            </Text>
          </View>
          <Text style={styles.subtitle}>
            Mạng xã hội hình ảnh, kết nối bạn đi dạo và đặt lịch chăm sóc thú cưng quanh bạn.
          </Text>
        </View>

        {mode === 'welcome' && hasSavedSession && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chào mừng bạn quay lại</Text>
            <Text style={styles.sectionSub}>
              Thiết bị đã lưu phiên đăng nhập của bạn. Chạm vào tài khoản bên dưới để tiếp tục.
            </Text>

            {authError && (
              <View style={styles.errorBox}>
                <Feather name="alert-triangle" size={15} color="#D32F2F" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.savedAccountBox,
                { borderColor: theme.primary },
                isLoading && { opacity: 0.7 },
              ]}
              disabled={isLoading}
              onPress={async () => {
                setAuthError(null);
                setIsLoading(true);
                try {
                  await loginOrRegister({
                    identifier: savedSessionIdentifier || ownerHandle.replace(/^@/, ''),
                  });
                } catch (err: any) {
                  setAuthError(
                    err?.message ||
                      'Không thể kết nối Cơ sở dữ liệu PostgreSQL để đăng nhập.'
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <View style={[styles.savedAvatar, { backgroundColor: theme.primary }]}>
                <Feather name="user" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedName}>{ownerName || savedSessionIdentifier}</Text>
                <Text style={styles.savedMeta} numberOfLines={1}>
                  {ownerBio || 'Cư dân Pawty'}
                </Text>
              </View>
              <View style={[styles.enterBadge, { backgroundColor: theme.primary }]}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.enterBadgeText}>Vào thẳng</Text>
                    <Feather name="arrow-right" size={13} color="#FFFFFF" />
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc sử dụng tài khoản khác</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setAuthError(null);
                setMode('register');
              }}
            >
              <Feather name="user-plus" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setAuthError(null);
                setMode('login');
              }}
            >
              <Feather name="log-in" size={16} color="#4A3F35" />
              <Text style={styles.secondaryBtnText}>Đăng nhập bằng SĐT hoặc Tên tài khoản</Text>
            </TouchableOpacity>
          </View>
        )}

        {(mode === 'login' || (mode === 'welcome' && !hasSavedSession)) && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Đăng nhập tài khoản</Text>
              {hasSavedSession && (
                <TouchableOpacity onPress={() => {
                  setAuthError(null);
                  setMode('welcome');
                }}>
                  <Text style={[styles.backLink, { color: theme.primary }]}>Quay lại</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionSub}>
              Đăng nhập bằng Số điện thoại hoặc Tên đăng nhập và Mật khẩu của bạn.
            </Text>

            {authError && (
              <View style={styles.errorBox}>
                <Feather name="alert-triangle" size={15} color="#D32F2F" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Số điện thoại hoặc Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              value={identifierInput}
              onChangeText={setIdentifierInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Nhập số điện thoại hoặc tên đăng nhập"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(140)}
            />

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Nhập mật khẩu..."
                placeholderTextColor="#B8AEA4"
                onFocus={() => scrollToOffset(220)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#7A6E63"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary, marginTop: 8 },
                isLoading && { opacity: 0.7 },
              ]}
              disabled={isLoading}
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Đăng nhập</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { marginTop: 10 }]}
              onPress={() => {
                setAuthError(null);
                setMode('register');
              }}
            >
              <Feather name="user-plus" size={16} color="#4A3F35" />
              <Text style={styles.secondaryBtnText}>Chưa có tài khoản? Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'register' && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Tạo tài khoản mới</Text>
              <TouchableOpacity onPress={() => {
                setAuthError(null);
                setMode(hasSavedSession ? 'welcome' : 'login');
              }}>
                <Text style={[styles.backLink, { color: theme.primary }]}>Quay lại</Text>
              </TouchableOpacity>
            </View>

            {authError && (
              <View style={styles.errorBox}>
                <Feather name="alert-triangle" size={15} color="#D32F2F" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Họ và tên của bạn</Text>
            <TextInput
              style={styles.input}
              value={fullNameInput}
              onChangeText={setFullNameInput}
              placeholder="Nhập họ và tên của bạn"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(120)}
            />

            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại của bạn"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(170)}
            />

            <Text style={styles.inputLabel}>Tên tài khoản (Tùy chọn)</Text>
            <TextInput
              style={styles.input}
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Tên tài khoản (ví dụ: mai_nguyen)"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(220)}
            />

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Nhập mật khẩu..."
                placeholderTextColor="#B8AEA4"
                onFocus={() => scrollToOffset(270)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#7A6E63"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hồ sơ thú cưng đầu tiên (Tùy chọn)</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.inputLabel}>Loài thú cưng</Text>
            <View style={styles.speciesRow}>
              <TouchableOpacity
                style={[
                  styles.speciesChip,
                  petSpeciesInput === 'Chó' && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => {
                  setPetSpeciesInput('Chó');
                  if (!POPULAR_DOG_BREEDS.includes(petBreedInput)) {
                    setPetBreedInput('Golden Retriever');
                  }
                }}
              >
                <Feather
                  name="shield"
                  size={15}
                  color={petSpeciesInput === 'Chó' ? '#FFFFFF' : '#4A3F35'}
                />
                <Text
                  style={[
                    styles.speciesChipText,
                    petSpeciesInput === 'Chó' && { color: '#FFFFFF' },
                  ]}
                >
                  Loài Chó
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.speciesChip,
                  petSpeciesInput === 'Mèo' && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => {
                  setPetSpeciesInput('Mèo');
                  if (!POPULAR_CAT_BREEDS.includes(petBreedInput)) {
                    setPetBreedInput('Mèo Anh lông ngắn (BSH)');
                  }
                }}
              >
                <Feather
                  name="heart"
                  size={15}
                  color={petSpeciesInput === 'Mèo' ? '#FFFFFF' : '#4A3F35'}
                />
                <Text
                  style={[
                    styles.speciesChipText,
                    petSpeciesInput === 'Mèo' && { color: '#FFFFFF' },
                  ]}
                >
                  Loài Mèo
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tên thú cưng</Text>
            <TextInput
              style={styles.input}
              value={petNameInput}
              onChangeText={setPetNameInput}
              placeholder="VD: Lu"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(360)}
            />

            <Text style={styles.inputLabel}>Giống loài chi tiết (Chọn danh sách)</Text>
            <TouchableOpacity
              style={styles.breedSelectorBtn}
              activeOpacity={0.8}
              onPress={() => {
                Keyboard.dismiss();
                setBreedSearchQuery('');
                setIsBreedPickerOpen(true);
              }}
            >
              <Text
                style={[
                  styles.breedSelectorBtnText,
                  !petBreedInput && { color: '#B8AEA4' },
                ]}
              >
                {petBreedInput || `Chọn giống ${petSpeciesInput.toLowerCase()}...`}
              </Text>
              <Feather name="chevron-down" size={18} color="#7A6E63" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.vaccineToggleBox,
                petVaccinated && {
                  backgroundColor: '#EAF7F1',
                  borderColor: '#3E8E6C',
                },
              ]}
              onPress={() => setPetVaccinated(!petVaccinated)}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  petVaccinated && { backgroundColor: '#3E8E6C', borderColor: '#3E8E6C' },
                ]}
              >
                {petVaccinated && <Feather name="check" size={14} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vaccineToggleTitle}>
                  Thú cưng đã tiêm chủng & Phòng dại đầy đủ
                </Text>
                <Text style={styles.vaccineToggleSub}>
                  Dấu tích an toàn này hiển thị riêng trên hồ sơ của từng bé thú cưng
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary, marginTop: 10 },
              ]}
              onPress={handleProceedToPetSetup}
            >
              <Feather name="arrow-right-circle" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>
                Tiếp tục: Thiết lập hồ sơ Boss {petNameInput ? `"${petNameInput}"` : ''} ➜
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              disabled={isLoading}
              onPress={() => handleRegister(true)}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#4A3F35" />
              ) : (
                <Text style={styles.secondaryBtnText}>Tạo nhanh & Bỏ qua thiết lập chi tiết</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {mode === 'pet_setup' && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Hoàn tất hồ sơ Boss {petNameInput}</Text>
                <Text style={styles.sectionSub}>
                  Bước 2/2 · Thêm ảnh & thể trạng để bé sẵn sàng tỏa sáng trên Radar
                </Text>
              </View>
              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={[styles.backLink, { color: theme.primary }]}>Quay lại</Text>
              </TouchableOpacity>
            </View>

            {authError && (
              <View style={styles.errorBox}>
                <Feather name="alert-triangle" size={15} color="#D32F2F" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            {/* 1. Ảnh đại diện bé cưng */}
            <View style={styles.petSetupAvatarSection}>
              <View style={styles.petSetupAvatarWrap}>
                {petAvatarUri ? (
                  <Image source={{ uri: petAvatarUri }} style={styles.petSetupAvatarImg} />
                ) : (
                  <View style={styles.petSetupAvatarEmpty}>
                    <Feather name="camera" size={32} color={theme.primary} />
                    <Text style={styles.petSetupAvatarEmptyText}>Chưa có ảnh</Text>
                  </View>
                )}
                {petAvatarUri && (
                  <TouchableOpacity
                    style={styles.petSetupRemoveAvatarBtn}
                    onPress={() => setPetAvatarUri(null)}
                  >
                    <Feather name="x" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.petSetupPhotoActionsRow}>
                <TouchableOpacity
                  style={styles.petSetupPhotoBtn}
                  onPress={() => handlePickPetPhoto(false)}
                  activeOpacity={0.8}
                >
                  <Feather name="image" size={15} color="#4A3F35" />
                  <Text style={styles.petSetupPhotoBtnText}>Chọn ảnh</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.petSetupPhotoBtn}
                  onPress={() => handlePickPetPhoto(true)}
                  activeOpacity={0.8}
                >
                  <Feather name="camera" size={15} color="#4A3F35" />
                  <Text style={styles.petSetupPhotoBtnText}>Chụp ảnh</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Giới tính & Triệt sản */}
            <Text style={styles.inputLabel}>Giới tính của bé</Text>
            <View style={styles.speciesRow}>
              <TouchableOpacity
                style={[
                  styles.speciesChip,
                  petGenderInput === 'Đực' && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setPetGenderInput('Đực')}
              >
                <Text
                  style={[
                    styles.speciesChipText,
                    petGenderInput === 'Đực' && { color: '#FFFFFF' },
                  ]}
                >
                  ♂ Bé Đực
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.speciesChip,
                  petGenderInput === 'Cái' && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setPetGenderInput('Cái')}
              >
                <Text
                  style={[
                    styles.speciesChipText,
                    petGenderInput === 'Cái' && { color: '#FFFFFF' },
                  ]}
                >
                  ♀ Bé Cái
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.neuteredChip,
                petIsNeutered && { backgroundColor: 'rgba(255, 111, 97, 0.12)', borderColor: theme.primary },
              ]}
              onPress={() => setPetIsNeutered(!petIsNeutered)}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  petIsNeutered && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                {petIsNeutered && <Feather name="check" size={13} color="#FFFFFF" />}
              </View>
              <Text style={[styles.neuteredChipText, petIsNeutered && { color: theme.primary, fontWeight: '700' }]}>
                Bé đã triệt sản (Neutered / Spayed)
              </Text>
            </TouchableOpacity>

            {/* 3. Ngày sinh / Tuổi */}
            <Text style={styles.inputLabel}>Ngày sinh của bé (Tính tuổi tự động)</Text>
            <TouchableOpacity
              style={styles.breedSelectorBtn}
              activeOpacity={0.8}
              onPress={() => setIsDatePickerOpen(true)}
            >
              <Text
                style={[
                  styles.breedSelectorBtnText,
                  !petBirthDateInput && { color: '#B8AEA4' },
                ]}
              >
                {petBirthDateInput
                  ? `${petBirthDateInput}  ·  ${calculatePetAgeFromBirthDate(petBirthDateInput)}`
                  : 'Chạm để chọn ngày sinh cho bé...'}
              </Text>
              <Feather name="calendar" size={17} color="#7A6E63" />
            </TouchableOpacity>

            {/* 4. Cân nặng */}
            <Text style={styles.inputLabel}>Cân nặng của bé (kg)</Text>
            <TextInput
              style={styles.input}
              value={petWeightInput}
              onChangeText={setPetWeightInput}
              keyboardType="decimal-pad"
              placeholder="VD: 4.5 (kg)"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(350)}
            />

            {/* 5. Tiêm chủng Safe Pet */}
            <TouchableOpacity
              style={[
                styles.vaccineToggleBox,
                petVaccinated && {
                  backgroundColor: '#EAF7F1',
                  borderColor: '#3E8E6C',
                },
              ]}
              onPress={() => setPetVaccinated(!petVaccinated)}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  petVaccinated && { backgroundColor: '#3E8E6C', borderColor: '#3E8E6C' },
                ]}
              >
                {petVaccinated && <Feather name="check" size={14} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vaccineToggleTitle}>
                  Bé đã tiêm phòng dại & 7 bệnh đầy đủ
                </Text>
                <Text style={styles.vaccineToggleSub}>
                  Kích hoạt huy hiệu [✓ An tâm dạo chung] trên Radar
                </Text>
              </View>
            </TouchableOpacity>

            {/* Nút Hoàn tất */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary, marginTop: 12 },
                isLoading && { opacity: 0.7 },
              ]}
              disabled={isLoading}
              onPress={() => handleRegister(false)}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Hoàn tất & Khám phá Pawty 🐾</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Nút Bỏ qua */}
            <TouchableOpacity
              style={[styles.secondaryBtn, { marginTop: 8 }]}
              disabled={isLoading}
              onPress={() => handleRegister(true)}
            >
              <Text style={styles.secondaryBtnText}>Để sau, vào trang chính ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* BREED PICKER MODAL (SELECTOR DANH SÁCH GIỐNG THÚ CƯNG) */}
      <Modal
        visible={isBreedPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsBreedPickerOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.pickerModalOverlay}
        >
          <View style={styles.pickerModalContainer}>
            {/* Header */}
            <View style={styles.pickerModalHeader}>
              <View>
                <Text style={styles.pickerModalTitle}>
                  {petSpeciesInput === 'Chó' ? 'Chọn giống chó' : 'Chọn giống mèo'}
                </Text>
                <Text style={styles.pickerModalSub}>
                  Chọn từ danh mục phổ biến hoặc gõ tìm kiếm
                </Text>
              </View>
              <TouchableOpacity
                style={styles.pickerModalCloseBtn}
                onPress={() => setIsBreedPickerOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={18} color="#4A3F35" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.pickerSearchRow}>
              <Feather name="search" size={16} color="#8F8377" />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder={`Tìm kiếm tên giống ${petSpeciesInput.toLowerCase()}...`}
                placeholderTextColor="#A89E94"
                value={breedSearchQuery}
                onChangeText={setBreedSearchQuery}
                autoCorrect={false}
              />
              {breedSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setBreedSearchQuery('')}>
                  <Feather name="x-circle" size={16} color="#A89E94" />
                </TouchableOpacity>
              )}
            </View>

            {/* List options */}
            <ScrollView
              style={styles.pickerOptionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredBreeds.map((breed) => {
                const isSelected = petBreedInput === breed;
                return (
                  <TouchableOpacity
                    key={breed}
                    style={[
                      styles.pickerOptionItem,
                      isSelected && {
                        backgroundColor: '#FDF1EF',
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => {
                      setPetBreedInput(breed);
                      setIsBreedPickerOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        isSelected && { color: theme.primary, fontWeight: '700' },
                      ]}
                    >
                      {breed}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={18} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* If query not found, allow custom entry */}
              {breedSearchQuery.trim().length > 0 &&
                !currentBreedsList.some(
                  (b) => b.toLowerCase() === breedSearchQuery.trim().toLowerCase()
                ) && (
                  <TouchableOpacity
                    style={[styles.pickerOptionItem, { borderStyle: 'dashed', borderColor: theme.primary }]}
                    onPress={() => {
                      setPetBreedInput(breedSearchQuery.trim());
                      setIsBreedPickerOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.pickerOptionText,
                          { color: theme.primary, fontWeight: '700' },
                        ]}
                      >
                        Sử dụng tên: "{breedSearchQuery.trim()}"
                      </Text>
                      <Text style={{ fontSize: 11, color: '#8F8377', marginTop: 2 }}>
                        Giống thú cưng chưa có trong danh mục phổ biến
                      </Text>
                    </View>
                    <Feather name="plus-circle" size={18} color={theme.primary} />
                  </TouchableOpacity>
                )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DATE PICKER MODAL (BỘ CHỌN NGÀY SINH BOSS) */}
      <DatePickerModal
        visible={isDatePickerOpen}
        title="Chọn ngày sinh của bé"
        initialDate={petBirthDateInput}
        isPet={true}
        onConfirm={(d) => setPetBirthDateInput(d)}
        onClose={() => setIsDatePickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  logoCard: {
    width: 210,
    height: 82,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE9E1',
    marginBottom: 10,
  },
  logoFull: {
    width: 175,
    height: 64,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    marginBottom: 8,
  },
  smallIcon: {
    width: 18,
    height: 18,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    color: '#7A6E63',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  securityNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginBottom: 14,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#6C6055',
    lineHeight: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2520',
  },
  sectionSub: {
    fontSize: 13,
    color: '#7A6E63',
    lineHeight: 18,
    marginBottom: 16,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  savedAccountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: '#FAF7F2',
    marginBottom: 14,
  },
  savedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
  },
  savedMeta: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
  enterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  enterBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E0D5',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '600',
    color: '#A09387',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#F5F1EB',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E0D5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2C2520',
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E0D5',
    borderRadius: 14,
    marginBottom: 12,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2C2520',
  },
  eyeBtn: {
    padding: 6,
  },
  errorBox: {
    backgroundColor: '#FFECEB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  hintBox: {
    backgroundColor: '#F3FBF8',
    borderColor: '#A3E4D7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E6F56',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#267359',
    lineHeight: 16,
  },
  speciesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  speciesChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E0D5',
    backgroundColor: '#FAF7F2',
  },
  speciesChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3F35',
  },
  vaccineToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E0D5',
    backgroundColor: '#FAF7F2',
    marginVertical: 6,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#B8AEA4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  vaccineToggleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
  },
  vaccineToggleSub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
  breedSelectorBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E0D5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breedSelectorBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2520',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pickerModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1815',
  },
  pickerModalSub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
  },
  pickerModalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0D5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2520',
    padding: 0,
  },
  pickerOptionsList: {
    maxHeight: 360,
  },
  pickerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0EAE1',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#2C2520',
    fontWeight: '500',
  },
  /* PET SETUP STEP 2 STYLES */
  petSetupAvatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  petSetupAvatarWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    position: 'relative',
    marginBottom: 10,
  },
  petSetupAvatarImg: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2.5,
    borderColor: '#FF6F61',
  },
  petSetupAvatarEmpty: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: '#FF6F61',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 111, 97, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  petSetupAvatarEmptyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6F61',
  },
  petSetupRemoveAvatarBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6F61',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petSetupPhotoActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  petSetupPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F1EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E0D5',
  },
  petSetupPhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
  },
  neuteredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0D5',
    backgroundColor: '#FAF7F2',
    marginTop: 8,
    marginBottom: 14,
  },
  neuteredChipText: {
    fontSize: 13,
    color: '#4A3F35',
    fontWeight: '600',
  },
});
