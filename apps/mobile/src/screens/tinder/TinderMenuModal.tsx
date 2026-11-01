import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '../../components/FeatherIcon';

interface TinderMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onRewind: () => void;
  canRewind?: boolean;
  onOpenLikesYou: () => void;
  onOpenTinderSetup: () => void;
  likedYouCount: number;
}

export const TinderMenuModal: React.FC<TinderMenuModalProps> = ({
  visible,
  onClose,
  onRewind,
  canRewind = false,
  onOpenLikesYou,
  onOpenTinderSetup,
  likedYouCount,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.sheet, { paddingBottom: bottomInset + 16 }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tùy chọn Kết nối</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={18} color="#5C5046" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItemsList}>
            {/* 1. Hoàn tác lượt quẹt (Miễn phí cho mọi thành viên) */}
            <TouchableOpacity
              style={[styles.menuItem, !canRewind && { opacity: 0.5 }]}
              onPress={() => {
                onClose();
                onRewind();
              }}
              disabled={!canRewind}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: canRewind ? '#FEF3C7' : '#F0EBE3' }]}>
                <Feather name="rotate-ccw" size={18} color={canRewind ? '#D97706' : '#8C827A'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, !canRewind && { color: '#8C827A' }]}>
                  Hoàn tác lượt quẹt
                </Text>
                <Text style={styles.itemDesc}>
                  {canRewind
                    ? 'Quay lại thẻ ứng viên vừa lướt qua'
                    : 'Chưa có lượt quẹt nào để hoàn tác'}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={canRewind ? '#A89B8C' : '#D1C9BE'} />
            </TouchableOpacity>

            {/* 2. Xem ai đã thích mình (Mở khóa hoàn toàn miễn phí) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenLikesYou();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#FFEAE6' }]}>
                <Feather name="heart" size={18} color="#FF6F61" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>Xem ai đã thích mình</Text>
                  {likedYouCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{likedYouCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemDesc}>
                  {likedYouCount > 0
                    ? `Có ${likedYouCount} thành viên đã thích bạn — Nhấn để xem & Match ngay`
                    : 'Chưa có lượt thích mới nào'}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#A89B8C" />
            </TouchableOpacity>

            {/* 3. Thiết lập Hồ sơ Kết nối của tôi */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenTinderSetup();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#EAF7F1' }]}>
                <Feather name="user-check" size={18} color="#2E7D5B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Thiết lập hồ sơ kết nối</Text>
                <Text style={styles.itemDesc}>
                  Chọn mục đích tìm kiếm, phong cách sống & giới thiệu bản thân
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#A89B8C" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE5DB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE5DB',
  },
  menuItemsList: {
    gap: 8,
    marginTop: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE5DB',
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  itemDesc: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#FF6F61',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
