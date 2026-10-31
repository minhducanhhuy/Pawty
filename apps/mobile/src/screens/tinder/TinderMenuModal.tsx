import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '../../components/FeatherIcon';

interface TinderMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onRewind: () => void;
  onOpenLikesYou: () => void;
  onOpenTinderSetup: () => void;
  likedYouCount: number;
  isVip: boolean;
}

export const TinderMenuModal: React.FC<TinderMenuModalProps> = ({
  visible,
  onClose,
  onRewind,
  onOpenLikesYou,
  onOpenTinderSetup,
  likedYouCount,
  isVip,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
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
            {/* 1. Hoàn tác lượt quẹt */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onRewind();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#F0EBE3' }]}>
                <Feather name="rotate-ccw" size={18} color="#4A3F35" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>Hoàn tác lượt quẹt</Text>
                  {!isVip && (
                    <View style={styles.vipTag}>
                      <Text style={styles.vipTagText}>Plus</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemDesc}>Quay lại thẻ ứng viên vừa lướt qua</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#A89B8C" />
            </TouchableOpacity>

            {/* 2. Ai đã thích bạn */}
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
                  <Text style={styles.itemTitle}>Ai đã thích bạn</Text>
                  {likedYouCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{likedYouCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemDesc}>
                  {likedYouCount > 0
                    ? `Có ${likedYouCount} người nuôi thú cưng đã thả tim bạn`
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
                <Text style={styles.itemTitle}>Hồ sơ kết nối của tôi</Text>
                <Text style={styles.itemDesc}>
                  Chỉnh sửa mong muốn, phong cách sống & thông tin kết nối
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
  vipTag: {
    backgroundColor: '#FFF4E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#F0D597',
  },
  vipTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B87200',
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

