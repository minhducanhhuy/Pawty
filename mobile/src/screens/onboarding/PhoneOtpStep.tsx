import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Button, Card } from '../../components';
import { useTranslation } from '../../i18n';

interface PhoneOtpStepProps {
  step: 1 | 2;
  phone: string;
  setPhone: (v: string) => void;
  otpCode: string;
  setOtpCode: (v: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onSocialLogin: (provider: 'google' | 'apple') => void;
  loading: boolean;
}

export const PhoneOtpStep: React.FC<PhoneOtpStepProps> = ({
  step, phone, setPhone, otpCode, setOtpCode, onSendOtp, onVerifyOtp, onSocialLogin, loading,
}) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (step !== 2) return;
    setCountdown(120);
    const timer = setInterval(() => setCountdown((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [step]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require('../../../assets/pawty-logo-full.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{step === 1 ? t('onboarding.phone.title') : t('onboarding.otp.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.phone.subtitle')}</Text>
      </View>

      {step === 1 ? (
        <Card style={styles.formCard}>
          <Text style={styles.label}>Số điện thoại định danh (+84)</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.prefixBox}><Text style={styles.prefixText}>🇻🇳 +84</Text></View>
            <TextInput
              style={styles.input} value={phone} onChangeText={setPhone}
              keyboardType="phone-pad" placeholder="0908 123 456" placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <Button title={t('onboarding.phone.sendOtp')} onPress={onSendOtp} loading={loading} />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>HOẶC ĐĂNG NHẬP NHANH</Text>
            <View style={styles.line} />
          </View>

          <Button title={`🌐 ${t('onboarding.phone.google')}`} variant="outline" onPress={() => onSocialLogin('google')} style={{ marginBottom: SPACING.sm }} />
          <Button title={`🍎 ${t('onboarding.phone.apple')}`} variant="mint" onPress={() => onSocialLogin('apple')} />
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <Text style={styles.label}>Mã OTP 6 chữ số gửi tới {phone} ({countdown}s)</Text>
          <TextInput
            style={[styles.input, styles.otpInput]} value={otpCode} onChangeText={setOtpCode}
            keyboardType="number-pad" maxLength={6} placeholder="• • • • • •" placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.quickFillBtn} onPress={() => setOtpCode('888888')} activeOpacity={0.8}>
            <Text style={styles.quickFillText}>{t('onboarding.otp.quickFill')}</Text>
          </TouchableOpacity>
          <Button title={t('onboarding.otp.verify')} onPress={onVerifyOtp} loading={loading} />
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.md },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  logo: { width: 160, height: 64, marginBottom: SPACING.xs },
  title: { ...TYPOGRAPHY.h2, color: COLORS.coral, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, paddingHorizontal: 16 },
  formCard: { gap: SPACING.md },
  label: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  phoneInputRow: { flexDirection: 'row', gap: SPACING.sm },
  prefixBox: { backgroundColor: COLORS.creamWarm, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  prefixText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  input: { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  otpInput: { fontSize: 22, letterSpacing: 8, textAlign: 'center' },
  quickFillBtn: { backgroundColor: COLORS.mintLight, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.mintDark },
  quickFillText: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.textMuted },
});
