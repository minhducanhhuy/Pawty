import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

interface IntroScreenProps {
  onSuccess: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onSuccess }) => {
  const { loginWithGoogle, loginWithUsernamePassword, registerWithUsernamePassword, isLoading } = useAuth();
  const { t } = useTranslation();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [condoComplex, setCondoComplex] = useState('Vinhomes Central Park');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Logo animation
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      setAuthError(null);
      await loginWithGoogle('sen.boss@gmail.com', 'Chủ Nuôi Pawty', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
      onSuccess();
    } catch (err: any) {
      setAuthError(err?.message || 'Đăng nhập Google không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUsernameAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setSubmitting(true);
    setAuthError(null);
    try {
      if (authMode === 'register') {
        if (!fullName.trim()) {
          setAuthError('Vui lòng nhập họ và tên của bạn.');
          setSubmitting(false);
          return;
        }
        await registerWithUsernamePassword(username, password, fullName, condoComplex);
      } else {
        await loginWithUsernamePassword(username, password);
      }
      setShowAuthModal(false);
      onSuccess();
    } catch (err: any) {
      setAuthError(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: 'center' }}>
          <Image
            source={require('../../assets/pawty-icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Pawty</Text>
          <Text style={styles.tagline}>Quẹt thẻ · Tìm bạn dắt dạo · Chung cư yêu Boss</Text>
        </Animated.View>

        {/* 3 Core Highlights (Minimal & Visual) */}
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightPill}>
            <Text style={styles.highlightEmoji}>🐾</Text>
            <Text style={styles.highlightText}>Tìm bạn cún gần toà nhà (500m - 3km)</Text>
          </View>
          <View style={styles.highlightPill}>
            <Text style={styles.highlightEmoji}>🛡️</Text>
            <Text style={styles.highlightText}>Sổ tiêm Safe Pet đã xác minh an toàn</Text>
          </View>
          <View style={styles.highlightPill}>
            <Text style={styles.highlightEmoji}>☕</Text>
            <Text style={styles.highlightText}>Hẹn dạo trung điểm tại quán cafe thân thiện</Text>
          </View>
        </View>
      </View>

      {/* CTA Bottom Section */}
      <View style={styles.ctaSection}>
        {/* Google SSO Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <View style={styles.googleIconBadge}>
            <Text style={styles.googleGText}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Tiếp tục với Google</Text>
        </TouchableOpacity>

        {/* Username & Password Button */}
        <TouchableOpacity
          style={styles.primaryAuthBtn}
          onPress={() => {
            setAuthError(null);
            setShowAuthModal(true);
          }}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryAuthBtnText}>Tài khoản Username & Mật khẩu</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Quy chuẩn an toàn thú cưng Pawty.
        </Text>
      </View>

      {/* Modal Đăng nhập / Đăng ký Username & Password */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAuthModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            {/* Header Tabs */}
            <View style={styles.modalHeader}>
              <View style={styles.tabSwitch}>
                <TouchableOpacity
                  style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
                  onPress={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                >
                  <Text style={[styles.tabBtnText, authMode === 'register' && styles.tabBtnTextActive]}>
                    Tạo tài khoản
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
                  onPress={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                >
                  <Text style={[styles.tabBtnText, authMode === 'login' && styles.tabBtnTextActive]}>
                    Đăng nhập
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowAuthModal(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              {authError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              )}

              {authMode === 'register' && (
                <>
                  <Text style={styles.inputLabel}>Họ và tên của bạn</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="VD: Nguyễn Văn Sen"
                    placeholderTextColor="#A8A29E"
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <Text style={styles.inputLabel}>Chung cư / Khu vực sinh sống</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="VD: Vinhomes Central Park, Masteri..."
                    placeholderTextColor="#A8A29E"
                    value={condoComplex}
                    onChangeText={setCondoComplex}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Tên đăng nhập (Username)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="VD: sen_bo123"
                placeholderTextColor="#A8A29E"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />

              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleUsernameAuth}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {authMode === 'register' ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoIcon: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  brandTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 40,
    color: '#FF6F61',
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 15,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  highlightsContainer: {
    marginTop: 36,
    width: '100%',
    gap: 12,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3E8E2',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  highlightEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  highlightText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#44403C',
    flex: 1,
  },
  ctaSection: {
    width: '100%',
    gap: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  googleIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleGText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  googleBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#1C1917',
  },
  primaryAuthBtn: {
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#FF6F61',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  primaryAuthBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  disclaimerText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#A8A29E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F4',
    borderRadius: 20,
    padding: 4,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#78716C',
  },
  tabBtnTextActive: {
    color: '#FF6F61',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#78716C',
    fontWeight: 'bold',
  },
  formContent: {
    paddingBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#B91C1C',
  },
  inputLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#44403C',
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Nunito-SemiBold',
    color: '#1C1917',
  },
  submitBtn: {
    backgroundColor: '#FF6F61',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FF6F61',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
