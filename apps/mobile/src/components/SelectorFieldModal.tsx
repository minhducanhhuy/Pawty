import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Feather } from './FeatherIcon';

export interface SelectorPickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue?: string;
  selectedValues?: string[];
  multiSelect?: boolean;
  searchable?: boolean;
  onSelect?: (value: string) => void;
  onSelectMulti?: (values: string[]) => void;
  onClose: () => void;
}

export const SelectorPickerModal: React.FC<SelectorPickerModalProps> = ({
  visible,
  title,
  options,
  selectedValue = '',
  selectedValues = [],
  multiSelect = false,
  searchable = true,
  onSelect,
  onSelectMulti,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [draftMulti, setDraftMulti] = useState<string[]>(selectedValues || []);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setDraftMulti(selectedValues || []);
    }
  }, [visible, (selectedValues || []).join('__')]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const toggleMultiOption = (item: string) => {
    setDraftMulti((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color="#4A3F35" />
            </TouchableOpacity>
          </View>

          {searchable && options.length > 6 && (
            <View style={styles.searchBar}>
              <Feather name="search" size={15} color="#8E8074" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm nhanh trong danh sách..."
                placeholderTextColor="#A3968A"
                value={query}
                onChangeText={setQuery}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Feather name="x" size={14} color="#8E8074" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.map((opt) => {
              const isSelected = multiSelect
                ? draftMulti.includes(opt)
                : selectedValue === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (multiSelect) {
                      toggleMultiOption(opt);
                    } else {
                      onSelect?.(opt);
                      onClose();
                    }
                  }}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                  <Feather
                    name={
                      multiSelect
                        ? isSelected
                          ? 'check-square'
                          : 'square'
                        : isSelected
                        ? 'check-circle'
                        : 'circle'
                    }
                    size={18}
                    color={isSelected ? '#FF6F61' : '#C4B9AE'}
                  />
                </TouchableOpacity>
              );
            })}
            {filteredOptions.length === 0 && (
              <Text style={styles.emptyText}>Không có lựa chọn phù hợp.</Text>
            )}
          </ScrollView>

          {multiSelect && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  onSelectMulti?.(draftMulti);
                  onClose();
                }}
              >
                <Text style={styles.confirmBtnText}>
                  Xác nhận đã chọn ({draftMulti.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export interface ConfirmActionModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.confirmBackdrop}>
        <View style={styles.confirmCard}>
          <View
            style={[
              styles.confirmIconBox,
              { backgroundColor: danger ? '#FDF2F2' : '#EAF7F1' },
            ]}
          >
            <Feather
              name={danger ? 'alert-triangle' : 'help-circle'}
              size={22}
              color={danger ? '#D9534F' : '#2E7D5B'}
            />
          </View>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmActionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.proceedBtn,
                { backgroundColor: danger ? '#D9534F' : '#2E7D5B' },
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.proceedBtnText}>{confirmLabel}</Text>
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
    backgroundColor: 'rgba(20, 16, 14, 0.48)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE5DB',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    marginRight: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2520',
    paddingVertical: 0,
  },
  listScroll: {
    paddingHorizontal: 18,
  },
  listContent: {
    paddingVertical: 12,
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAE2D7',
  },
  optionRowSelected: {
    backgroundColor: '#FFF6F4',
    borderColor: '#FF6F61',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2520',
    marginRight: 10,
  },
  optionTextSelected: {
    fontWeight: '800',
    color: '#D9534F',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8E8074',
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECE5DB',
  },
  confirmBtn: {
    backgroundColor: '#FF6F61',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 16, 14, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE5DB',
  },
  confirmIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C2520',
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmMessage: {
    fontSize: 13,
    color: '#6E6257',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5C5046',
  },
  proceedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  proceedBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

