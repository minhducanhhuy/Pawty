import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Feather } from './FeatherIcon';
import { isFutureDate } from '../types/mobileTypes';

export interface DatePickerModalProps {
  visible: boolean;
  title: string;
  initialDate: string;
  isPet?: boolean;
  onConfirm: (dateStr: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  initialDate,
  isPet = false,
  onConfirm,
  onClose,
}) => {
  const parts = (initialDate || '').split('/');
  const now = new Date();
  const defaultDay = String(now.getDate()).padStart(2, '0');
  const defaultMonth = String(now.getMonth() + 1).padStart(2, '0');
  const defaultYear = String(now.getFullYear());

  const [selectedDay, setSelectedDay] = useState(parts[0] || defaultDay);
  const [selectedMonth, setSelectedMonth] = useState(parts[1] || defaultMonth);
  const [selectedYear, setSelectedYear] = useState(parts[2] || (isPet ? defaultYear : '2000'));

  const maxDaysInMonth = useMemo(() => {
    const m = parseInt(selectedMonth, 10) || 1;
    const y = parseInt(selectedYear, 10) || 2000;
    return new Date(y, m, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const days = useMemo(
    () => Array.from({ length: maxDaysInMonth }, (_, i) => String(i + 1).padStart(2, '0')),
    [maxDaysInMonth]
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')), []);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = isPet ? currentYear - 20 : 1960;
    const count = currentYear - startYear + 1;
    return Array.from({ length: count }, (_, i) => String(startYear + i)).reverse();
  }, [isPet]);

  const [dateError, setDateError] = useState('');

  // Tự động điều chỉnh ngày nếu tháng mới có ít ngày hơn (VD: từ 31 sang tháng 2/4/6...)
  useEffect(() => {
    const currentDayNum = parseInt(selectedDay, 10) || 1;
    if (currentDayNum > maxDaysInMonth) {
      setSelectedDay(String(maxDaysInMonth).padStart(2, '0'));
    }
  }, [maxDaysInMonth, selectedDay]);

  useEffect(() => {
    if (visible) {
      const p = (initialDate || '').split('/');
      const n = new Date();
      const d = String(n.getDate()).padStart(2, '0');
      const m = String(n.getMonth() + 1).padStart(2, '0');
      const y = String(n.getFullYear());

      setSelectedDay(p[0] || d);
      setSelectedMonth(p[1] || m);
      setSelectedYear(p[2] || (isPet ? y : '2000'));
      setDateError('');
    }
  }, [visible, initialDate, isPet]);

  const handleConfirm = () => {
    const formatted = `${selectedDay}/${selectedMonth}/${selectedYear}`;
    if (isFutureDate(formatted)) {
      setDateError(
        isPet
          ? 'Ngày sinh của bé không được vượt quá ngày hiện tại!'
          : 'Ngày sinh của bạn không được vượt quá ngày hiện tại!'
      );
      return;
    }
    setDateError('');
    onConfirm(formatted);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dateStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={dateStyles.datePickerCard}>
          <View style={dateStyles.sheetHeader}>
            <Text style={dateStyles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={dateStyles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={18} color="#6B5E59" />
            </TouchableOpacity>
          </View>

          <View style={dateStyles.dateColsContainer}>
            <View style={dateStyles.dateCol}>
              <Text style={dateStyles.dateColHeader}>Ngày</Text>
              <ScrollView style={dateStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[dateStyles.dateItemPill, selectedDay === d && dateStyles.dateItemPillActive]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[dateStyles.dateItemText, selectedDay === d && dateStyles.dateItemTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={dateStyles.dateCol}>
              <Text style={dateStyles.dateColHeader}>Tháng</Text>
              <ScrollView style={dateStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {months.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[dateStyles.dateItemPill, selectedMonth === m && dateStyles.dateItemPillActive]}
                    onPress={() => setSelectedMonth(m)}
                  >
                    <Text style={[dateStyles.dateItemText, selectedMonth === m && dateStyles.dateItemTextActive]}>
                      Tháng {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={dateStyles.dateCol}>
              <Text style={dateStyles.dateColHeader}>Năm</Text>
              <ScrollView style={dateStyles.dateColScroll} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[dateStyles.dateItemPill, selectedYear === y && dateStyles.dateItemPillActive]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[dateStyles.dateItemText, selectedYear === y && dateStyles.dateItemTextActive]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={dateStyles.datePreviewRow}>
            <Text style={dateStyles.datePreviewText}>
              Đã chọn: {selectedDay}/{selectedMonth}/{selectedYear}
            </Text>
          </View>

          {dateError ? (
            <View style={{ backgroundColor: '#FEE2E2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginTop: 8, marginHorizontal: 20, alignItems: 'center' }}>
              <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>
                {dateError}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity style={dateStyles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={dateStyles.confirmBtnText}>Xác nhận ngày sinh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const dateStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  datePickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1815',
  },
  closeBtn: {
    padding: 6,
  },
  dateColsContainer: {
    flexDirection: 'row',
    height: 190,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dateCol: {
    flex: 1,
    alignItems: 'center',
  },
  dateColHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A7D75',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateColScroll: {
    width: '100%',
  },
  dateItemPill: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  dateItemPillActive: {
    backgroundColor: '#FF6F61',
  },
  dateItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A332C',
  },
  dateItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  datePreviewRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  datePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F61',
  },
  confirmBtn: {
    backgroundColor: '#FF6F61',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

