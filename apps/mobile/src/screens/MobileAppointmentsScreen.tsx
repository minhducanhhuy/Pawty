import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';

export const MobileAppointmentsScreen: React.FC = () => {
  const {
    theme,
    appointments,
    cancelAppointment,
    setActiveTab,
    setActiveModal,
  } = useMobilePawty();

  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'upcoming') {
      return apt.status === 'confirmed' || apt.status === 'pending';
    }
    if (statusFilter === 'completed') {
      return apt.status === 'completed' || apt.status === 'cancelled';
    }
    return true;
  });

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Đã xác nhận', bg: theme.secondarySoft, color: theme.secondary };
      case 'pending':
        return { label: 'Chờ xác nhận', bg: theme.primarySoft, color: theme.primary };
      case 'completed':
        return { label: 'Đã hoàn thành', bg: theme.surfaceMuted, color: theme.textMuted };
      default:
        return { label: 'Đã hủy', bg: '#FDECEC', color: '#D94343' };
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header & Quick Book CTA */}
      <View style={[styles.headerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Quản lý Lịch hẹn</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Theo dõi lịch Spa, khám thú y và lưu trú của thú cưng
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setActiveModal('book_service')}
            style={[styles.newBookBtn, { backgroundColor: theme.primary }]}
          >
            <Feather name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.newBookBtnText}>Đặt lịch mới</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.filterBar, { backgroundColor: theme.surfaceMuted }]}>
          {(
            [
              { id: 'all', label: `Tất cả (${appointments.length})` },
              {
                id: 'upcoming',
                label: `Sắp tới (${appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length})`,
              },
              {
                id: 'completed',
                label: `Lịch sử (${appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled').length})`,
              },
            ] as const
          ).map((f) => {
            const active = statusFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setStatusFilter(f.id)}
                style={[
                  styles.filterTab,
                  active && { backgroundColor: theme.surface },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: active ? theme.text : theme.textMuted },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="calendar" size={28} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa có lịch hẹn nào</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Hãy khám phá các cơ sở Spa & Phòng khám uy tín để đặt lịch cho thú cưng nhé.
          </Text>
          <TouchableOpacity
            onPress={() => setActiveTab('services')}
            style={[styles.exploreServicesBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.exploreServicesBtnText}>Xem danh sách Dịch vụ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filteredAppointments.map((apt) => {
          const statusMeta = getStatusMeta(apt.status);
          return (
            <View
              key={apt.id}
              style={[styles.aptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.rowBetween}>
                <View style={[styles.catBadge, { backgroundColor: theme.primarySoft }]}>
                  <Feather name="tag" size={11} color={theme.primary} />
                  <Text style={[styles.catBadgeText, { color: theme.primary }]}>
                    {apt.category} · Bé {apt.petName}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </Text>
                </View>
              </View>

              <Text style={[styles.serviceName, { color: theme.text }]}>{apt.serviceName}</Text>
              <Text style={[styles.providerName, { color: theme.secondary }]}>
                {apt.providerName}
              </Text>

              <View style={[styles.infoBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <View style={styles.infoRow}>
                  <Feather name="clock" size={13} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {apt.dateLabel} · Lúc {apt.timeSlot}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather name="map-pin" size={13} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.textMuted }]}>
                    {apt.location}
                  </Text>
                </View>
                {apt.notes ? (
                  <View style={styles.infoRow}>
                    <Feather name="file-text" size={13} color={theme.textMuted} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                      Ghi chú: {apt.notes}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.priceLabel, { color: theme.text }]}>
                  Chi phí: {apt.priceLabel}
                </Text>
                {(apt.status === 'confirmed' || apt.status === 'pending') && (
                  <TouchableOpacity
                    onPress={() => cancelAppointment(apt.id)}
                    style={[styles.cancelBtn, { borderColor: theme.border, backgroundColor: theme.bg }]}
                  >
                    <Feather name="x" size={13} color="#D94343" />
                    <Text style={styles.cancelBtnText}>Hủy lịch hẹn</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
  },
  headerCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  newBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newBookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  aptCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  providerName: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  infoBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priceLabel: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    color: '#D94343',
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 28,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreServicesBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreServicesBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
