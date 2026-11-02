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
import { TinderIntent, TINDER_PURPOSE_OPTIONS } from '../../types/mobileTypes';

export type TinderGenderOption = 'all' | 'female' | 'male';

interface TinderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoal: TinderIntent | 'all';
  onSelectGoal: (goal: TinderIntent | 'all') => void;
  distanceLimit: number | 'all';
  onSelectDistanceLimit: (dist: number | 'all') => void;
  genderLimit?: 'all' | 'female' | 'male';
  onSelectGenderLimit?: (gender: 'all' | 'female' | 'male') => void;
}

const GENDER_OPTIONS: { id: 'all' | 'female' | 'male'; label: string; icon: string }[] = [
  { id: 'all', label: 'Mọi người', icon: 'users' },
  { id: 'female', label: 'Nữ', icon: 'user' },
  { id: 'male', label: 'Nam', icon: 'user' },
];

const GOAL_OPTIONS: { id: TinderIntent | 'all'; label: string; desc: string; icon: string }[] = [
  {
    id: 'all',
    label: 'Tất cả mục đích',
    desc: 'Duyệt mọi hồ sơ trên Pawty không phân biệt mục đích kết nối',
    icon: 'grid',
  },
  ...TINDER_PURPOSE_OPTIONS.map((opt) => ({
    id: opt.intent,
    label: opt.label,
    desc: opt.desc,
    icon:
      opt.intent === 'playdate'
        ? 'smile'
        : opt.intent === 'dating'
        ? 'heart'
        : 'users',
  })),
];

// Không còn trần 160km: cho phép kéo rộng đến 500km hoặc chọn "Không giới hạn" ('all')
const MIN_DIST = 2;
const MAX_DIST = 500;

const PRESET_DISTANCES: { id: number | 'all'; label: string }[] = [
  { id: 5, label: '5 km' },
  { id: 15, label: '15 km' },
  { id: 30, label: '30 km' },
  { id: 50, label: '50 km' },
  { id: 100, label: '100 km' },
  { id: 250, label: '250 km' },
  { id: 500, label: '500 km' },
  { id: 'all', label: 'Không giới hạn' },
];

