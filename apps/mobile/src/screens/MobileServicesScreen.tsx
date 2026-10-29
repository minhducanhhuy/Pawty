import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';

export const MobileServicesScreen: React.FC = () => {
  const { theme, services, openBookingForService } = useMobilePawty();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Grooming & Spa' | 'Phòng khám Thú y' | 'Khách sạn Thú cưng'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter((srv) => {
    const matchCategory = categoryFilter === 'all' || srv.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      srv.name.toLowerCase().includes(q) ||
      srv.category.toLowerCase().includes(q) ||
      srv.address.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Feather name="search" size={16} color={theme.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm Spa, phòng khám thú y, khách sạn..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x-circle" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Single-View Category Filter */}
      <View style={styles.filterRow}>
        {(
          [
            { id: 'all', label: 'Tất cả' },
            { id: 'Grooming & Spa', label: 'Spa & Tắm' },
            { id: 'Phòng khám Thú y', label: 'Thú y' },
            { id: 'Khách sạn Thú cưng', label: 'Lưu trú' },
          ] as const
        ).map((cat) => {
          const active = categoryFilter === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoryFilter(cat.id)}
              style={[
                styles.catPill,
                {
                  backgroundColor: active ? theme.primarySoft : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.catPillText,
                  { color: active ? theme.primary : theme.textMuted },
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Service Cards */}
      {filteredServices.map((srv) => (
        <View
          key={srv.id}
          style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Image source={{ uri: srv.imageUrl }} style={styles.serviceImg} />
          <View style={styles.serviceBody}>
            <View style={styles.rowBetween}>
              <View style={[styles.badgePill, { backgroundColor: theme.secondarySoft }]}>
                <Text style={[styles.badgePillText, { color: theme.secondary }]}>
                  {srv.category}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Feather name="star" size={13} color={theme.primary} />
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {srv.rating} ({srv.reviewCount})
                </Text>
              </View>
            </View>

            <Text style={[styles.serviceName, { color: theme.text }]}>{srv.name}</Text>
            <Text style={[styles.serviceAddr, { color: theme.textMuted }]}>
              Cách {srv.distanceKm}km · {srv.address}
            </Text>

            {srv.promoVoucher && (
              <View
                style={[
                  styles.voucherBox,
                  { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                ]}
              >
                <Feather name="tag" size={13} color={theme.primary} />
                <Text style={[styles.voucherText, { color: theme.primary }]}>
                  {srv.promoVoucher}
                </Text>
              </View>
            )}

            {/* Service Packages Preview */}
            <View style={styles.pkgList}>
              {srv.Packages.map((pkg) => (
                <View
                  key={pkg.name}
                  style={[styles.pkgRow, { backgroundColor: theme.bg, borderColor: theme.border }]}
                >
                  <Text style={[styles.pkgName, { color: theme.text }]}>{pkg.name}</Text>
                  <Text style={[styles.pkgMeta, { color: theme.primary }]}>
                    {pkg.price} · {pkg.duration}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
              <Text style={[styles.priceRange, { color: theme.text }]}>{srv.priceRange}</Text>
              <TouchableOpacity
                onPress={() => openBookingForService(srv)}
                style={[styles.bookBtn, { backgroundColor: theme.primary }]}
              >
                <Feather name="calendar" size={14} color="#FFFFFF" />
                <Text style={styles.bookBtnText}>Đặt lịch hẹn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  catPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  serviceCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  serviceImg: {
    width: '100%',
    height: 155,
  },
  serviceBody: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  serviceAddr: {
    fontSize: 12,
    marginTop: 3,
  },
  voucherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  voucherText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  pkgList: {
    marginTop: 10,
    gap: 6,
  },
  pkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  pkgName: {
    fontSize: 12,
    fontWeight: '600',
  },
  pkgMeta: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  priceRange: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
