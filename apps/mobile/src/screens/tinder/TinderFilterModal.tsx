import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '../../components/FeatherIcon';
import { TinderIntent } from '../../data/mobileSeedData';

interface TinderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoal: TinderIntent | 'all';
  onSelectGoal: (goal: TinderIntent | 'all') => void;
  distanceLimit: number | 'all';
  onSelectDistanceLimit: (dist: number | 'all') => void;
  activePassportArea?: string;
  onSelectPassportArea?: (area: string) => void;
  isVip?: boolean;
  onUpgradeVip?: () => void;
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

// Chuẩn khoảng cách Tinder quốc tế: 2 km đến 160 km (tương đương 100 miles)
const MIN_DIST = 2;
const MAX_DIST = 160;

const PRESET_DISTANCES: { id: number | 'all'; label: string }[] = [
  { id: 5, label: '5 km' },
  { id: 15, label: '15 km' },
  { id: 30, label: '30 km' },
  { id: 50, label: '50 km' },
  { id: 100, label: '100 km' },
  { id: 160, label: '160 km' },
  { id: 'all', label: 'Tất cả' },
];

export const TinderFilterModal: React.FC<TinderFilterModalProps> = ({
  visible,
  onClose,
  currentGoal,
  onSelectGoal,
  distanceLimit,
  onSelectDistanceLimit,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  // 1. DRAFT STATE (Chỉ lưu tạm trong modal, bấm "Áp dụng" mới gửi để tránh query backend liên tục)
  const [draftGoal, setDraftGoal] = useState<TinderIntent | 'all'>(currentGoal);
  const [draftDistance, setDraftDistance] = useState<number | 'all'>(distanceLimit);

  // Đồng bộ lại draft khi modal được mở
  useEffect(() => {
    if (visible) {
      setDraftGoal(currentGoal);
      setDraftDistance(distanceLimit);
    }
  }, [visible, currentGoal, distanceLimit]);

  // 2. Chiều rộng track đo đạc từ onLayout
  const [trackWidth, setTrackWidth] = useState(280);
  const trackWidthRef = useRef(280);
  const initialRatioRef = useRef(0);
  const lastDraftDistRef = useRef<number | 'all'>(draftDistance);
  lastDraftDistRef.current = draftDistance;

  // Tính tỷ lệ phần trăm lấp đầy thanh trượt (0 -> 1)
  const currentNumericDist = draftDistance === 'all' ? MAX_DIST : draftDistance;
  const progressRatio = Math.max(
    0,
    Math.min(1, (currentNumericDist - MIN_DIST) / (MAX_DIST - MIN_DIST))
  );

  // 3. PanResponder tính toán delta mượt mà, triệt tiêu rung giật
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const w = trackWidthRef.current || 280;
          // Lấy vị trí chạm ban đầu
          const touchX = Math.max(0, Math.min(w, evt.nativeEvent.locationX));
          const tapRatio = touchX / w;
          initialRatioRef.current = tapRatio;

          const newDist = Math.max(
            MIN_DIST,
            Math.min(MAX_DIST, Math.round(MIN_DIST + tapRatio * (MAX_DIST - MIN_DIST)))
          );
          setDraftDistance(newDist);
        },
        onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          const w = trackWidthRef.current || 280;
          const deltaRatio = gestureState.dx / w;
          const newRatio = Math.max(0, Math.min(1, initialRatioRef.current + deltaRatio));

          const newDist = Math.max(
            MIN_DIST,
            Math.min(MAX_DIST, Math.round(MIN_DIST + newRatio * (MAX_DIST - MIN_DIST)))
          );

          if (newDist !== lastDraftDistRef.current) {
            setDraftDistance(newDist);
          }
        },
      }),
    []
  );

  // 4. Áp dụng bộ lọc và cam kết thay đổi
  const handleApplyFilter = () => {
    onSelectGoal(draftGoal);
    onSelectDistanceLimit(draftDistance);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, { paddingBottom: bottomInset + 12 }]}>
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
              Bộ lọc chỉ áp dụng để duyệt hồ sơ, không thay đổi hồ sơ cá nhân của bạn.
            </Text>

            <View style={styles.optionsList}>
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = draftGoal === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => setDraftGoal(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[styles.optionIconBox, isSelected && styles.optionIconBoxSelected]}
                    >
                      <Feather
                        name={opt.icon}
                        size={17}
                        color={isSelected ? '#FF6F61' : '#6C6055'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                    {isSelected && <Feather name="check-circle" size={18} color="#FF6F61" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Giới hạn khoảng cách: THANH TRƯỢT CHUẨN TINDER (2 - 160 KM) */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>BÁN KÍNH TÌM KIẾM</Text>
            </View>
            <Text style={styles.sectionSubhint}>
              Kéo thanh trượt từ 2 km đến 160 km (hoặc chọn Tất cả) để tìm bạn cún quanh bạn.
            </Text>

            {/* Card hiển thị khoảng cách nháp */}
            <View style={styles.sliderDisplayCard}>
              <View
                style={[
                  styles.sliderDisplayIconBox,
                  draftDistance === 'all' && { backgroundColor: '#F0EBE3' },
                ]}
              >
                <Feather
                  name={draftDistance === 'all' ? 'globe' : 'navigation'}
                  size={20}
                  color={draftDistance === 'all' ? '#6C6055' : '#FF6F61'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sliderDisplayValue}>
                  {draftDistance === 'all'
                    ? 'Tất cả khoảng cách'
                    : `Trong bán kính ${draftDistance} km`}
                </Text>
                <Text style={styles.sliderDisplaySub}>
                  {draftDistance === 'all'
                    ? 'Quét và hiển thị toàn bộ hồ sơ không giới hạn cự ly'
                    : draftDistance <= 15
                    ? `Phạm vi nội đô lân cận (≤ ${draftDistance} km)`
                    : draftDistance <= 50
                    ? `Bao quát toàn thành phố & vùng ven (≤ ${draftDistance} km)`
                    : `Mở rộng toàn vùng đô thị & liên tỉnh (≤ ${draftDistance} km)`}
                </Text>
              </View>
            </View>

            {/* Khung thanh trượt tương tác mượt mà 60 FPS */}
            <View style={styles.sliderContainer}>
              <View
                style={styles.sliderTrackWrapper}
                {...panResponder.panHandlers}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) {
                    setTrackWidth(w);
                    trackWidthRef.current = w;
                  }
                }}
              >
                {/* Đường ray nền (pointerEvents="none" chống lệch tọa độ) */}
                <View style={styles.sliderTrackBase} pointerEvents="none" />

                {/* Đoạn đường ray đã kéo (Active Filled Track) */}
                <View
                  style={[
                    styles.sliderTrackFilled,
                    {
                      width: `${progressRatio * 100}%`,
                      backgroundColor: draftDistance === 'all' ? '#8A7D71' : '#FF6F61',
                    },
                  ]}
                  pointerEvents="none"
                />

                {/* Nút kéo (Thumb) */}
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: Math.max(0, Math.min(trackWidth - 28, progressRatio * (trackWidth - 28))),
                      borderColor: draftDistance === 'all' ? '#8A7D71' : '#FF6F61',
                    },
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[
                      styles.sliderThumbInner,
                      { backgroundColor: draftDistance === 'all' ? '#8A7D71' : '#FF6F61' },
                    ]}
                  />
                </View>
              </View>

              {/* Mốc chỉ số bên dưới thanh trượt */}
              <View style={styles.sliderLabelsRow} pointerEvents="none">
                <Text style={styles.sliderLabelText}>2 km</Text>
                <Text style={styles.sliderLabelText}>50 km</Text>
                <Text style={styles.sliderLabelText}>100 km</Text>
                <Text style={styles.sliderLabelText}>160 km</Text>
              </View>
            </View>

            {/* Các nút chọn nhanh mốc bán kính (Preset Chips) */}
            <View style={styles.presetChipsRow}>
              {PRESET_DISTANCES.map((p) => {
                const isSelected = draftDistance === p.id;
                return (
                  <TouchableOpacity
                    key={String(p.id)}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                    onPress={() => setDraftDistance(p.id)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[styles.presetChipText, isSelected && styles.presetChipTextSelected]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Submit Button: Bấm nút này mới áp dụng filter mới */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyFilter}
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
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A7D71',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 4,
  },
  freeBadge: {
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  sectionSubhint: {
    fontSize: 12,
    color: '#7A6E63',
    lineHeight: 17,
    marginBottom: 12,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE3D8',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: '#FF6F61',
    backgroundColor: '#FFF8F6',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconBoxSelected: {
    backgroundColor: '#FFEAE6',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2520',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#FF6F61',
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 11,
    color: '#7A6E63',
    lineHeight: 15,
  },
  sliderDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE3D8',
    gap: 12,
    marginBottom: 16,
  },
  sliderDisplayIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEAE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDisplayValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 2,
  },
  sliderDisplaySub: {
    fontSize: 11,
    color: '#7A6E63',
    lineHeight: 15,
  },
  sliderContainer: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  sliderTrackWrapper: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBase: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6DFD5',
    width: '100%',
  },
  sliderTrackFilled: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6F61',
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF6F61',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6F61',
  },
  sliderLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A7D71',
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  presetChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE3D8',
  },
  presetChipSelected: {
    borderColor: '#FF6F61',
    backgroundColor: '#FFEAE6',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  presetChipTextSelected: {
    color: '#FF6F61',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDE5DB',
  },
  applyBtn: {
    backgroundColor: '#FF6F61',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
