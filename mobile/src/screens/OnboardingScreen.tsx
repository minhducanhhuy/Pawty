import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { PhoneOtpStep } from './onboarding/PhoneOtpStep';
import { SenBossStep } from './onboarding/SenBossStep';
import { api } from '../api/endpoints';
import { useAuth, useActivePet, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { Species } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { loginWithOtp, loginWithSocial, updateUser, setHasCompletedOnboarding } = useAuth();
  const { addPet } = useActivePet();
  const { showToast } = useAppConfig();
  const { resetToMain } = useNavigation();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phone, setPhone] = useState('0908123456');
  const [otpCode, setOtpCode] = useState('888888');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.trim().length < 9) {
      showToast('Vui lòng nhập số điện thoại hợp lệ!', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.sendOtp(phone.trim());
      setStep(2);
      showToast('Đã gửi mã OTP (Sandbox: 888888)', 'success');
    } catch (err) {
      console.error('Send OTP error:', err);
      showToast('Không thể gửi OTP, vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await loginWithOtp(phone.trim(), otpCode.trim() || '888888', referralCode.trim() || undefined);
      setStep(3);
    } catch (err) {
      console.error('Verify OTP error:', err);
      showToast('Mã OTP không hợp lệ!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      await loginWithSocial(provider, phone.trim() || '0908123456');
      setStep(3);
      showToast(`Đã xác thực ${provider.toUpperCase()} + SĐT`, 'success');
    } catch (err) {
      console.error('Social login error:', err);
      showToast('Lỗi đăng nhập mạng xã hội', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNextSen = async (fullName: string, condoComplex: string, refCode: string) => {
    setReferralCode(refCode);
    await updateUser({ fullName, condoComplex });
    if (refCode.trim()) {
      showToast('🎁 Áp dụng mã giới thiệu: Tặng +7 ngày VIP!', 'success');
    }
    setStep(4);
  };

  const handleFinishBoss = async (bossData: {
    name: string;
    species: Species;
    breed: string;
    weightKg: number;
    isVaccinated: boolean;
    tags: string[];
    habitsGood: string[];
    habitsBad: string[];
    bio: string;
  }) => {
    setLoading(true);
    try {
      await addPet(bossData);
      setHasCompletedOnboarding(true);
      showToast(`Chào mừng Boss ${bossData.name} gia nhập Pawty! 🎉`, 'success');
      resetToMain('Radar');
    } catch (err) {
      console.error('Create boss error:', err);
      showToast('Không thể tạo hồ sơ Boss.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.stepIndicatorRow}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
        ))}
        <Text style={styles.stepText}>Bước {step}/4</Text>
      </View>

      {step === 1 || step === 2 ? (
        <PhoneOtpStep
          step={step}
          phone={phone}
          setPhone={setPhone}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
          onSocialLogin={handleSocial}
          loading={loading}
        />
      ) : (
        <SenBossStep
          step={step}
          onNextSen={handleNextSen}
          onFinishBoss={handleFinishBoss}
          loading={loading}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.lg, paddingBottom: 48 },
  stepIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  stepDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.coral },
  stepText: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontWeight: '800', marginLeft: 6 },
});
