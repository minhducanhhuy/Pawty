import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '../../components/FeatherIcon';
import { TinderIntent } from '../../data/mobileSeedData';

interface TinderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoal: TinderIntent | 'all';
  onSelectGoal: (goal: TinderIntent | 'all') => void;
  activePassportArea: string;
  onSelectPassportArea: (area: string) => void;
  isVip: boolean;
  onUpgradeVip: () => void;
}

const GOAL_OPTIONS: { id: TinderIntent | 'all'; label: string; desc: string; icon: string }[] = [
  {
    id: 'all',
    label: 'Tất cả mục đích',
    desc: 'Duyệt mọi hồ sơ xung quanh bạn (Tìm bạn cún, Hẹn hò, Giao lưu)',
    icon: 'grid',
  },
  {
    id: 'playdate',
    label: 'Tìm bạn chơi chung (Playdate)',
    desc: 'Ưu tiên hiển thị thông tin thú cưng để tìm bạn dắt dạo công viên',
    icon: 'smile',
  },
  {
    id: 'dating',
    label: 'Hẹn hò chủ nuôi (Pet Dating)',
    desc: 'Tìm bạn độc thân có chung tình yêu thương thú cưng',
    icon: 'heart',
  },
  {
    id: 'community',
    label: 'Giao lưu nội khu (Community)',
    desc: 'Kết nối hội nhóm cư dân trao đổi kinh nghiệm chăm sóc',
    icon: 'users',
  },
];

const PASSPORT_AREAS = [
  'Quanh bạn (Bán kính 3km)',
  'Thảo Điền · Quận 2',
  'Phú Mỹ Hưng · Quận 7',
  'Vinhomes Central Park · Bình Thạnh',
];

export const TinderFilterModal: React.FC<TinderFilterModalProps> = ({
  visible,
  onClose,
  currentGoal,
  onSelectGoal,
  activePassportArea,
  onSelectPassportArea,
  isVip,
  onUpgradeVip,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Feather name="sliders" size={18} color="#2C2520" />
              <Text style={styles.headerTitle}>Bộ lọc Kết nối</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={20} color="#5C5046" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Mục đích duyệt ứng viên */}
            <Text style={styles.sectionHeading}>MỤC ĐÍCH TÌM KIẾM</Text>
            <Text style={styles.sectionSubhint}>
              Bộ lọc này chỉ áp dụng để duyệt hồ sơ, không thay đổi hồ sơ cá nhân của bạn.
            </Text>

            <View style={styles.optionsList}>
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = currentGoal === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => onSelectGoal(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.optionIconBox,
                        isSelected && styles.optionIconBoxSelected,
                      ]}
                    >
                      <Feather
                        name={opt.icon}
                        size={17}
                        color={isSelected ? '#FF6F61' : '#6C6055'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.optionTitle,
                          isSelected && styles.optionTitleSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={18} color="#FF6F61" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Hộ chiếu vị trí (Passport) */}
            <View style={styles.passportSectionHeader}>
              <Text style={styles.sectionHeading}>HỘ CHIẾU VỊ TRÍ (PASSPORT)</Text>
              {!isVip && (
                <TouchableOpacity
                  style={styles.vipBadgeBtn}
                  onPress={onUpgradeVip}
                >
                  <Feather name="award" size={11} color="#C47E00" />
                  <Text style={styles.vipBadgeText}>Pawty Plus</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.sectionSubhint}>
              Đổi vị trí tìm kiếm để kết nối với cộng đồng thú cưng ở khu vực khác.
            </Text>

            <View style={styles.areaChipGrid}>
              {PASSPORT_AREAS.map((area) => {
                const isAreaActive = activePassportArea === area;
                return (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.areaChip,
                      isAreaActive && styles.areaChipActive,
                    ]}
                    onPress={() => onSelectPassportArea(area)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="map-pin"
                      size={13}
                      color={isAreaActive ? '#FFFFFF' : '#4A3F35'}
                    />
                    <Text
                      style={[
                        styles.areaChipText,
                        isAreaActive && styles.areaChipTextActive,
                      ]}
                    >
                      {area}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE5DB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C2520',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE5DB',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A7B6E',
    letterSpacing: 0.5,
  },
  sectionSubhint: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 4,
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#ECE5DB',
  },
  optionCardSelected: {
    borderColor: '#FF6F61',
    backgroundColor: '#FFF8F6',
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconBoxSelected: {
    backgroundColor: '#FFEAE6',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  optionTitleSelected: {
    color: '#D44A3C',
  },
  optionDesc: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 2,
    lineHeight: 15,
  },
  passportSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vipBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF6E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0D597',
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C47E00',
  },
  areaChipGrid: {
    gap: 8,
    marginBottom: 8,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ECE5DB',
  },
  areaChipActive: {
    backgroundColor: '#2E7D5B',
    borderColor: '#2E7D5B',
  },
  areaChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C2520',
  },
  areaChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  applyBtn: {
    backgroundColor: '#FF6F61',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

