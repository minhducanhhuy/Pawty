import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Chip, Badge } from '../components';
import { ReminderItem } from '../types';
import { api } from '../api/endpoints';
import { useActivePet, useAppConfig } from '../context';

export const RemindersScreen: React.FC = () => {
  const { activePet } = useActivePet();
  const { showToast } = useAppConfig();

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [kind, setKind] = useState<'vaccine' | 'deworm' | 'custom'>('vaccine');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('20/12/2026');

  const load = useCallback(async () => {
    try {
      const list = await api.getReminders();
      setReminders(list);
    } catch (err) {
      console.error('Reminders load error:', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (item: ReminderItem) => {
    await api.toggleReminder(item.id, !item.isDone);
    setReminders((prev) => prev.map((r) => (r.id === item.id ? { ...r, isDone: !r.isDone } : r)));
    showToast(!item.isDone ? '✅ Đã đánh dấu hoàn thành lịch chăm sóc!' : 'Đã mở lại nhắc lịch', 'success');
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề lịch nhắc!', 'error');
      return;
    }
    const created = await api.createReminder({
      petId: activePet?.id || 'pet_bo_01',
      kind,
      title: title.trim(),
      dueDate,
    });
    setReminders((prev) => [created, ...prev]);
    setTitle('');
    showToast('⏰ Đã thêm lịch nhắc mới (Báo trước 30/7/1/0 ngày)', 'success');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title="⏰ Nhắc Lịch Sức Khoẻ & Tái Chủng" subtitle="Tự động nhắc mốc 30 / 7 / 1 / 0 ngày" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>+ Thêm Lịch Nhắc Mới Cho {activePet?.name || 'Boss'}</Text>
          <View style={styles.row}>
            <Chip label="💉 Tiêm chủng" selected={kind === 'vaccine'} onPress={() => setKind('vaccine')} />
            <Chip label="💊 Tẩy giun" selected={kind === 'deworm'} onPress={() => setKind('deworm')} tone="mint" />
            <Chip label="🛁 Tuỳ chọn" selected={kind === 'custom'} onPress={() => setKind('custom')} tone="gold" />
          </View>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 2 }]} placeholder="Tên mũi tiêm / lịch khám..." value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="DD/MM/YYYY" value={dueDate} onChangeText={setDueDate} />
          </View>
          <Button title="Tạo Lịch Nhắc" size="sm" onPress={handleAdd} />
        </Card>

        {reminders.map((item) => (
          <Card key={item.id} variant={item.isDone ? 'cream' : 'white'} style={styles.itemCard}>
            <TouchableOpacity style={styles.itemRow} onPress={() => handleToggle(item)}>
              <View style={[styles.checkbox, item.isDone && styles.checkboxDone]}>
                <Text style={styles.checkMark}>{item.isDone ? '✓' : ''}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, item.isDone && styles.strike]}>{item.title}</Text>
                <Text style={styles.itemSub}>
                  📅 Hạn: {item.dueDate} • Boss: {item.petName || activePet?.name}
                </Text>
              </View>
              <Badge
                text={item.kind === 'vaccine' ? '💉 Vaccine' : item.kind === 'deworm' ? '💊 Tẩy giun' : '✨ Khác'}
                tone={item.kind === 'vaccine' ? 'mint' : 'coral'}
              />
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.sm + 2 },
  formCard: { gap: SPACING.sm },
  formTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  row: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
  itemCard: { padding: SPACING.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: COLORS.coral, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: COLORS.mintDark, borderColor: COLORS.mintDark },
  checkMark: { color: COLORS.white, fontWeight: '800' },
  itemTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  strike: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  itemSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
});
