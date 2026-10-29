import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { PAWTY_COLORS } from '../theme/colors';

export const MobileProfileScreen: React.FC = () => {
  const {
    apiBaseUrl,
    isApiOnline,
    ownerName,
    ownerNeighborhood,
    isVip,
    vipPlanName,
    pets,
    activePet,
    setActivePetId,
    addVaccination,
    setActiveModal,
    syncWithLanBackend,
    restartOnboarding,
    showToast,
  } = useMobilePawty();

  const [profileTab, setProfileTab] = useState<'moments' | 'bio'>('bio');
  const [newVacName, setNewVacName] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pet Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.petRow}>
          <Image source={{ uri: activePet.avatarUrl }} style={styles.petAvatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.petName}>{activePet.name}</Text>
              <Text style={styles.safeBadge}>🟢 SAFE PET</Text>
              {isVip && <Text style={styles.vipBadge}>👑 {vipPlanName}</Text>}
            </View>
            <Text style={styles.petMeta}>
              {activePet.breed} · {activePet.ageDisplay} · {activePet.weightKg}kg ({activePet.sizeLabel})
            </Text>
            <Text style={styles.ownerMeta}>
              👤 Sen: {ownerName} · 📍 {ownerNeighborhood}
            </Text>
          </View>
        </View>

        <Text style={styles.petBio}>{activePet.bio}</Text>

        {/* Boss Switcher */}
        <View style={styles.switcherRow}>
          {pets.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.switchPill, p.id === activePet.id && styles.switchPillActive]}
              onPress={() => setActivePetId(p.id)}
            >
              <Text style={[styles.switchText, p.id === activePet.id && styles.switchTextActive]}>
                {p.species === 'dog' ? '🐶' : '🐱'} Hồ sơ {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2-Tab Segmented Switch (Moments vs Deep Bio) */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, profileTab === 'moments' && styles.tabBtnActive]}
          onPress={() => setProfileTab('moments')}
        >
          <Text style={[styles.tabBtnText, profileTab === 'moments' && styles.tabBtnTextActive]}>
            📸 Khoảnh khắc ({activePet.momentPhotos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, profileTab === 'bio' && styles.tabBtnActive]}
          onPress={() => setProfileTab('bio')}
        >
          <Text style={[styles.tabBtnText, profileTab === 'bio' && styles.tabBtnTextActive]}>
            🩺 Sổ tiêm & Hành vi
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: 3-COLUMN INSTAGRAM PHOTO GRID */}
      {profileTab === 'moments' && (
        <View style={styles.gridWrap}>
          {activePet.momentPhotos.map((uri, idx) => (
            <Image key={`${uri}-${idx}`} source={{ uri }} style={styles.gridPhoto} />
          ))}
        </View>
      )}

      {/* TAB 2: MINT GREEN VACCINATION CARD + HABITS + WEIGHT */}
      {profileTab === 'bio' && (
        <View>
          {/* Mint Green Safe Pet Vaccination Card */}
          <View style={styles.mintVaccineCard}>
            <View style={styles.mintHeader}>
              <Text style={styles.mintTitle}>🛡️ SỔ TIÊM CHỦNG ĐIỆN TỬ (SAFE PET)</Text>
              <Text style={styles.mintVerified}>✓ ĐÃ XÁC MINH</Text>
            </View>
            {activePet.vaccinations.map((vac) => (
              <View key={vac.id} style={styles.vacRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vacName}>💉 {vac.vaccineName}</Text>
                  <Text style={styles.vacMeta}>
                    Đã tiêm: {vac.dateGiven} · Tái chủng: {vac.nextDueDate} · {vac.clinicName}
                  </Text>
                </View>
                <Text style={styles.vacStatus}>🟢 Đạt</Text>
              </View>
            ))}

            <View style={styles.addVacRow}>
              <TextInput
                style={styles.vacInput}
                placeholder="Thêm mũi tiêm mới (VD: Tẩy giun / Dại)..."
                value={newVacName}
                onChangeText={setNewVacName}
              />
              <TouchableOpacity
                style={styles.vacAddBtn}
                onPress={() => {
                  if (newVacName.trim()) {
                    addVaccination(newVacName, activePet.vetClinicName);
                    setNewVacName('');
                  }
                }}
              >
                <Text style={styles.vacAddBtnText}>+ Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Good Habits & Fight Prevention Cautions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🐾 Tính cách, Thói quen tốt & Cần lưu ý</Text>
            <Text style={styles.sectionSub}>
              Hiển thị minh bạch trên Radar để phòng tránh xung đột khi dắt dạo công viên.
            </Text>

            <View style={styles.chipsWrap}>
              {activePet.behaviors
                .filter((b) => b.category !== 'caution')
                .map((b) => (
                  <View key={b.id} style={styles.goodChip}>
                    <Text style={styles.goodChipText}>✓ {b.label}</Text>
                  </View>
                ))}
            </View>

            <View style={[styles.chipsWrap, { marginTop: 8 }]}>
              {activePet.behaviors
                .filter((b) => b.category === 'caution')
                .map((b) => (
                  <View key={b.id} style={styles.cautionChip}>
                    <Text style={styles.cautionChipText}>⚠️ Cần lưu ý: {b.label}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Weight History & Vet Contact */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>⚖️ Biểu đồ Cân nặng & Phòng khám Thú y</Text>
            <View style={styles.weightRow}>
              {activePet.weightHistory.map((w) => (
                <View key={w.month} style={styles.weightCol}>
                  <Text style={styles.weightVal}>{w.weightKg}kg</Text>
                  <View style={styles.weightBar} />
                  <Text style={styles.weightMonth}>{w.month}</Text>
                </View>
              ))}
            </View>
            <View style={styles.vetBox}>
              <Text style={styles.vetBoxTitle}>🏥 {activePet.vetClinicName}</Text>
              <Text style={styles.vetBoxSub}>
                Bác sĩ phụ trách: {activePet.vetDoctorName} · ☎️ {activePet.vetPhone}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Monetization & Ecosystem Controls */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🚀 Hệ sinh thái Kinh tế & Quản trị Pawty</Text>

        <TouchableOpacity
          style={styles.actionRowBtn}
          onPress={() => setActiveModal('vip_upgrade')}
        >
          <Text style={styles.actionEmoji}>👑</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Gói Sen VIP (29k / 49k / 399k VietQR)</Text>
            <Text style={styles.actionSub}>
              Quẹt Radar không giới hạn, Vòng chăm sóc không giới hạn, Ưu tiên hiển thị x3
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRowBtn, { backgroundColor: PAWTY_COLORS.dangerSoft }]}
          onPress={() => setActiveModal('sos_alert')}
        >
          <Text style={styles.actionEmoji}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: PAWTY_COLORS.danger }]}>
              Phát Tín Hiệu SOS Tìm Boss Lạc 3km (39.000đ)
            </Text>
            <Text style={styles.actionSub}>
              Bắn Push Notification khẩn cấp tới toàn bộ cư dân nuôi thú cưng trong bán kính 3km
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRowBtn, { backgroundColor: PAWTY_COLORS.mintSoft }]}
          onPress={() => setActiveModal('pro_dashboard')}
        >
          <Text style={styles.actionEmoji}>🏢</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: PAWTY_COLORS.mintDark }]}>
              Pawty Pro Partner & North Star KPI Console
            </Text>
            <Text style={styles.actionSub}>
              Duyệt lịch hẹn Grooming/Vet, xem hoa hồng 12% và chỉ số North Star Metric
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Privacy & LAN Backend Status (Luật BVDLCN 91/2025/QH15) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🔒 Quyền riêng tư (Luật BVDLCN 91/2025/QH15) & LAN API</Text>
        <Text style={styles.sectionSub}>
          Backend: {apiBaseUrl} ({isApiOnline ? '🟢 Đang kết nối LAN' : '🟡 Chế độ Local/Offline'})
        </Text>

        <View style={styles.privacyBtnsRow}>
          <TouchableOpacity style={styles.smallOutlineBtn} onPress={syncWithLanBackend}>
            <Text style={styles.smallOutlineText}>🔄 Đồng bộ LAN Server</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallOutlineBtn}
            onPress={() =>
              showToast(
                'Đã xuất Dữ liệu Cá nhân (JSON) 📦',
                'Tuân thủ Điều 14 Luật BVDLCN số 91/2025/QH15.',
                'success'
              )
            }
          >
            <Text style={styles.smallOutlineText}>📥 Xuất Dữ liệu JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallOutlineBtn} onPress={restartOnboarding}>
            <Text style={styles.smallOutlineText}>✨ Chạy lại Onboarding</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAWTY_COLORS.cream },
  content: { padding: 16, paddingBottom: 115 },
  headerCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    marginBottom: 12,
  },
  petRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  petAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: PAWTY_COLORS.mint },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  petName: { fontSize: 20, fontWeight: '900', color: PAWTY_COLORS.charcoal },
  safeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: PAWTY_COLORS.mintDark,
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  vipBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: PAWTY_COLORS.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  petMeta: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 4 },
  ownerMeta: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.coral, marginTop: 3 },
  petBio: { fontSize: 13, color: PAWTY_COLORS.charcoal, marginTop: 10, lineHeight: 19 },
  switcherRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  switchPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: PAWTY_COLORS.cream,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchPillActive: {
    backgroundColor: PAWTY_COLORS.coralSoft,
    borderColor: PAWTY_COLORS.coral,
  },
  switchText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.slate },
  switchTextActive: { color: PAWTY_COLORS.coral },

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tabBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: PAWTY_COLORS.charcoal,
    borderColor: PAWTY_COLORS.charcoal,
  },
  tabBtnText: { fontSize: 13, fontWeight: '800', color: PAWTY_COLORS.slate },
  tabBtnTextActive: { color: '#FFF' },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  gridPhoto: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
  },

  mintVaccineCard: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: PAWTY_COLORS.mint,
    marginBottom: 12,
  },
  mintHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  mintTitle: { fontSize: 13, fontWeight: '900', color: PAWTY_COLORS.mintDark },
  mintVerified: { fontSize: 11, fontWeight: '900', color: PAWTY_COLORS.mintDark },
  vacRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  vacName: { fontSize: 13, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  vacMeta: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2 },
  vacStatus: { fontSize: 11, fontWeight: '800', color: PAWTY_COLORS.mintDark },
  addVacRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  vacInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
  },
  vacAddBtn: {
    backgroundColor: PAWTY_COLORS.mintDark,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacAddBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  sectionSub: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 3, marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goodChip: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  goodChipText: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.mintDark },
  cautionChip: {
    backgroundColor: PAWTY_COLORS.amberSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  cautionChipText: { fontSize: 12, fontWeight: '700', color: '#B45309' },

  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 12,
    backgroundColor: PAWTY_COLORS.cream,
    borderRadius: 14,
    marginVertical: 8,
  },
  weightCol: { alignItems: 'center' },
  weightVal: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.coral, marginBottom: 4 },
  weightBar: { width: 26, height: 42, borderRadius: 8, backgroundColor: PAWTY_COLORS.coral },
  weightMonth: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.slate, marginTop: 4 },
  vetBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: PAWTY_COLORS.mintSoft,
  },
  vetBoxTitle: { fontSize: 13, fontWeight: '800', color: PAWTY_COLORS.mintDark },
  vetBoxSub: { fontSize: 11, color: PAWTY_COLORS.charcoal, marginTop: 2 },

  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PAWTY_COLORS.cream,
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  actionEmoji: { fontSize: 24 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  actionSub: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2, lineHeight: 16 },

  privacyBtnsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallOutlineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    backgroundColor: PAWTY_COLORS.cream,
  },
  smallOutlineText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal },
});

