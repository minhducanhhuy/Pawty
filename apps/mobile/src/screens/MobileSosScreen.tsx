import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { apiClient } from '../services/apiClient';
import { SelectorPickerModal } from '../components/SelectorFieldModal';
import {
  POPULAR_DOG_BREEDS,
  POPULAR_CAT_BREEDS,
  OTHER_SPECIES_OPTIONS,
  LIVING_AREA_OPTIONS,
  SOS_REWARD_OPTIONS,
} from '../types/mobileTypes';

type SosFilterMode = 'all' | 'nearby' | 'dog' | 'cat' | 'mine' | 'resolved';

const DEFAULT_SOS_PHOTO =
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';

export const MobileSosScreen: React.FC = () => {
  const {
    theme,
    ownerHandle,
    ownerName,
    ownerPhone,
    ownerArea,
    sosAlerts,
    reportSosSighting,
    confirmSosPetFound,
    createSosAlert,
    openPublicUserProfile,
    openLightboxMedia,
    showToast,
  } = useMobilePawty();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<SosFilterMode>('all');
  const [isCreatingSos, setIsCreatingSos] = useState(false);
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [isAiDescribing, setIsAiDescribing] = useState(false);

  // Create SOS Form States (100% Free & Selector-First)
  const [sosPetName, setSosPetName] = useState('');
  const [sosSpecies, setSosSpecies] = useState<'Chó' | 'Mèo' | 'Khác'>('Chó');
  const [sosCustomSpecies, setSosCustomSpecies] = useState(OTHER_SPECIES_OPTIONS[0]);
  const [sosBreed, setSosBreed] = useState(POPULAR_DOG_BREEDS[0]);
  const [sosLocation, setSosLocation] = useState(ownerArea || LIVING_AREA_OPTIONS[0]);
  const [sosReward, setSosReward] = useState(SOS_REWARD_OPTIONS[1] || 'Hậu tạ 1.000.000đ');
  const [sosDesc, setSosDesc] = useState('');
  const [sosPhotoUri, setSosPhotoUri] = useState(DEFAULT_SOS_PHOTO);
  const [sosPhotoBase64, setSosPhotoBase64] = useState<string | null>(null);

  // Selector modal state
  const [pickerType, setPickerType] = useState<
    null | 'custom_species' | 'breed' | 'location' | 'reward'
  >(null);

  const pickSosPhotoFromPhone = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.45,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const rawUri = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        if (asset.base64) {
          setSosPhotoBase64(asset.base64);
        }
        showToast('Đang tải ảnh SOS lên Cloudinary...');
        const uploadedUrl = await apiClient.uploadImage(rawUri, 'pawty/sos');
        setSosPhotoUri(uploadedUrl);
        showToast('Đã tải ảnh thú cưng lên Cloudinary thành công!');
      }
    } catch {
      showToast('Không thể mở thư viện ảnh trên thiết bị.');
    }
  };

  // Chức năng AI DUY NHẤT: Đọc ảnh thú cưng do chủ gửi để tạo đoạn văn mô tả nhận dạng
  const handleAutoDescribeWithAi = async () => {
    if (!sosPhotoUri && !sosPhotoBase64) {
      showToast('Vui lòng chọn ảnh thú cưng trước để AI đọc ảnh tạo mô tả.');
      return;
    }

    setIsAiDescribing(true);
    showToast('AI đang đọc ảnh thú cưng để tạo mô tả nhận dạng...');

    try {
      const aiRes = await apiClient.describePetWithAi({
        imageBase64: sosPhotoBase64 || undefined,
        imageUrl: sosPhotoBase64 ? undefined : sosPhotoUri,
        mimeType: 'image/jpeg',
      });

      if (aiRes?.success && aiRes.description) {
        setSosDesc(String(aiRes.description).slice(0, 300));
        if (aiRes.species) {
          const sp = aiRes.species.toLowerCase();
          if (sp.includes('mèo') || sp.includes('cat')) {
            setSosSpecies('Mèo');
          } else if (sp.includes('chó') || sp.includes('dog')) {
            setSosSpecies('Chó');
          }
        }
        if (aiRes.breed) {
          setSosBreed(String(aiRes.breed));
        }
        showToast('AI đã tạo mô tả nhận dạng từ ảnh thành công!');
      } else {
        showToast(aiRes?.error || 'Không thể tạo mô tả tự động từ ảnh.');
      }
    } catch (err: any) {
      showToast(
        err?.message ||
          'Chưa thể kết nối AI tạo mô tả. Bạn có thể tự nhập mô tả ngắn bên dưới.'
      );
    } finally {
      setIsAiDescribing(false);
    }
  };

  const handlePublishFreeSos = async () => {
    if (!sosPetName.trim()) {
      showToast('Vui lòng nhập tên thú cưng cần tìm.');
      return;
    }
    if (!sosDesc.trim()) {
      showToast('Vui lòng dùng AI tạo mô tả từ ảnh hoặc nhập đặc điểm nhận dạng của bé.');
      return;
    }

    setIsSubmittingSos(true);
    try {
      const ok = await createSosAlert({
        petName: sosPetName.trim(),
        species: sosSpecies,
        customSpecies: sosSpecies === 'Khác' ? sosCustomSpecies : undefined,
        breed: sosSpecies === 'Khác' ? sosCustomSpecies : sosBreed,
        lastSeenLocation: sosLocation || LIVING_AREA_OPTIONS[0],
        rewardAmount: sosReward,
        contactPhone: ownerPhone,
        description: sosDesc.trim(),
        imageUrl: sosPhotoUri,
      });

      if (ok) {
        setSosPetName('');
        setSosDesc('');
        setIsCreatingSos(false);
      }
    } finally {
      setIsSubmittingSos(false);
    }
  };

  const breedSelectorOptions =
    sosSpecies === 'Mèo'
      ? POPULAR_CAT_BREEDS
      : sosSpecies === 'Khác'
      ? OTHER_SPECIES_OPTIONS
      : POPULAR_DOG_BREEDS;

  const filteredSosAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...sosAlerts]
      .filter((sos) => {
        if (filterMode === 'resolved') return sos.status === 'found';
        if (filterMode === 'mine') {
          return sos.ownerHandle.toLowerCase() === ownerHandle.toLowerCase();
        }
        if (sos.status === 'found' && filterMode !== 'all') return false;
        if (filterMode === 'nearby' && sos.distanceKm > 3.5) return false;
        if (filterMode === 'dog' && sos.species !== 'Chó') return false;
        if (filterMode === 'cat' && sos.species !== 'Mèo') return false;

        if (!q) return true;
        return (
          sos.petName.toLowerCase().includes(q) ||
          sos.breed.toLowerCase().includes(q) ||
          sos.lastSeenLocation.toLowerCase().includes(q) ||
          sos.description.toLowerCase().includes(q) ||
          sos.ownerName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'searching' ? -1 : 1;
        return b.priorityScore - a.priorityScore;
      });
  }, [sosAlerts, searchQuery, filterMode, ownerHandle]);

  const activeSearchingCount = sosAlerts.filter((s) => s.status === 'searching').length;
  const mySosCount = sosAlerts.filter(
    (s) => s.ownerHandle.toLowerCase() === ownerHandle.toLowerCase()
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Summary & Free SOS Trigger */}
      <View style={styles.heroBanner}>
        <View style={{ flex: 1 }}>
          <View style={styles.heroTitleRow}>
            <Feather name="alert-triangle" size={16} color="#B85D43" />
            <Text style={styles.heroTitle}>
              Cứu Hộ SOS Thú Lạc ({activeSearchingCount} ca đang tìm)
            </Text>
          </View>
          <Text style={styles.heroSub}>
            Hoàn toàn miễn phí cho mọi thành viên. Phát thông báo khẩn cấp tới cộng đồng để sớm đón bé về nhà an toàn.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.createTriggerBtn,
            isCreatingSos && { backgroundColor: '#5C5046' },
          ]}
          onPress={() => setIsCreatingSos(!isCreatingSos)}
        >
          <Feather name={isCreatingSos ? 'x' : 'plus'} size={14} color="#FFFFFF" />
          <Text style={styles.createTriggerText}>
            {isCreatingSos ? 'Đóng' : 'Đăng SOS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Collapsible Free SOS Form */}
      {isCreatingSos && (
        <View style={styles.createFormCard}>
          <View style={styles.formTitleRowBetween}>
            <Text style={styles.formHeaderTitle}>Đăng tin SOS tìm thú lạc</Text>
            <View style={styles.freeTagBadge}>
              <Text style={styles.freeTagText}>Miễn phí 100%</Text>
            </View>
          </View>
          <Text style={styles.formHeaderSub}>
            Tải ảnh thú cưng để AI hỗ trợ viết mô tả nhận dạng và phát cảnh báo tới cộng đồng.
          </Text>

          <View style={styles.photoPickerRow}>
            <Image source={{ uri: sosPhotoUri }} style={styles.sosPreviewImg} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.inputLabel}>Ảnh thú cưng cần tìm</Text>
              <TouchableOpacity
                style={[styles.pickPhotoBtn, { borderColor: theme.primary }]}
                onPress={pickSosPhotoFromPhone}
              >
                <Feather name="upload" size={14} color={theme.primary} />
                <Text style={[styles.pickPhotoBtnText, { color: theme.primary }]}>
                  Chọn ảnh từ điện thoại
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Photo-to-Description Button (ONLY AI feature) */}
          <TouchableOpacity
            style={[styles.aiDescribeBtn, isAiDescribing && { opacity: 0.75 }]}
            onPress={handleAutoDescribeWithAi}
            disabled={isAiDescribing}
          >
            {isAiDescribing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="camera" size={15} color="#FFFFFF" />
            )}
            <Text style={styles.aiDescribeBtnText}>
              {isAiDescribing
                ? 'AI đang đọc ảnh & viết mô tả...'
                : 'AI Đọc Ảnh & Tạo Mô Tả Nhận Dạng'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Loài thú cưng</Text>
          <View style={styles.twoCol}>
            {(['Chó', 'Mèo', 'Khác'] as const).map((sp) => (
              <TouchableOpacity
                key={sp}
                style={[
                  styles.chipBtn,
                  sosSpecies === sp && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => {
                  setSosSpecies(sp);
                  if (sp === 'Chó') setSosBreed(POPULAR_DOG_BREEDS[0]);
                  else if (sp === 'Mèo') setSosBreed(POPULAR_CAT_BREEDS[0]);
                  else setSosBreed(OTHER_SPECIES_OPTIONS[0]);
                }}
              >
                <Text style={[styles.chipText, sosSpecies === sp && { color: '#FFFFFF' }]}>
                  {sp === 'Khác' ? 'Loài khác' : `Loài ${sp}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <View style={styles.labelCounterRow}>
                <Text style={styles.inputLabel}>Tên thú cưng</Text>
                <Text style={styles.charCounter}>{sosPetName.length}/30</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="VD: Bơ, Miu..."
                placeholderTextColor="#A3968A"
                value={sosPetName}
                onChangeText={setSosPetName}
                maxLength={30}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>
                {sosSpecies === 'Khác' ? 'Chủng loại' : 'Giống loài'}
              </Text>
              <TouchableOpacity
                style={styles.selectorFieldBtn}
                onPress={() =>
                  setPickerType(sosSpecies === 'Khác' ? 'custom_species' : 'breed')
                }
              >
                <Text style={styles.selectorFieldText} numberOfLines={1}>
                  {sosSpecies === 'Khác' ? sosCustomSpecies : sosBreed}
                </Text>
                <Feather name="chevron-down" size={15} color="#7A6E63" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.inputLabel}>Khu vực nhìn thấy lần cuối</Text>
          <TouchableOpacity
            style={styles.selectorFieldBtn}
            onPress={() => setPickerType('location')}
          >
            <Feather name="map-pin" size={14} color="#B85D43" />
            <Text style={[styles.selectorFieldText, { flex: 1 }]} numberOfLines={1}>
              {sosLocation || 'Chọn khu vực thất lạc'}
            </Text>
            <Feather name="chevron-down" size={15} color="#7A6E63" />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Mức hậu tạ / Cảm ơn</Text>
          <TouchableOpacity
            style={styles.selectorFieldBtn}
            onPress={() => setPickerType('reward')}
          >
            <Feather name="gift" size={14} color="#2E7D5B" />
            <Text style={[styles.selectorFieldText, { flex: 1 }]} numberOfLines={1}>
              {sosReward}
            </Text>
            <Feather name="chevron-down" size={15} color="#7A6E63" />
          </TouchableOpacity>

          <View style={styles.labelCounterRow}>
            <Text style={styles.inputLabel}>Mô tả đặc điểm nhận dạng</Text>
            <Text style={styles.charCounter}>{sosDesc.length}/300</Text>
          </View>
          <TextInput
            style={[styles.input, { height: 84, textAlignVertical: 'top' }]}
            multiline
            maxLength={300}
            placeholder="Nhấn nút 'AI Đọc Ảnh & Tạo Mô Tả' phía trên hoặc tự nhập đặc điểm vòng cổ, màu lông..."
            placeholderTextColor="#A3968A"
            value={sosDesc}
            onChangeText={setSosDesc}
          />

          <TouchableOpacity
            style={[styles.submitSosBtn, isSubmittingSos && { opacity: 0.7 }]}
            disabled={isSubmittingSos}
            onPress={handlePublishFreeSos}
          >
            <Feather name="bell" size={16} color="#FFFFFF" />
            <Text style={styles.submitSosBtnText}>
              {isSubmittingSos
                ? 'Đang phát cảnh báo SOS...'
                : 'Phát Tín Hiệu SOS Khẩn Cấp (Miễn Phí)'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search & Filter Bar */}
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color="#8E8074" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên thú cưng, giống loài, khu vực..."
          placeholderTextColor="#A3968A"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={15} color="#8E8074" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { id: 'all' as const, label: `Tất cả (${sosAlerts.length})` },
          { id: 'nearby' as const, label: 'Quanh đây' },
          { id: 'dog' as const, label: 'Loài Chó' },
          { id: 'cat' as const, label: 'Loài Mèo' },
          { id: 'mine' as const, label: `Tin của tôi (${mySosCount})` },
          { id: 'resolved' as const, label: 'Đã đón về' },
        ].map((tab) => {
          const active = filterMode === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterPill,
                active && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setFilterMode(tab.id)}
            >
              <Text style={[styles.filterPillText, active && { color: '#FFFFFF' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* SOS Feed List */}
      <View style={styles.listStack}>
        {filteredSosAlerts.map((sos) => {
          const isAuthor =
            sos.ownerHandle.toLowerCase() === ownerHandle.toLowerCase() ||
            (Boolean(sos.ownerName) && sos.ownerName === ownerName);
          const isFound = sos.status === 'found';

          return (
            <View
              key={sos.id}
              style={[
                styles.sosCard,
                isFound && styles.sosCardFound,
                isAuthor && !isFound && { borderColor: theme.primary, borderWidth: 1.5 },
              ]}
            >
              <View style={styles.sosCardTopRow}>
                <TouchableOpacity
                  onPress={() =>
                    openLightboxMedia({
                      postId: sos.id,
                      mediaUrls: [sos.imageUrl || DEFAULT_SOS_PHOTO],
                      initialIndex: 0,
                      mediaType: 'image',
                      caption: `${sos.petName} (${sos.breed}) - ${sos.lastSeenLocation}`,
                      authorName: sos.ownerName,
                    })
                  }
                >
                  <Image
                    source={{ uri: sos.imageUrl || DEFAULT_SOS_PHOTO }}
                    style={styles.sosAvatar}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={styles.sosTitleLine}>
                    <Text style={styles.sosPetTitle}>
                      {sos.petName} ({sos.species} · {sos.breed})
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isFound ? styles.statusBadgeFound : styles.statusBadgeSearching,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isFound ? { color: '#2E7D5B' } : { color: '#B85D43' },
                        ]}
                      >
                        {isFound ? 'Đã đón về' : 'Đang tìm kiếm'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => openPublicUserProfile(sos.ownerHandle)}
                  >
                    <Text style={styles.sosMetaText}>
                      Đăng bởi: <Text style={{ fontWeight: '800' }}>{sos.ownerName}</Text> {isAuthor ? '· Bài của bạn' : ''} · {sos.lastSeenTime}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.sosRewardText}>{sos.rewardAmount}</Text>
                </View>
              </View>

              <View style={styles.locationBox}>
                <Feather name="map-pin" size={13} color="#B85D43" />
                <Text style={styles.locationBoxText}>
                  Khu vực thất lạc: {sos.lastSeenLocation}
                </Text>
              </View>

              <Text style={styles.sosDescText}>{sos.description}</Text>

              {sos.sightingReports && sos.sightingReports.length > 0 && (
                <View style={styles.sightingsListBox}>
                  <Text style={styles.sightingsListTitle}>
                    Manh mối cộng đồng báo về ({sos.sightingReports.length}):
                  </Text>
                  {sos.sightingReports.slice(-3).map((sr) => (
                    <Text key={sr.id} style={styles.sightingItemText}>
                      • <Text style={{ fontWeight: '700' }}>{sr.reporterName}</Text>: {sr.locationNote}{' '}
                      ({sr.timeLabel})
                    </Text>
                  ))}
                </View>
              )}

              {!isFound ? (
                <View style={styles.sosActionRow}>
                  {isAuthor ? (
                    <TouchableOpacity
                      style={[styles.foundBtnAuthorOnly, { flex: 1 }]}
                      onPress={() => confirmSosPetFound(sos.id)}
                    >
                      <Feather name="check-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.foundBtnAuthorText}>
                        Xác nhận đã đón bé về nhà an toàn
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.sightingBtn}
                        onPress={() =>
                          reportSosSighting(
                            sos.id,
                            sos.lastSeenLocation,
                            'Vừa nhìn thấy bé xuất hiện quanh khu vực này'
                          )
                        }
                      >
                        <Feather name="map-pin" size={14} color="#FFFFFF" />
                        <Text style={styles.sightingBtnText}>
                          Báo vừa nhìn thấy ({sos.sightingsCount})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.contactOwnerBtn}
                        onPress={() => openPublicUserProfile(sos.ownerHandle)}
                      >
                        <Feather name="user" size={14} color="#4A3F35" />
                        <Text style={styles.contactOwnerBtnText}>Hồ sơ chủ</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.resolvedFooter}>
                  <Feather name="check-circle" size={14} color="#2E7D5B" />
                  <Text style={styles.resolvedFooterText}>
                    Gia đình ({sos.ownerName}) đã đón bé về nhà an toàn.
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {filteredSosAlerts.length === 0 && (
          <View style={styles.emptyCard}>
            <Feather name="shield" size={26} color="#8E8074" />
            <Text style={styles.emptyTitle}>Hiện chưa có tin SOS nào trong mục này</Text>
            <Text style={styles.emptySub}>
              Nếu cần hỗ trợ khẩn cấp, bạn có thể nhấn nút "Đăng SOS" hoàn toàn miễn phí.
            </Text>
          </View>
        )}
      </View>

      {/* Selector Modals for SOS Form */}
      <SelectorPickerModal
        visible={pickerType !== null}
        title={
          pickerType === 'custom_species'
            ? 'Chọn chủng loại thú cưng'
            : pickerType === 'breed'
            ? `Chọn giống ${sosSpecies}`
            : pickerType === 'location'
            ? 'Chọn khu vực nhìn thấy lần cuối'
            : 'Chọn mức hậu tạ / cảm ơn'
        }
        options={
          pickerType === 'custom_species'
            ? OTHER_SPECIES_OPTIONS
            : pickerType === 'breed'
            ? breedSelectorOptions
            : pickerType === 'location'
            ? LIVING_AREA_OPTIONS
            : SOS_REWARD_OPTIONS
        }
        selectedValue={
          pickerType === 'custom_species'
            ? sosCustomSpecies
            : pickerType === 'breed'
            ? sosBreed
            : pickerType === 'location'
            ? sosLocation
            : sosReward
        }
        onSelect={(val) => {
          if (pickerType === 'custom_species') {
            setSosCustomSpecies(val);
            setSosBreed(val);
          } else if (pickerType === 'breed') {
            setSosBreed(val);
          } else if (pickerType === 'location') {
            setSosLocation(val);
          } else if (pickerType === 'reward') {
            setSosReward(val);
          }
        }}
        onClose={() => setPickerType(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FDF3F2',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3D6D3',
    marginBottom: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8C3823',
  },
  heroSub: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 3,
    lineHeight: 16,
  },
  createTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#B85D43',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  createTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  createFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginBottom: 14,
  },
  formTitleRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
  },
  freeTagBadge: {
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBE7DA',
  },
  freeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  formHeaderSub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 4,
    marginBottom: 12,
  },
  photoPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  sosPreviewImg: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
  },
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FAF7F2',
  },
  pickPhotoBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  aiDescribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#529471',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  aiDescribeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  labelCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9C8E80',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2C2520',
    marginBottom: 10,
  },
  selectorFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
  },
  selectorFieldText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2520',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chipBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  submitSosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B85D43',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 4,
  },
  submitSosBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2520',
    paddingVertical: 0,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterContent: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  listStack: {
    gap: 12,
  },
  sosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  sosCardFound: {
    backgroundColor: '#F5FAF7',
    borderColor: '#C5E6D8',
  },
  sosCardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sosAvatar: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
  },
  sosTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  sosPetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeSearching: {
    backgroundColor: '#FDF3F2',
  },
  statusBadgeFound: {
    backgroundColor: '#EAF7F1',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sosMetaText: {
    fontSize: 11,
    color: '#7A6E63',
    marginTop: 3,
  },
  sosRewardText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B85D43',
    marginTop: 3,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
  },
  locationBoxText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
    flex: 1,
  },
  sosDescText: {
    fontSize: 12,
    color: '#4A3F35',
    lineHeight: 18,
    marginTop: 8,
  },
  sightingsListBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#F3DFD2',
    gap: 4,
  },
  sightingsListTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8C3823',
  },
  sightingItemText: {
    fontSize: 11,
    color: '#5C5046',
    lineHeight: 16,
  },
  sosActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sightingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#B85D43',
    paddingVertical: 10,
    borderRadius: 12,
  },
  sightingBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  foundBtnAuthorOnly: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  foundBtnAuthorText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contactOwnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactOwnerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3F35',
  },
  resolvedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCEEE5',
  },
  resolvedFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D5B',
    flex: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 4,
    textAlign: 'center',
  },
});
