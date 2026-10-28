import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Chip, Badge, ModalSheet } from '../components';
import { Club } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

export const ClubsScreen: React.FC = () => {
  const { showToast } = useAppConfig();
  const { navigate } = useNavigation();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [filter, setFilter] = useState<'all' | 'breed' | 'building'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [clubType, setClubType] = useState<'breed' | 'building'>('breed');
  const [breedOrBuilding, setBreedOrBuilding] = useState('Shiba Inu');
  const [description, setDescription] = useState('');

  useEffect(() => {
    api.getClubs().then((res) => setClubs(res.items)).catch(() => {});
  }, []);

  const handleToggleJoin = async (club: Club) => {
    const updated = await api.joinLeaveClub(club.id, !club.isMember);
    setClubs((prev) => prev.map((c) => (c.id === club.id ? updated : c)));
    showToast(!club.isMember ? `🎉 Đã tham gia ${club.name}! (+Huy hiệu Club Member)` : 'Đã rời CLB', 'success');
  };

  const handleCreateClub = async () => {
    if (!name.trim()) return;
    const created = await api.createClub({
      name: name.trim(),
      type: clubType,
      breedOrBuilding,
      description: description.trim() || 'Cộng đồng giao lưu thú cưng văn minh!',
    });
    setClubs((prev) => [created, ...prev]);
    setCreateOpen(false);
    setName('');
    showToast('🏘️ Đã tạo Câu Lạc Bộ mới thành công!', 'success');
  };

  const filtered = clubs.filter((c) => filter === 'all' || c.type === filter);

  return (
    <View style={styles.screen}>
      <HeaderBar
        title="🏘️ Câu Lạc Bộ Cộng Đồng"
        subtitle="Hội nhóm theo Giống loài & Khu chung cư"
        rightElement={<Button title="+ Tạo CLB" size="sm" onPress={() => setCreateOpen(true)} />}
      />
      <View style={styles.topChips}>
        <Chip label="Tất cả CLB" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="🐕 Theo giống loài" selected={filter === 'breed'} onPress={() => setFilter('breed')} tone="mint" />
        <Chip label="🏢 Theo toà nhà" selected={filter === 'building'} onPress={() => setFilter('building')} tone="gold" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.map((club) => (
          <TouchableOpacity
            key={club.id}
            activeOpacity={0.9}
            onPress={() => navigate('ClubDetail', { clubId: club.id })}
          >
            <Card style={styles.clubCard}>
              <Image source={{ uri: club.coverUrl }} style={styles.cover} />
              <View style={styles.rowBetween}>
                <Badge text={club.type === 'breed' ? `🐾 ${club.breedOrBuilding}` : `🏢 ${club.breedOrBuilding}`} tone="mint" />
                <Text style={styles.members}>👥 {club.membersCount} thành viên</Text>
              </View>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{club.description}</Text>
              <View style={styles.rowBetween}>
                <Button
                  title={club.isMember ? '✓ Đã tham gia (Rời)' : '+ Tham gia CLB'}
                  size="sm"
                  variant={club.isMember ? 'outline' : 'primary'}
                  onPress={() => handleToggleJoin(club)}
                />
                <Button title="Xem chi tiết →" size="sm" variant="mint" onPress={() => navigate('ClubDetail', { clubId: club.id })} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ModalSheet visible={createOpen} title="🏘️ Tạo Câu Lạc Bộ Mới (Tối đa 3 CLB)" onClose={() => setCreateOpen(false)}>
        <View style={{ gap: SPACING.sm }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="🐕 Theo Giống loài" selected={clubType === 'breed'} onPress={() => setClubType('breed')} />
            <Chip label="🏢 Theo Chung cư" selected={clubType === 'building'} onPress={() => setClubType('building')} />
          </View>
          <TextInput style={styles.input} placeholder="Tên CLB (VD: Hội Poodle Thảo Điền)" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Giống loài hoặc Tên chung cư" value={breedOrBuilding} onChangeText={setBreedOrBuilding} />
          <TextInput style={styles.input} placeholder="Mô tả hoạt động của CLB" value={description} onChangeText={setDescription} />
          <Button title="Tạo Câu Lạc Bộ" onPress={handleCreateClub} />
        </View>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  topChips: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  content: { padding: SPACING.md, gap: SPACING.md },
  clubCard: { gap: SPACING.sm },
  cover: { width: '100%', height: 140, borderRadius: RADIUS.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  members: { ...TYPOGRAPHY.caption, color: COLORS.coralDark, fontWeight: '800' },
  clubName: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  desc: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
});
