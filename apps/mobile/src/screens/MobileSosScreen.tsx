import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
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
  const [sosViewTab, setSosViewTab] = useState<'cards' | 'radar'>('cards');
  const [selectedTrajectorySosId, setSelectedTrajectorySosId] = useState<string>(
    sosAlerts[0]?.id || ''
  );
  const [verifiedMatchIds, setVerifiedMatchIds] = useState<Record<string, 'verified_by_owner' | 'dismissed'>>({});

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
              Radar Tìm Thú Lạc ({activeSearchingCount} ca đang tìm)
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

      {/* View Mode Switcher: Thẻ tin SOS ↔ AI Radar Truy Vết */}
      <View style={styles.viewModeSwitcher}>
        <TouchableOpacity
          style={[
            styles.viewModeBtn,
            sosViewTab === 'cards' && styles.viewModeBtnActive,
          ]}
          onPress={() => setSosViewTab('cards')}
        >
          <Feather name="list" size={15} color={sosViewTab === 'cards' ? theme.primary : '#8E8074'} />
          <Text
            style={[
              styles.viewModeBtnText,
              sosViewTab === 'cards' && { color: theme.primary, fontWeight: '800' },
            ]}
          >
            Thẻ tin SOS ({sosAlerts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewModeBtn,
            sosViewTab === 'radar' && styles.viewModeBtnActive,
          ]}
          onPress={() => setSosViewTab('radar')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Feather name="cpu" size={14} color={sosViewTab === 'radar' ? '#E17055' : '#8E8074'} />
            <View style={styles.pulseDot} />
          </View>
          <Text
            style={[
              styles.viewModeBtnText,
              sosViewTab === 'radar' && { color: '#E17055', fontWeight: '800' },
            ]}
          >
            AI Radar Truy Vết
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
                placeholder="VD: Corgi, Poodle..."
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

          <Text style={styles.inputLabel}>Đặc điểm nhận dạng (vòng cổ, màu lông...)</Text>
          <TextInput
            style={[styles.input, { height: 68, textAlignVertical: 'top' }]}
            multiline
            placeholder="Mô tả chi tiết để hàng xóm dễ nhận ra..."
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

      {sosViewTab === 'radar' ? (
        /* AI SPATIOTEMPORAL RADAR VIEW */
        <View style={styles.radarContainer}>
          {/* Radar Header */}
          <View style={styles.radarHeaderBanner}>
            <View style={styles.radarHeaderIconBox}>
              <Feather name="activity" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radarBannerTitle}>AI SPATIOTEMPORAL TRACING</Text>
              <Text style={styles.radarBannerSub}>
                Tự động quét ảnh bài đăng Feed & định vị vết tích di chuyển theo dòng thời gian.
              </Text>
            </View>
          </View>

          {/* SOS Selector Chips if multiple */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {sosAlerts.map((s) => {
              const active = selectedTrajectorySosId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.radarSelectChip,
                    active && { backgroundColor: '#E17055', borderColor: '#E17055' },
                  ]}
                  onPress={() => setSelectedTrajectorySosId(s.id)}
                >
                  <Image source={{ uri: s.imageUrl }} style={styles.radarSelectAvatar} />
                  <Text style={[styles.radarSelectText, active && { color: '#FFFFFF', fontWeight: '800' }]}>
                    {s.petName} ({s.breed})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Trajectory Stats Card */}
          {(() => {
            const currentSos = sosAlerts.find((s) => s.id === selectedTrajectorySosId) || sosAlerts[0];
            const points = currentSos?.trajectoryPoints || [];
            const matchedPosts = currentSos?.matchedPosts || [];
            const distance = currentSos?.totalDistanceMeters || 520;

            return (
              <View>
                <View style={styles.radarStatsGrid}>
                  <View style={styles.radarStatBox}>
                    <Text style={styles.radarStatNum}>{distance}m</Text>
                    <Text style={styles.radarStatLabel}>Lộ trình di chuyển</Text>
                  </View>
                  <View style={styles.radarStatBox}>
                    <Text style={[styles.radarStatNum, { color: '#27AE60' }]}>{points.length}</Text>
                    <Text style={styles.radarStatLabel}>Điểm mốc vết tích</Text>
                  </View>
                  <View style={styles.radarStatBox}>
                    <Text style={[styles.radarStatNum, { color: '#E17055' }]}>{matchedPosts.length}</Text>
                    <Text style={styles.radarStatLabel}>Bài Feed khớp AI</Text>
                  </View>
                </View>

                {/* AI Visual Signature Info */}
                {currentSos?.visualSignatures && (
                  <View style={styles.visualSigCard}>
                    <View style={styles.visualSigHeader}>
                      <Feather name="eye" size={14} color="#E17055" />
                      <Text style={styles.visualSigTitle}>Đặc Trưng Nhận Diện Thị Giác (AI Extracted)</Text>
                    </View>
                    <View style={styles.visualSigTagsRow}>
                      <View style={styles.sigTag}><Text style={styles.sigTagText}>Loài: {currentSos.visualSignatures.species}</Text></View>
                      <View style={styles.sigTag}><Text style={styles.sigTagText}>Giống: {currentSos.visualSignatures.breed}</Text></View>
                      <View style={styles.sigTag}><Text style={styles.sigTagText}>Màu: {currentSos.visualSignatures.primaryColor}</Text></View>
                      {currentSos.visualSignatures.hasCollar && (
                        <View style={[styles.sigTag, { backgroundColor: '#E8F8F5' }]}>
                          <Text style={[styles.sigTagText, { color: '#16A085' }]}>
                            {currentSos.visualSignatures.collarColor} Vòng cổ
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Trajectory Timeline Map */}
                <Text style={styles.timelineSectionTitle}>📍 Chuỗi Vết Tích Di Chuyển Theo Dòng Thời Gian</Text>
                <View style={styles.timelineWrapper}>
                  {points.map((pt, index) => {
                    const isStart = pt.source === 'initial_lost';
                    const isAiMatch = pt.source === 'ai_feed_match';
                    const markerColor = isStart ? '#E74C3C' : isAiMatch ? '#27AE60' : '#F39C12';
                    const isLast = index === points.length - 1;

                    return (
                      <View key={pt.id} style={styles.timelineItemRow}>
                        {/* Left Line & Node */}
                        <View style={styles.timelineLineCol}>
                          <View style={[styles.timelineNode, { backgroundColor: markerColor }]}>
                            <Feather
                              name={isStart ? 'map-pin' : isAiMatch ? 'cpu' : 'user'}
                              size={12}
                              color="#FFFFFF"
                            />
                          </View>
                          {!isLast && <View style={styles.timelineConnector} />}
                        </View>

                        {/* Right Content Box */}
                        <View style={[styles.timelineContentBox, isAiMatch && { borderColor: '#A3E4D7', borderWidth: 1.5 }]}>
                          <View style={styles.timelineTopRow}>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.timelinePointTitle}>
                                  {isStart ? '🔴 Điểm mất tích ban đầu' : isAiMatch ? '🟢 AI phát hiện qua ảnh Feed' : '🟡 Manh mối cư dân gửi về'}
                                </Text>
                                <View style={[styles.confidenceBadge, { backgroundColor: isAiMatch ? '#E8F8F5' : '#FAF5EF' }]}>
                                  <Text style={[styles.confidenceText, { color: isAiMatch ? '#16A085' : '#8E8074' }]}>
                                    {isAiMatch ? `Khớp ${Math.round(pt.confidenceScore * 100)}%` : 'Xác thực'}
                                  </Text>
                                </View>
                              </View>
                              <Text style={styles.timelineLocation}>{pt.locationName}</Text>
                            </View>
                            <Text style={styles.timelineTime}>{pt.timestamp}</Text>
                          </View>

                          {pt.note && <Text style={styles.timelineNote}>"{pt.note}"</Text>}

                          {pt.photoUrl && (
                            <TouchableOpacity
                              onPress={() =>
                                openLightboxMedia({
                                  postId: pt.id,
                                  mediaUrls: [pt.photoUrl!],
                                  initialIndex: 0,
                                  mediaType: 'image',
                                  caption: `Manh mối ${pt.locationName} - ${pt.timestamp}`,
                                  authorName: pt.reporterName || 'Cộng đồng Pawty',
                                })
                              }
                            >
                              <Image source={{ uri: pt.photoUrl }} style={styles.timelinePhoto} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* AI Matched Posts Review Section */}
                {matchedPosts.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.timelineSectionTitle}>
                      🔍 Manh Mối Cần Chủ Nuôi Xác Nhận ({matchedPosts.length})
                    </Text>
                    {matchedPosts.map((m) => {
                      const decision = verifiedMatchIds[m.id] || m.status;
                      const isVerified = decision === 'verified_by_owner';
                      const isDismissed = decision === 'dismissed';

                      return (
                        <View key={m.id} style={styles.matchedPostCard}>
                          <View style={styles.matchedTopRow}>
                            <View style={styles.aiTagPill}>
                              <Feather name="cpu" size={11} color="#E17055" />
                              <Text style={styles.aiTagText}>Độ tương đồng {m.matchScore}%</Text>
                            </View>
                            <Text style={styles.matchedTime}>{m.detectedAt}</Text>
                          </View>

                          <Text style={styles.matchedAuthor}>Đăng bởi: {m.authorName}</Text>
                          <Text style={styles.matchedText}>"{m.text}"</Text>

                          {m.photoUrl && (
                            <Image source={{ uri: m.photoUrl }} style={styles.matchedPhoto} />
                          )}

                          <View style={styles.matchedActionsRow}>
                            {isVerified ? (
                              <View style={styles.verifiedStateBox}>
                                <Feather name="check-circle" size={14} color="#27AE60" />
                                <Text style={styles.verifiedStateText}>Đã xác nhận đúng Boss - Đang cập nhật lộ trình</Text>
                              </View>
                            ) : isDismissed ? (
                              <Text style={{ fontSize: 12, color: '#A3968A', fontStyle: 'italic' }}>
                                Đã bỏ qua manh mối này
                              </Text>
                            ) : (
                              <>
                                <TouchableOpacity
                                  style={styles.verifyBtn}
                                  onPress={() => {
                                    setVerifiedMatchIds((prev) => ({ ...prev, [m.id]: 'verified_by_owner' }));
                                    showToast('Đã xác nhận manh mối! Lộ trình đã được cập nhật.');
                                  }}
                                >
                                  <Feather name="check" size={13} color="#FFFFFF" />
                                  <Text style={styles.verifyBtnText}>Xác nhận đúng Boss</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.dismissBtn}
                                  onPress={() => {
                                    setVerifiedMatchIds((prev) => ({ ...prev, [m.id]: 'dismissed' }));
                                    showToast('Đã bỏ qua manh mối không chính xác.');
                                  }}
                                >
                                  <Text style={styles.dismissBtnText}>Không phải</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      ) : (
        /* STANDARD SOS FEED CARDS VIEW */
        <>
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

              {/* Quick AI Radar Button if matched */}
              {Boolean(sos.trajectoryPoints?.length || sos.matchedPosts?.length) && (
                <TouchableOpacity
                  style={styles.cardRadarShortcut}
                  onPress={() => {
                    setSelectedTrajectorySosId(sos.id);
                    setSosViewTab('radar');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="activity" size={13} color="#E17055" />
                    <Text style={styles.cardRadarShortcutText}>
                      AI đã phát hiện {sos.matchedPosts?.length || 1} manh mối lộ trình (Nhấp xem)
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#E17055" />
                </TouchableOpacity>
              )}

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
      </>
      )}
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
    marginBottom: 12,
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
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EFE9E0',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8074',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E17055',
  },
  radarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  radarHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2C2520',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  radarHeaderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E17055',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarBannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  radarBannerSub: {
    color: '#D1C7BD',
    fontSize: 11,
    marginTop: 2,
  },
  radarSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginRight: 8,
  },
  radarSelectAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  radarSelectText: {
    fontSize: 12,
    color: '#5C5046',
    fontWeight: '600',
  },
  radarStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  radarStatBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  radarStatNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2C2520',
  },
  radarStatLabel: {
    fontSize: 11,
    color: '#8E8074',
    marginTop: 2,
    textAlign: 'center',
  },
  visualSigCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginBottom: 16,
  },
  visualSigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  visualSigTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
  },
  visualSigTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sigTag: {
    backgroundColor: '#F5F0EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sigTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C5046',
  },
  timelineSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 10,
  },
  timelineWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginBottom: 16,
  },
  timelineItemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLineCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0D8CE',
    marginVertical: 4,
  },
  timelineContentBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  timelinePointTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timelineLocation: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C2520',
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 11,
    color: '#8E8074',
    fontWeight: '500',
  },
  timelineNote: {
    fontSize: 12,
    color: '#5C5046',
    fontStyle: 'italic',
    marginTop: 4,
  },
  timelinePhoto: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    marginTop: 8,
  },
  matchedPostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFD5CC',
    marginBottom: 12,
  },
  matchedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE8E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiTagText: {
    color: '#E17055',
    fontSize: 11,
    fontWeight: '800',
  },
  matchedTime: {
    fontSize: 11,
    color: '#8E8074',
  },
  matchedAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C2520',
  },
  matchedText: {
    fontSize: 13,
    color: '#4A3F35',
    marginVertical: 6,
  },
  matchedPhoto: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },
  matchedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  verifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#27AE60',
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F0EA',
    borderRadius: 10,
  },
  dismissBtnText: {
    color: '#7D6F63',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedStateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#E8F8F5',
    borderRadius: 8,
    flex: 1,
  },
  verifiedStateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27AE60',
  },
  cardRadarShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD5CC',
  },
  cardRadarShortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E17055',
  },
});