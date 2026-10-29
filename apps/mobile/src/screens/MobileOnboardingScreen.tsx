import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { PAWTY_COLORS } from '../theme/colors';

const WELCOME_SLIDES = [
  {
    emoji: '🏠🐾',
    title: 'Quản lý việc chăm Boss cùng gia đình',
    desc: 'Phân công việc cho ăn, dắt dạo, đi khám và cập nhật tức thì trong Vòng chăm sóc (Pawty Circle).',
  },
  {
    emoji: '📸💬',
    title: 'Mạng xã hội & Cộng đồng thú cưng',
    desc: 'Lưu giữ khoảnh khắc bựa của Boss, hỏi đáp cùng Bác sĩ thú y xác minh và kết nối hội nhóm quanh bạn.',
  },
  {
    emoji: '📍✨',
    title: 'Hẹn dắt dạo Trung điểm & Dịch vụ Nội khu',
    desc: 'Quét Radar PostGIS tìm bạn đi dạo đã tiêm phòng đầy đủ và đặt lịch Grooming/Spa chỉ với 1 chạm.',
  },
];

export const MobileOnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useMobilePawty();

  const [step, setStep] = useState<'welcome' | 'otp' | 'owner' | 'pet_1' | 'pet_2' | 'pet_3'>('welcome');
  const [slideIdx, setSlideIdx] = useState(0);

  const [phone, setPhone] = useState('0912 345 678');
  const [otp, setOtp] = useState('1234');
  const [ownerName, setOwnerName] = useState('Mai Nguyễn');
  const [neighborhood, setNeighborhood] = useState('Vinhomes Grand Park - Khu Rainbow');

  const [petName, setPetName] = useState('Bông');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('Corgi Pembroke');
  const [weightKg, setWeightKg] = useState('11.5');
  const [vaccinatedFull, setVaccinatedFull] = useState(true);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    'Thân thiện với chó nhỏ',
    'Đi vệ sinh đúng chỗ',
  ]);
  const [selectedCautions, setSelectedCautions] = useState<string[]>([
    'Hay đuổi chim bồ câu',
  ]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandHeader}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>P</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>Pawty Super App</Text>
          <Text style={styles.brandSub}>Onboarding 4 Bước & Sổ Tiêm Điện Tử</Text>
        </View>
      </View>

      {step === 'welcome' && (
        <View style={styles.card}>
          <Text style={styles.slideEmoji}>{WELCOME_SLIDES[slideIdx].emoji}</Text>
          <Text style={styles.title}>{WELCOME_SLIDES[slideIdx].title}</Text>
          <Text style={styles.subtitle}>{WELCOME_SLIDES[slideIdx].desc}</Text>

          <View style={styles.dotsRow}>
            {WELCOME_SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, slideIdx === idx && styles.dotActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (slideIdx < WELCOME_SLIDES.length - 1) {
                setSlideIdx(slideIdx + 1);
              } else {
                setStep('otp');
              }
            }}
          >
            <Text style={styles.primaryBtnText}>
              {slideIdx < WELCOME_SLIDES.length - 1 ? 'Tiếp tục →' : 'Bắt đầu Định danh SĐT →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'otp' && (
        <View style={styles.card}>
          <Text style={styles.stepTag}>BƯỚC 1/4 — ĐỊNH DANH CHỐNG BÙNG KÈO</Text>
          <Text style={styles.title}>Xác thực Số điện thoại</Text>
          <Text style={styles.subtitle}>
            Bắt buộc xác thực OTP để đảm bảo cộng đồng nuôi thú cưng văn minh, an toàn.
          </Text>

          <Text style={styles.label}>Số điện thoại Việt Nam</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="0912 345 678"
          />

          <Text style={styles.label}>Mã xác thực OTP (4 chữ số)</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="1234"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('owner')}>
            <Text style={styles.primaryBtnText}>Xác nhận OTP & Tiếp tục →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'owner' && (
        <View style={styles.card}>
          <Text style={styles.stepTag}>BƯỚC 2/4 — HỒ SƠ CHỦ NUÔI (SEN)</Text>
          <Text style={styles.title}>Thông tin của bạn</Text>
          <Text style={styles.subtitle}>
            Pawty chỉ hiển thị tên cụm chung cư/khu phố, tuyệt đối bảo mật số căn hộ.
          </Text>

          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} />

          <Text style={styles.label}>Cụm chung cư / Khu dân cư</Text>
          <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('pet_1')}>
            <Text style={styles.primaryBtnText}>Tiếp tục tạo Hồ sơ Boss →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'pet_1' && (
        <View style={styles.card}>
          <Text style={styles.stepTag}>BƯỚC 3/4 — THÔNG TIN CƠ BẢN CỦA BOSS</Text>
          <Text style={styles.title}>Boss nhà bạn là Chó hay Mèo?</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.choiceBtn, species === 'dog' && styles.choiceBtnActive]}
              onPress={() => {
                setSpecies('dog');
                setBreed('Corgi Pembroke');
              }}
            >
              <Text style={[styles.choiceText, species === 'dog' && styles.choiceTextActive]}>
                🐶 Cún cưng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.choiceBtn, species === 'cat' && styles.choiceBtnActive]}
              onPress={() => {
                setSpecies('cat');
                setBreed('Mèo Anh Lông Ngắn');
              }}
            >
              <Text style={[styles.choiceText, species === 'cat' && styles.choiceTextActive]}>
                🐱 Mèo cưng
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tên của Boss</Text>
          <TextInput style={styles.input} value={petName} onChangeText={setPetName} />

          <Text style={styles.label}>Giống (Breed)</Text>
          <TextInput style={styles.input} value={breed} onChangeText={setBreed} />

          <Text style={styles.label}>Cân nặng (kg)</Text>
          <TextInput
            style={styles.input}
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('pet_2')}>
            <Text style={styles.primaryBtnText}>Tiếp tục: Sổ tiêm điện tử →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'pet_2' && (
        <View style={styles.card}>
          <Text style={styles.stepTag}>BƯỚC 3.2 — AN TOÀN SỨC KHỎE (SAFE PET)</Text>
          <Text style={styles.title}>Trạng thái Tiêm chủng</Text>
          <Text style={styles.subtitle}>
            Boss đã tiêm đủ Vắc-xin 7 bệnh (hoặc 4 bệnh mèo) & Phòng dại sẽ được cấp huy hiệu Safe Pet Xanh Mint.
          </Text>

          <TouchableOpacity
            style={[styles.mintOption, vaccinatedFull && styles.mintOptionActive]}
            onPress={() => setVaccinatedFull(true)}
          >
            <Text style={styles.mintOptionTitle}>🟢 Đã tiêm phòng đầy đủ (Cấp huy hiệu Safe Pet)</Text>
            <Text style={styles.mintOptionSub}>Đủ điều kiện tham gia Radar Hẹn Dắt Dạo an toàn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mintOption, !vaccinatedFull && styles.mintOptionActive]}
            onPress={() => setVaccinatedFull(false)}
          >
            <Text style={styles.mintOptionTitle}>🟡 Đang tiêm hoặc cần nhắc lịch tiêm</Text>
            <Text style={styles.mintOptionSub}>Pawty Care sẽ tự động nhắc lịch mũi tiêm kế tiếp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('pet_3')}>
            <Text style={styles.primaryBtnText}>Tiếp tục: Thói quen & Lưu ý →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'pet_3' && (
        <View style={styles.card}>
          <Text style={styles.stepTag}>BƯỚC 4/4 — PHÒNG TRÁNH CẮN NHAU</Text>
          <Text style={styles.title}>Thói quen tốt & Cần lưu ý</Text>
          <Text style={styles.subtitle}>
            Minh bạch hành vi giúp các Sen chủ động giữ khoảng cách an toàn khi gặp mặt ngoài công viên.
          </Text>

          <Text style={styles.label}>Thói quen tốt (Chạm để chọn)</Text>
          <View style={styles.chipsWrap}>
            {['Thân thiện với chó nhỏ', 'Đi vệ sinh đúng chỗ', 'Nghe lệnh ngồi/đợi', 'Không sủa thang máy'].map(
              (item) => {
                const active = selectedHabits.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active && styles.chipMintActive]}
                    onPress={() => toggleItem(selectedHabits, setSelectedHabits, item)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextMintActive]}>
                      ✓ {item}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <Text style={styles.label}>Cần lưu ý (Phòng tránh xung đột)</Text>
          <View style={styles.chipsWrap}>
            {['Hay đuổi chim bồ câu', 'Giật mình khi nghe còi xe tải', 'Giữ đồ ăn/đồ chơi', 'Sợ người lạ 10 phút đầu'].map(
              (item) => {
                const active = selectedCautions.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active && styles.chipAmberActive]}
                    onPress={() => toggleItem(selectedCautions, setSelectedCautions, item)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextAmberActive]}>
                      ⚠️ {item}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              completeOnboarding({
                phone,
                ownerName,
                neighborhood,
                petName,
                species,
                breed,
                weightKg: parseFloat(weightKg) || 11.5,
                vaccinatedFull,
                goodHabits: selectedHabits,
                cautions: selectedCautions,
              })
            }
          >
            <Text style={styles.primaryBtnText}>Hoàn tất & Vào Siêu Ứng Dụng Pawty 🎉</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAWTY_COLORS.cream },
  content: { padding: 20, paddingBottom: 48 },
  brandHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  brandTitle: { fontSize: 20, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  brandSub: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 2 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  slideEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  stepTag: {
    fontSize: 11,
    fontWeight: '800',
    color: PAWTY_COLORS.coral,
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: '800', color: PAWTY_COLORS.charcoal, marginBottom: 8 },
  subtitle: { fontSize: 14, color: PAWTY_COLORS.slate, lineHeight: 20, marginBottom: 16 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  dotActive: { width: 24, backgroundColor: PAWTY_COLORS.coral },
  label: { fontSize: 13, fontWeight: '700', color: PAWTY_COLORS.charcoal, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: PAWTY_COLORS.cream,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: PAWTY_COLORS.charcoal,
  },
  row: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  choiceBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAWTY_COLORS.cream,
  },
  choiceBtnActive: {
    backgroundColor: PAWTY_COLORS.coralSoft,
    borderColor: PAWTY_COLORS.coral,
  },
  choiceText: { fontSize: 14, fontWeight: '700', color: PAWTY_COLORS.slate },
  choiceTextActive: { color: PAWTY_COLORS.coral },
  mintOption: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    marginBottom: 10,
    backgroundColor: PAWTY_COLORS.cream,
  },
  mintOptionActive: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderColor: PAWTY_COLORS.mintDark,
  },
  mintOptionTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  mintOptionSub: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    backgroundColor: PAWTY_COLORS.cream,
  },
  chipMintActive: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderColor: PAWTY_COLORS.mintDark,
  },
  chipAmberActive: {
    backgroundColor: PAWTY_COLORS.amberSoft,
    borderColor: PAWTY_COLORS.amber,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.slate },
  chipTextMintActive: { color: PAWTY_COLORS.mintDark },
  chipTextAmberActive: { color: '#B45309' },
  primaryBtn: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

