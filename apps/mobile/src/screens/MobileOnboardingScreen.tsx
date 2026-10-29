import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';

const PAWTY_LOGO_FULL = require('../../assets/pawty-logo-full.png');
const PAWTY_ICON = require('../../assets/pawty-icon.png');

export const MobileOnboardingScreen: React.FC = () => {
  const {
    theme,
    ownerName,
    ownerHandle,
    ownerBio,
    loginOrRegister,
  } = useMobilePawty();

  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [phoneInput, setPhoneInput] = useState('0909 123 456');
  const [otpInput, setOtpInput] = useState('6868');
  const [fullNameInput, setFullNameInput] = useState('Mai Nguyễn');
  const [petNameInput, setPetNameInput] = useState('Lu');
  const [petSpeciesInput, setPetSpeciesInput] = useState<'Chó' | 'Mèo'>('Chó');
  const [petBreedInput, setPetBreedInput] = useState('Golden Retriever');
  const [petVaccinated, setPetVaccinated] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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
            <Image source={PAWTY_LOGO_FULL} style={styles.logoFull} resizeMode="contain" />
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

        {/* Single Device Security Banner */}
        <View style={styles.securityNoticeCard}>
          <Feather name="smartphone" size={16} color={theme.primary} />
          <Text style={styles.securityNoticeText}>
            Bảo mật 1 thiết bị: Tài khoản chỉ được đăng nhập trên 1 điện thoại tại một thời điểm. Khi đăng nhập ở máy mới, thiết bị cũ sẽ tự động đăng xuất.
          </Text>
        </View>

        {mode === 'welcome' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chào mừng bạn quay lại</Text>
            <Text style={styles.sectionSub}>
              Thiết bị này đã lưu phiên đăng nhập trước đó. Bạn có thể vào thẳng ứng dụng chỉ với một chạm.
            </Text>

            <TouchableOpacity
              style={[styles.savedAccountBox, { borderColor: theme.primary }]}
              onPress={() =>
                loginOrRegister({
                  name: ownerName,
                  phone: phoneInput,
                })
              }
            >
              <View style={[styles.savedAvatar, { backgroundColor: theme.primary }]}>
                <Feather name="user" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedName}>{ownerName}</Text>
                <Text style={styles.savedMeta} numberOfLines={1}>
                  {ownerHandle} · {ownerBio}
                </Text>
              </View>
              <View style={[styles.enterBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.enterBadgeText}>Vào thẳng</Text>
                <Feather name="arrow-right" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc sử dụng tài khoản khác</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => setMode('register')}
            >
              <Feather name="user-plus" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setMode('login')}
            >
              <Feather name="log-in" size={16} color="#4A3F35" />
              <Text style={styles.secondaryBtnText}>Đăng nhập bằng Số điện thoại</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'login' && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Đăng nhập tài khoản</Text>
              <TouchableOpacity onPress={() => setMode('welcome')}>
                <Text style={[styles.backLink, { color: theme.primary }]}>Quay lại</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại..."
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(140)}
            />

            <Text style={styles.inputLabel}>Mã xác thực OTP (4 số)</Text>
            <TextInput
              style={styles.input}
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="number-pad"
              placeholder="Nhập mã OTP..."
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(220)}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 8 }]}
              onPress={() => {
                Keyboard.dismiss();
                loginOrRegister({
                  name: ownerName,
                  phone: phoneInput,
                });
              }}
            >
              <Feather name="check" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Đăng nhập ngay (1 Thiết bị)</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'register' && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Tạo tài khoản mới</Text>
              <TouchableOpacity onPress={() => setMode('welcome')}>
                <Text style={[styles.backLink, { color: theme.primary }]}>Quay lại</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Họ và tên của bạn</Text>
            <TextInput
              style={styles.input}
              value={fullNameInput}
              onChangeText={setFullNameInput}
              placeholder="VD: Mai Nguyễn"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(120)}
            />

            <Text style={styles.inputLabel}>Số điện thoại đăng ký (Gắn duy nhất 1 thiết bị)</Text>
            <TextInput
              style={styles.input}
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="0909 123 456"
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(195)}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hồ sơ thú cưng đầu tiên (Tối đa 3 bé miễn phí)</Text>
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
                  setPetBreedInput('Golden Retriever');
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
                  setPetBreedInput('Mèo Anh Lông Ngắn');
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

            <Text style={styles.inputLabel}>Giống loài chi tiết</Text>
            <TextInput
              style={styles.input}
              value={petBreedInput}
              onChangeText={setPetBreedInput}
              placeholder="VD: Golden Retriever, Corgi..."
              placeholderTextColor="#B8AEA4"
              onFocus={() => scrollToOffset(440)}
            />

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
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 10 }]}
              onPress={() => {
                Keyboard.dismiss();
                loginOrRegister({
                  name: fullNameInput,
                  phone: phoneInput,
                  petName: petNameInput,
                  petSpecies: petSpeciesInput,
                  petBreed: petBreedInput,
                });
              }}
            >
              <Feather name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Hoàn tất & Vào ứng dụng</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C2520',
  },
  sectionSub: {
    fontSize: 13,
    color: '#8E8074',
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 14,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  savedAccountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
  },
  savedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
  },
  savedMeta: {
    fontSize: 12,
    color: '#8E8074',
    marginTop: 2,
  },
  enterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  enterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFE9E1',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A3968A',
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
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E0D5',
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
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E0D5',
    marginBottom: 8,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#C5B8AC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  vaccineToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  vaccineToggleSub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
});