export const TinderFilterModal: React.FC<TinderFilterModalProps> = ({
  visible,
  onClose,
  currentGoal,
  onSelectGoal,
  distanceLimit,
  onSelectDistanceLimit,
  genderLimit = 'all',
  onSelectGenderLimit,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  const [draftGoal, setDraftGoal] = useState<TinderIntent | 'all'>(currentGoal);
  const [draftDistance, setDraftDistance] = useState<number | 'all'>(distanceLimit);
  const [draftGender, setDraftGender] = useState<TinderGenderOption>(genderLimit);

  useEffect(() => {
    if (visible) {
      setDraftGoal(currentGoal);
      setDraftDistance(distanceLimit);
      setDraftGender(genderLimit);
    }
  }, [visible, currentGoal, distanceLimit, genderLimit]);

  const [trackWidth, setTrackWidth] = useState(280);
  const trackWidthRef = useRef(280);
  const initialRatioRef = useRef(0);
  const lastDraftDistRef = useRef<number | 'all'>(draftDistance);
  lastDraftDistRef.current = draftDistance;

  const currentNumericDist = draftDistance === 'all' ? MAX_DIST : draftDistance;
  const progressRatio = Math.max(
    0,
    Math.min(1, (currentNumericDist - MIN_DIST) / (MAX_DIST - MIN_DIST))
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const w = trackWidthRef.current || 280;
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

  const handleApplyFilter = () => {
    onSelectGoal(draftGoal);
    onSelectDistanceLimit(draftDistance);
    onSelectGenderLimit?.(draftGender);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, { paddingBottom: bottomInset + 12 }]}>
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
            <Text style={styles.sectionHeading}>GIỚI TÍNH ĐỐI TƯỢNG MUỐN GHÉP ĐÔI</Text>
            <Text style={styles.sectionSubhint}>
              Lọc danh sách ứng viên theo giới tính chủ nuôi (Mọi người, Nữ, hoặc Nam).
            </Text>

            <View style={styles.genderOptionsRow}>
              {GENDER_OPTIONS.map((g) => {
                const isSelected = draftGender === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.genderCard, isSelected && styles.genderCardSelected]}
                    onPress={() => setDraftGender(g.id)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={g.icon}
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#6C6055'}
                    />
                    <Text
                      style={[styles.genderCardText, isSelected && styles.genderCardTextSelected]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionHeading}>MỤC ĐÍCH TÌM KIẾM</Text>
            <Text style={styles.sectionSubhint}>
              Đồng bộ trực tiếp với thuộc tính Mục đích trong Hồ sơ Kết nối của các thành viên.
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

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>KHOẢNG CÁCH TÌM KIẾM</Text>
              <TouchableOpacity
                style={[
                  styles.unlimitedToggleBtn,
                  draftDistance === 'all' && styles.unlimitedToggleBtnActive,
                ]}
                onPress={() => setDraftDistance(draftDistance === 'all' ? 50 : 'all')}
              >
                <Feather
                  name="globe"
                  size={12}
                  color={draftDistance === 'all' ? '#FFFFFF' : '#2E7D5B'}
                />
                <Text
                  style={[
                    styles.unlimitedToggleText,
                    draftDistance === 'all' && { color: '#FFFFFF' },
                  ]}
                >
                  Không giới hạn
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubhint}>
              Tự do chọn phạm vi bất kỳ hoặc bật "Không giới hạn" để kết nối toàn quốc.
            </Text>

            <View style={styles.sliderDisplayCard}>
              <View
                style={[
                  styles.sliderDisplayIconBox,
                  draftDistance === 'all' && { backgroundColor: '#EAF7F1' },
                ]}
              >
                <Feather
                  name={draftDistance === 'all' ? 'globe' : 'navigation'}
                  size={20}
                  color={draftDistance === 'all' ? '#2E7D5B' : '#FF6F61'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sliderDisplayValue}>
                  {draftDistance === 'all'
                    ? 'Không giới hạn khoảng cách'
                    : `Trong bán kính ${draftDistance} km`}
                </Text>
                <Text style={styles.sliderDisplaySub}>
                  {draftDistance === 'all'
                    ? 'Hiển thị toàn bộ thành viên trên mọi khu vực & tỉnh thành'
                    : draftDistance <= 20
                    ? `Phạm vi lân cận nội đô (≤ ${draftDistance} km)`
                    : draftDistance <= 100
                    ? `Phạm vi toàn thành phố & vùng ven (≤ ${draftDistance} km)`
                    : `Phạm vi mở rộng liên tỉnh (≤ ${draftDistance} km)`}
                </Text>
              </View>
            </View>

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
                <View style={styles.sliderTrackBase} pointerEvents="none" />
                <View
                  style={[
                    styles.sliderTrackFilled,
                    {
                      width: `${progressRatio * 100}%`,
                      backgroundColor: draftDistance === 'all' ? '#2E7D5B' : '#FF6F61',
                    },
                  ]}
                  pointerEvents="none"
                />
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: Math.max(
                        0,
                        Math.min(trackWidth - 28, progressRatio * (trackWidth - 28))
                      ),
                      borderColor: draftDistance === 'all' ? '#2E7D5B' : '#FF6F61',
                    },
                  ]}
                  pointerEvents="none"
                >
                  <View
                    style={[
                      styles.sliderThumbInner,
                      { backgroundColor: draftDistance === 'all' ? '#2E7D5B' : '#FF6F61' },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.sliderLabelsRow} pointerEvents="none">
                <Text style={styles.sliderLabelText}>2 km</Text>
                <Text style={styles.sliderLabelText}>100 km</Text>
                <Text style={styles.sliderLabelText}>300 km</Text>
                <Text style={styles.sliderLabelText}>500 km+</Text>
              </View>
            </View>

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
  unlimitedToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#CBE7DA',
  },
  unlimitedToggleBtnActive: {
    backgroundColor: '#2E7D5B',
    borderColor: '#2E7D5B',
  },
  unlimitedToggleText: {
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
  genderOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
  },
  genderCardSelected: {
    backgroundColor: '#FF6F61',
    borderColor: '#FF6F61',
  },
  genderCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D312A',
  },
  genderCardTextSelected: {
    color: '#FFFFFF',
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
