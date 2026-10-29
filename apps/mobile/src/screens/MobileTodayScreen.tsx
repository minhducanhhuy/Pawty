import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { PAWTY_COLORS } from '../theme/colors';

export const MobileTodayScreen: React.FC = () => {
  const {
    ownerName,
    ownerNeighborhood,
    pets,
    activePet,
    setActivePetId,
    tasks,
    toggleTaskStatus,
    bookings,
    walkAppointments,
    circleMembers,
    circleActivities,
    sosAlerts,
    reportSosSighting,
    setActiveModal,
    setActiveTab,
    setExploreSubTab,
  } = useMobilePawty();

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const activeSos = sosAlerts.find((s) => s.status === 'active');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Active Boss Switcher */}
      <View style={styles.bossSwitcherRow}>
        {pets.map((pet) => {
          const isSelected = pet.id === activePet.id;
          return (
            <TouchableOpacity
              key={pet.id}
              style={[styles.bossPill, isSelected && styles.bossPillActive]}
              onPress={() => setActivePetId(pet.id)}
            >
              <Image source={{ uri: pet.avatarUrl }} style={styles.bossAvatar} />
              <View>
                <Text style={[styles.bossName, isSelected && styles.bossNameActive]}>
                  {pet.species === 'dog' ? '🐶' : '🐱'} {pet.name}
                </Text>
                <Text style={[styles.bossMeta, isSelected && styles.bossMetaActive]}>
                  {pet.weightKg}kg · {pet.vaccinationStatus === 'full' ? '🟢 Safe Pet' : '🟡 Đang tiêm'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SOS 3km Emergency Banner */}
      {activeSos && (
        <View style={styles.sosBanner}>
          <View style={styles.sosHeader}>
            <Text style={styles.sosBadge}>🚨 KHẨN CẤP BÁN KÍNH {activeSos.radiusKm}KM</Text>
            <Text style={styles.sosTime}>{activeSos.createdAt}</Text>
          </View>
          <Text style={styles.sosTitle}>Tìm Boss lạc: {activeSos.petName}</Text>
          <Text style={styles.sosAddress}>📍 Khu vực: {activeSos.lastSeenAddress}</Text>
          <Text style={styles.sosReward}>🎁 {activeSos.rewardText}</Text>
          <View style={styles.sosActions}>
            <TouchableOpacity
              style={styles.sosReportBtn}
              onPress={() => reportSosSighting(activeSos.id)}
            >
              <Text style={styles.sosReportBtnText}>
                👁️ Báo vừa nhìn thấy ({activeSos.sightingCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sosCreateBtn}
              onPress={() => setActiveModal('sos_alert')}
            >
              <Text style={styles.sosCreateBtnText}>Phát SOS 39k</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Hero Greeting Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroSub}>📍 {ownerNeighborhood}</Text>
        <Text style={styles.heroTitle}>
          Chào {ownerName}, hôm nay {activePet.name} có {pendingCount} việc cần chăm sóc! 🐾
        </Text>
        <View style={styles.speciesHintBox}>
          <Text style={styles.speciesHintText}>
            {activePet.species === 'dog'
              ? `🦮 Gợi ý cho ${activePet.name}: Khung giờ mát 17:30 rất lý tưởng để dắt dạo 30 phút quanh công viên nội khu.`
              : `🐈 Gợi ý cho ${activePet.name}: Đừng quên dọn khay cát vệ sinh, chải lông giảm búi lông và bổ sung nước sạch hôm nay nhé!`}
          </Text>
        </View>
      </View>

      {/* Layer 1: Care Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Việc cần làm hôm nay (Pawty Care)</Text>
        <TouchableOpacity
          style={styles.smallAddBtn}
          onPress={() => setActiveModal('new_task')}
        >
          <Text style={styles.smallAddBtnText}>+ Thêm việc</Text>
        </TouchableOpacity>
      </View>

      {tasks.map((task) => {
        const isDone = task.status === 'done';
        return (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, isDone && styles.taskCardDone]}
            onPress={() => toggleTaskStatus(task.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
              <Text style={styles.checkboxMark}>{isDone ? '✓' : ''}</Text>
            </View>
            <View style={styles.taskBody}>
              <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                {task.title}
              </Text>
              <Text style={styles.taskMeta}>
                ⏰ {task.dueTime} · 👤 {task.assignedToName} · 🐾 {task.petName}
              </Text>
              {task.completionNote ? (
                <Text style={styles.taskNote}>💬 "{task.completionNote}"</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Layer 4 & Walk Appointments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📅 Lịch hẹn Dịch vụ & Dắt dạo</Text>
        <TouchableOpacity
          style={styles.smallAddBtn}
          onPress={() => {
            setActiveTab('explore');
            setExploreSubTab('services');
          }}
        >
          <Text style={styles.smallAddBtnText}>Đặt lịch mới</Text>
        </TouchableOpacity>
      </View>

      {walkAppointments.map((walk) => (
        <View key={walk.id} style={styles.appointmentCard}>
          <View style={styles.appointmentBadgeRow}>
            <Text style={styles.mintBadge}>📍 HẸN DẮT DẠO TRUNG ĐIỂM (ST_CENTROID)</Text>
            <Text style={styles.statusText}>{walk.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.appointmentTitle}>
            Dắt dạo cùng {walk.partnerPetName} (Sen: {walk.partnerName})
          </Text>
          <Text style={styles.appointmentMeta}>⏰ {walk.proposedTime}</Text>
          <Text style={styles.appointmentMeta}>📌 {walk.midpointLocationName}</Text>
        </View>
      ))}

      {bookings.map((bk) => (
        <View key={bk.id} style={styles.appointmentCard}>
          <View style={styles.appointmentBadgeRow}>
            <Text style={styles.coralBadge}>✨ DỊCH VỤ ĐỐI TÁC XÁC MINH</Text>
            <Text style={styles.statusText}>{bk.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.appointmentTitle}>{bk.serviceName}</Text>
          <Text style={styles.appointmentMeta}>
            🏢 {bk.partnerName} · ⏰ {bk.bookingTime} ({bk.bookingDate})
          </Text>
          <Text style={styles.appointmentPrice}>
            💰 {bk.servicePrice.toLocaleString('vi-VN')}đ · Boss: {bk.petName}
          </Text>
        </View>
      ))}

      {/* Layer 2: Circle Activity & Members */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👨‍👩‍👧 Vòng chăm sóc (Pawty Circle)</Text>
        <TouchableOpacity
          style={styles.smallAddBtn}
          onPress={() => setActiveModal('invite_circle')}
        >
          <Text style={styles.smallAddBtnText}>+ Mời người thân</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.circleCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
          {circleMembers.map((member) => (
            <View key={member.id} style={styles.memberChip}>
              <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
              <View>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.memberRole}>{member.relationshipLabel}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.divider} />
        <Text style={styles.activityHeading}>Nhật ký hoạt động thời gian thực:</Text>
        {circleActivities.slice(0, 4).map((act) => (
          <View key={act.id} style={styles.activityRow}>
            <Text style={styles.activityDot}>🟢</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>
                <Text style={{ fontWeight: '800' }}>{act.actorName}</Text> {act.actionText}
              </Text>
              <Text style={styles.activityTime}>{act.timestamp}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAWTY_COLORS.cream },
  content: { padding: 16, paddingBottom: 110 },
  bossSwitcherRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  bossPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: PAWTY_COLORS.border,
    minHeight: 58,
  },
  bossPillActive: {
    borderColor: PAWTY_COLORS.coral,
    backgroundColor: PAWTY_COLORS.coralSoft,
  },
  bossAvatar: { width: 40, height: 40, borderRadius: 20 },
  bossName: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  bossNameActive: { color: PAWTY_COLORS.coral },
  bossMeta: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2 },
  bossMetaActive: { color: PAWTY_COLORS.charcoal, fontWeight: '600' },

  sosBanner: {
    backgroundColor: PAWTY_COLORS.dangerSoft,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: PAWTY_COLORS.danger,
    marginBottom: 14,
  },
  sosHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sosBadge: { fontSize: 11, fontWeight: '900', color: PAWTY_COLORS.danger },
  sosTime: { fontSize: 11, color: PAWTY_COLORS.danger, fontWeight: '700' },
  sosTitle: { fontSize: 15, fontWeight: '800', color: '#7F1D1D' },
  sosAddress: { fontSize: 12, color: '#991B1B', marginTop: 2 },
  sosReward: { fontSize: 12, fontWeight: '800', color: '#B91C1C', marginTop: 4 },
  sosActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  sosReportBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: PAWTY_COLORS.danger,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosReportBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  sosCreateBtn: {
    paddingHorizontal: 14,
    minHeight: 44,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCreateBtnText: { color: PAWTY_COLORS.danger, fontSize: 12, fontWeight: '800' },

  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    marginBottom: 18,
  },
  heroSub: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.coral, marginBottom: 4 },
  heroTitle: { fontSize: 17, fontWeight: '800', color: PAWTY_COLORS.charcoal, lineHeight: 24 },
  speciesHintBox: {
    marginTop: 12,
    backgroundColor: PAWTY_COLORS.mintSoft,
    padding: 12,
    borderRadius: 14,
  },
  speciesHintText: { fontSize: 12, color: PAWTY_COLORS.mintDark, fontWeight: '700', lineHeight: 18 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  smallAddBtn: {
    backgroundColor: PAWTY_COLORS.coralSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  smallAddBtnText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.coral },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    minHeight: 68,
  },
  taskCardDone: { backgroundColor: '#F8FAFC', opacity: 0.85 },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: PAWTY_COLORS.mintDark,
    borderColor: PAWTY_COLORS.mintDark,
  },
  checkboxMark: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: PAWTY_COLORS.charcoal },
  taskTitleDone: { textDecorationLine: 'line-through', color: PAWTY_COLORS.slate },
  taskMeta: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 4 },
  taskNote: { fontSize: 12, color: PAWTY_COLORS.mintDark, marginTop: 4, fontStyle: 'italic' },

  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  appointmentBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mintBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: PAWTY_COLORS.mintDark,
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coralBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: PAWTY_COLORS.coral,
    backgroundColor: PAWTY_COLORS.coralSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '800', color: PAWTY_COLORS.mintDark },
  appointmentTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  appointmentMeta: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 3 },
  appointmentPrice: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.coral, marginTop: 5 },

  circleCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  membersScroll: { marginBottom: 10 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PAWTY_COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  memberAvatar: { width: 32, height: 32, borderRadius: 16 },
  memberName: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  memberRole: { fontSize: 10, color: PAWTY_COLORS.slate },
  divider: { height: 1, backgroundColor: PAWTY_COLORS.border, marginVertical: 10 },
  activityHeading: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.slate, marginBottom: 8 },
  activityRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  activityDot: { fontSize: 10, marginTop: 3 },
  activityText: { fontSize: 12, color: PAWTY_COLORS.charcoal, lineHeight: 18 },
  activityTime: { fontSize: 10, color: PAWTY_COLORS.muted, marginTop: 2 },
});

