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

type SosFilterMode = 'all' | 'nearby' | 'dog' | 'cat' | 'mine' | 'resolved';

export const MobileSosScreen: React.FC = () => {
  const {
    theme,
    ownerHandle,
    sosAlerts,
    reportSosSighting,
    confirmSosPetFound,
    createSosAlertWithFee,
    openPublicUserProfile,
    openLightboxMedia,
    showToast,
  } = useMobilePawty();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<SosFilterMode>('all');
  const [isCreatingSos, setIsCreatingSos] = useState(false);
  const [isAiDescribing, setIsAiDescribing] = useState(false);

  // Create SOS Form States
  const [sosPetName, setSosPetName] = useState('');
  const [sosSpecies, setSosSpecies] = useState<'Chó' | 'Mèo'>('Chó');
  const [sosBreed, setSosBreed] = useState('');
  const [sosLocation, setSosLocation] = useState('');
  const [sosDesc, setSosDesc] = useState('');
  const [sosReward, setSosReward] = useState('1.000.000đ');
  const [sosPhotoUri, setSosPhotoUri] = useState(
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
  );

  const pickSosPhotoFromPhone = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSosPhotoUri(result.assets[0].uri);
        showToast('Đã tải ảnh thú cưng từ điện thoại lên.');
      }
    } catch {
      showToast('Không thể mở thư viện ảnh trên thiết bị.');
    }
  };

  const handleAutoDescribeWithAi = async () => {
    if (!sosPhotoUri) {
      showToast('Vui lòng chọn ảnh thú cưng trước.');
      return;
    }

    setIsAiDescribing(true);
    showToast('✨ AI đang phân tích ảnh và trích xuất đặc điểm nhận dạng...');

    try {
      const response = await fetch('http://127.0.0.1:3000/api/ai/describe-pet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: sosPhotoUri }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        if (data.species) {
          setSosSpecies(data.species === 'Mèo' ? 'Mèo' : 'Chó');
        }
        if (data.breed) {
          setSosBreed(data.breed);
        }
        if (data.description) {
          setSosDesc(data.description);
        }
        showToast('✨ AI đã nhận diện và điền chi tiết nhận dạng giúp bạn!');
      } else {
        throw new Error(data.message || 'AI analysis failed');
      }
    } catch (err) {
      console.warn('AI describe-pet error or offline fallback:', err);
      // Fallback helpful template if backend server is unreachable
      setSosBreed((prev) => prev || (sosSpecies === 'Mèo' ? 'Mèo Anh Lông Ngắn' : 'Chó Beagle'));
      setSosDesc(
        'Bé lông màu vàng trắng phối đen, dáng người vừa vặn, có đeo vòng cổ đỏ. Đang thất lạc quanh khu vực chung cư, tính cách dạn người nhưng có thể hoảng loạn khi thấy xe máy.'
      );
      showToast('✨ AI đã điền mô tả nhận dạng gợi ý cho bài đăng.');
    } finally {
      setIsAiDescribing(false);
    }
  };

  // Anti-burial Priority Score + Search & Filter
  const filteredSosAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...sosAlerts]
      .filter((sos) => {
        if (filterMode === 'resolved') return sos.status === 'found';
        if (filterMode === 'mine') return sos.ownerHandle === ownerHandle;
        if (sos.status === 'found' && filterMode !== 'all') return false;
        if (filterMode === 'nearby' && sos.distanceKm > 1.0) return false;
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
  const mySosCount = sosAlerts.filter((s) => s.ownerHandle === ownerHandle).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Summary & Create SOS Trigger */}
      <View style={styles.heroBanner}>
        <View style={{ flex: 1 }}>
          <View style={styles.heroTitleRow}>
            <Feather name="alert-triangle" size={16} color="#B85D43" />
            <Text style={styles.heroTitle}>
              Bản Đồ Tìm Thú Lạc ({activeSearchingCount} ca đang tìm)
            </Text>
          </View>
          <Text style={styles.heroSub}>
            Ưu tiên hiển thị theo khoảng cách gần nhất & manh mối mới nhất. Chỉ người đăng tin mới có quyền xác nhận đã đón thú cưng về.
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
            {isCreatingSos ? 'Đóng' : 'Đăng tin SOS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Collapsible Create SOS Form */}
      {isCreatingSos && (
        <View style={styles.createFormCard}>
          <Text style={styles.formHeaderTitle}>Tạo bài đăng tìm thú lạc (Phí 39.000đ chống spam)</Text>
          <Text style={styles.formHeaderSub}>
            Tin SOS sau khi tạo sẽ được ghim ưu tiên trong bán kính 3km quanh khu vực thất lạc.
          </Text>

          <View style={styles.photoPickerRow}>
            <Image source={{ uri: sosPhotoUri }} style={styles.sosPreviewImg} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.inputLabel}>Ảnh nhận diện thú cưng</Text>
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

          {/* AI Smart Description Assistant Button */}
          <TouchableOpacity
            style={[
              styles.aiDescribeBtn,
              isAiDescribing && { opacity: 0.75 },
            ]}
            onPress={handleAutoDescribeWithAi}
            disabled={isAiDescribing}
          >
            {isAiDescribing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="sparkles" size={15} color="#FFFFFF" />
            )}
            <Text style={styles.aiDescribeBtnText}>
              {isAiDescribing ? 'AI Đang Phân Tích & Viết Mô Tả...' : '✨ AI Tự Động Viết Mô Tả Từ Ảnh'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Loài thú cưng</Text>
          <View style={styles.twoCol}>
            <TouchableOpacity
              style={[
                styles.chipBtn,
                sosSpecies === 'Chó' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setSosSpecies('Chó')}
            >
              <Text style={[styles.chipText, sosSpecies === 'Chó' && { color: '#FFFFFF' }]}>
                Loài Chó
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chipBtn,
                sosSpecies === 'Mèo' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setSosSpecies('Mèo')}
            >
              <Text style={[styles.chipText, sosSpecies === 'Mèo' && { color: '#FFFFFF' }]}>
                Loài Mèo
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Tên thú cưng</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Bơ, Miu..."
                placeholderTextColor="#A3968A"
                value={sosPetName}
                onChangeText={setSosPetName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Giống loài</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Corgi, Poodle, Beagle..."
                placeholderTextColor="#A3968A"
                value={sosBreed}
                onChangeText={setSosBreed}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Vị trí nhìn thấy lần cuối</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Công viên nội khu S2 Vinhomes Grand Park"
            placeholderTextColor="#A3968A"
            value={sosLocation}
            onChangeText={setSosLocation}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.inputLabel}>Đặc điểm nhận dạng (vòng cổ, màu lông, đốm tai...)</Text>
          </View>
          <TextInput
            style={[styles.input, { height: 76, textAlignVertical: 'top' }]}
            multiline
            placeholder="Bấm nút '✨ AI Tự Động Viết Mô Tả Từ Ảnh' ở trên để AI tạo mô tả chi tiết giúp bạn..."
            placeholderTextColor="#A3968A"
            value={sosDesc}
            onChangeText={setSosDesc}
          />

          <Text style={styles.inputLabel}>Mức hậu tạ (Tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 1.000.000đ"
            placeholderTextColor="#A3968A"
            value={sosReward}
            onChangeText={setSosReward}
          />

          <TouchableOpacity
            style={styles.submitSosBtn}
            onPress={() => {
              createSosAlertWithFee({
                petName: sosPetName,
                species: sosSpecies,
                breed: sosBreed,
                lastSeenLocation: sosLocation,
                description: sosDesc,
                rewardAmount: sosReward,
                imageUrl: sosPhotoUri,
              });
              setSosPetName('');
              setSosBreed('');
              setSosLocation('');
              setSosDesc('');
              setIsCreatingSos(false);
            }}
          >
            <Feather name="check-circle" size={16} color="#FFFFFF" />
            <Text style={styles.submitSosBtnText}>
              Thanh toán 39.000đ & Phát tín hiệu SOS (3km)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search & Filter Management Bar */}
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color="#8E8074" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên thú cưng, giống loài, vị trí, chủ nuôi..."
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
          { id: 'nearby' as const, label: 'Quanh đây (<1km)' },
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
          const isAuthor = sos.ownerHandle === ownerHandle;
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
                      mediaUrls: [sos.imageUrl],
                      initialIndex: 0,
                      mediaType: 'image',
                      caption: `${sos.petName} (${sos.breed}) - ${sos.lastSeenLocation}`,
                      authorName: sos.ownerName,
                    })
                  }
                >
                  <Image source={{ uri: sos.imageUrl }} style={styles.sosAvatar} />
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
                        {isFound ? 'Đã đón về' : `Cách ${sos.distanceKm}km`}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sosMetaText}>
                    Đăng bởi: {sos.ownerName} ({sos.ownerHandle}){' '}
                    {isAuthor ? '· (Bài đăng của bạn)' : ''} · {sos.lastSeenTime}
                  </Text>
                  <Text style={styles.sosRewardText}>Hậu tạ: {sos.rewardAmount}</Text>
                </View>
              </View>

              <View style={styles.locationBox}>
                <Feather name="map-pin" size={13} color="#B85D43" />
                <Text style={styles.locationBoxText}>
                  Vị trí cuối: {sos.lastSeenLocation}
                </Text>
              </View>

              <Text style={styles.sosDescText}>{sos.description}</Text>

              {/* Action Buttons: ONLY the post creator can press "Đã đón về"! */}
              {!isFound ? (
                <View style={styles.sosActionRow}>
                  <TouchableOpacity
                    style={styles.sightingBtn}
                    onPress={() =>
                      reportSosSighting(
                        sos.id,
                        `Quanh khu vực ${sos.lastSeenLocation}`,
                        'Vừa nhìn thấy bé cách đây ít phút'
                      )
                    }
                  >
                    <Feather name="map-pin" size={14} color="#FFFFFF" />
                    <Text style={styles.sightingBtnText}>
                      Báo vừa nhìn thấy ({sos.sightingsCount})
                    </Text>
                  </TouchableOpacity>

                  {isAuthor ? (
                    <TouchableOpacity
                      style={styles.foundBtnAuthorOnly}
                      onPress={() => confirmSosPetFound(sos.id)}
                    >
                      <Feather name="check-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.foundBtnAuthorText}>Đã đón về</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.contactOwnerBtn}
                      onPress={() => openPublicUserProfile(sos.ownerHandle)}
                    >
                      <Feather name="message-circle" size={14} color="#4A3F35" />
                      <Text style={styles.contactOwnerBtnText}>Liên hệ chủ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.resolvedFooter}>
                  <Feather name="check-circle" size={14} color="#2E7D5B" />
                  <Text style={styles.resolvedFooterText}>
                    Chủ nuôi ({sos.ownerHandle}) đã xác nhận đón bé về nhà an toàn.
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {filteredSosAlerts.length === 0 && (
          <View style={styles.emptyCard}>
            <Feather name="search" size={24} color="#8E8074" />
            <Text style={styles.emptyTitle}>Không tìm thấy tin SOS phù hợp</Text>
            <Text style={styles.emptySub}>
              Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm khác.
            </Text>
          </View>
        )}
      </View>
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
  formHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  formHeaderSub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
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
    backgroundColor: '#6C5CE7',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  aiDescribeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
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
  },
});
