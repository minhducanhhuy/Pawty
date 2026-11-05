import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '../../components/FeatherIcon';

interface TinderLocationGateProps {
  mode: 'prompt' | 'denied';
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  isLoading?: boolean;
}

export const TinderLocationGate: React.FC<TinderLocationGateProps> = ({
  mode,
  onRequestPermission,
  onOpenSettings,
  isLoading = false,
}) => {
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top Content: Title & Subtitle */}
      <View style={styles.topSection}>
        <Text style={styles.title}>
          {mode === 'prompt' ? 'Bạn có sống ở khu vực này không?' : 'Không thể kết nối'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'prompt'
            ? 'Mở cài đặt địa điểm để xem có những ai ở quanh khu vực của bạn. Bạn sẽ không thể tìm bạn dắt cún nếu không chia sẻ thông tin này.'
            : 'Để tìm bạn dắt cún quanh bạn, Pawty cần bạn bật vị trí thiết bị để chúng tôi có thể hiển thị những ai đang ở xung quanh.'}
        </Text>
      </View>

      {/* Center Illustration: Large Circle with Location Pin */}
      <View style={styles.centerSection}>
        {/* Outer glowing ripple ring */}
        <View style={styles.outerRippleRing} />
        <View style={styles.middleRippleRing} />

        {/* Center circular surface */}
        <View style={styles.circleContainer}>
          <View style={[styles.pinBackground, mode === 'denied' && styles.pinBackgroundDenied]}>
            <Feather
              name={mode === 'prompt' ? 'map-pin' : 'alert-triangle'}
              size={52}
              color={mode === 'prompt' ? '#FF6F61' : '#F59E0B'}
            />
          </View>
        </View>
      </View>

      {/* Bottom Action Section: CTA & Helper Link */}
      <View style={styles.bottomSection}>
        {mode === 'prompt' ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.88}
              onPress={onRequestPermission}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Cho phép</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helperLinkButton}
              activeOpacity={0.7}
              onPress={() => setIsPrivacyModalVisible(true)}
            >
              <Text style={styles.helperLinkText}>
                Thông tin địa điểm của bạn được sử dụng thế nào?
              </Text>
              <View style={styles.helperIcon}>
                <Feather name="chevron-down" size={16} color="#1C1815" />
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.88}
              onPress={onOpenSettings}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>Mở mục Cài đặt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helperLinkButton}
              activeOpacity={0.7}
              onPress={onRequestPermission}
            >
              <Text style={styles.secondaryRetryText}>Thử kiểm tra lại quyền vị trí</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Privacy Policy Bottom Sheet / Modal */}
      <Modal
        visible={isPrivacyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIconContainer}>
                <Feather name="shield" size={24} color="#FF6F61" />
              </View>
              <Text style={styles.modalTitle}>Bảo mật vị trí tại Pawty</Text>
              <TouchableOpacity
                onPress={() => setIsPrivacyModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.privacyItem}>
                <View style={styles.itemIconCircle}>
                  <Feather name="compass" size={18} color="#FF6F61" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Tính khoảng cách tương đối</Text>
                  <Text style={styles.itemDescription}>
                    Pawty dùng vị trí thiết bị để tính khoảng cách đường chim bay (ví dụ: "Cách bạn 450m")
                    để ưu tiên hiển thị các Boss và Sen ở gần bạn nhất.
                  </Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <View style={styles.itemIconCircle}>
                  <Feather name="eye-off" size={18} color="#FF6F61" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Tuyệt đối không lộ địa chỉ nhà</Text>
                  <Text style={styles.itemDescription}>
                    Chúng tôi không bao giờ chia sẻ số nhà, số tầng, căn hộ hay vị trí GPS thời gian thực
                    cụ thể của bạn cho bất kỳ người dùng nào khác.
                  </Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <View style={styles.itemIconCircle}>
                  <Feather name="globe" size={18} color="#FF6F61" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Gợi ý điểm hẹn dạo công cộng</Text>
                  <Text style={styles.itemDescription}>
                    Tọa độ được dùng để tự động tính trung điểm và đề xuất các công viên, quán cà phê
                    thân thiện với thú cưng an toàn nhất cho cả hai.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              activeOpacity={0.85}
              onPress={() => setIsPrivacyModalVisible(false)}
            >
              <Text style={styles.modalDoneButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1815',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  centerSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    width: 240,
    height: 240,
  },
  outerRippleRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#FFE9E4',
    opacity: 0.5,
  },
  middleRippleRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFDDD6',
    opacity: 0.7,
  },
  circleContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pinBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF1EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBackgroundDenied: {
    backgroundColor: '#FEF3C7',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#FF6F61',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  helperLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  helperLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1815',
    textAlign: 'center',
    lineHeight: 20,
  },
  helperIcon: {
    marginLeft: 6,
  },
  secondaryRetryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6F61',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: '#1C1815',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalBodyContent: {
    gap: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1815',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  modalDoneButton: {
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#FF6F61',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
