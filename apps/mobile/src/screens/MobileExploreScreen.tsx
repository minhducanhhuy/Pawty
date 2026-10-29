import React, { memo, useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MobileExploreSubTab, useMobilePawty } from '../context/MobilePawtyContext';
import { MobilePost, MobileReactionKey } from '../data/mobileSeedData';
import { PAWTY_COLORS } from '../theme/colors';

const REACTION_BUTTONS: Array<{ key: MobileReactionKey; emoji: string; label: string }> = [
  { key: 'paw', emoji: '🐾', label: 'Paw' },
  { key: 'heart_eyes', emoji: '😍', label: 'Mê' },
  { key: 'laughing', emoji: '😂', label: 'Bựa' },
  { key: 'worried', emoji: '😟', label: 'Lo' },
  { key: 'helpful', emoji: '💡', label: 'Hữu ích' },
];

interface PostCardProps {
  post: MobilePost;
  onReact: (postId: string, reaction: MobileReactionKey) => void;
  onBookmark: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onBookSponsored: () => void;
}

const PostFeedCard = memo<PostCardProps>(
  ({ post, onReact, onBookmark, onAddComment, onBookSponsored }) => {
    const [commentDraft, setCommentDraft] = useState('');
    const [showComments, setShowComments] = useState(post.comments.length > 0);

    return (
      <View style={[styles.postCard, post.isSponsored && styles.postCardSponsored]}>
        {/* Author Header */}
        <View style={styles.postHeader}>
          <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              {post.authorRoleBadge === 'vip' && (
                <Text style={styles.vipBadge}>👑 SEN VIP</Text>
              )}
              {post.authorRoleBadge === 'vet' && (
                <Text style={styles.vetBadge}>🟢 CHUYÊN GIA XÁC MINH</Text>
              )}
              {post.authorRoleBadge === 'partner' && (
                <Text style={styles.partnerBadge}>🎁 TÀI TRỢ NỘI KHU</Text>
              )}
            </View>
            <Text style={styles.postMeta}>
              🐾 {post.petName} ({post.petBreed}) · 📍 {post.locationDistrict} · {post.createdAt}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => onBookmark(post.id)}
          >
            <Text style={{ fontSize: 16 }}>{post.isBookmarked ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Auto Health Disclaimer Banner */}
        {post.hasHealthDisclaimer && (
          <View style={styles.disclaimerBanner}>
            <Text style={styles.disclaimerText}>
              ⚕️ Lưu ý Y khoa: Nội dung mang tính chia sẻ kinh nghiệm cộng đồng, không thay thế chẩn đoán trực tiếp của Bác sĩ thú y.
            </Text>
          </View>
        )}

        {/* Content */}
        <Text style={styles.postText}>{post.textContent}</Text>

        {/* Hashtags */}
        <View style={styles.hashtagRow}>
          {post.hashtags.map((tag) => (
            <Text key={tag} style={styles.hashtagText}>
              {tag}
            </Text>
          ))}
        </View>

        {/* Image */}
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

        {/* Sponsored Native Ad Voucher CTA */}
        {post.isSponsored && (
          <View style={styles.sponsorBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sponsorTitle}>{post.sponsorDiscountText}</Text>
              <Text style={styles.sponsorCode}>Mã Voucher: {post.sponsorVoucherCode}</Text>
            </View>
            <TouchableOpacity style={styles.sponsorCta} onPress={onBookSponsored}>
              <Text style={styles.sponsorCtaText}>Đặt lịch -35%</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5 Paw Reactions Bar */}
        <View style={styles.reactionRow}>
          {REACTION_BUTTONS.map((btn) => {
            const count = post.reactions[btn.key] || 0;
            const isSelected = post.userReaction === btn.key;
            return (
              <TouchableOpacity
                key={btn.key}
                style={[styles.reactionBtn, isSelected && styles.reactionBtnActive]}
                onPress={() => onReact(post.id, btn.key)}
              >
                <Text style={styles.reactionEmoji}>{btn.emoji}</Text>
                <Text style={[styles.reactionCount, isSelected && styles.reactionCountActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comments Section (Expert First) */}
        <TouchableOpacity
          style={styles.commentToggle}
          onPress={() => setShowComments(!showComments)}
        >
          <Text style={styles.commentToggleText}>
            💬 {post.comments.length} bình luận · PawRank {post.pawRankScore}đ
          </Text>
        </TouchableOpacity>

        {showComments && (
          <View style={styles.commentsBox}>
            {post.comments.map((cmt) => (
              <View
                key={cmt.id}
                style={[
                  styles.commentItem,
                  cmt.authorBadge === 'vet' && styles.commentItemVet,
                ]}
              >
                <Text style={styles.commentAuthor}>
                  {cmt.authorName}{' '}
                  {cmt.authorBadge === 'vet' ? '🟢 Bác sĩ Thú Y Xác minh' : ''}
                </Text>
                <Text style={styles.commentText}>{cmt.content}</Text>
              </View>
            ))}

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận chia sẻ cùng Sen..."
                value={commentDraft}
                onChangeText={setCommentDraft}
              />
              <TouchableOpacity
                style={styles.commentSendBtn}
                onPress={() => {
                  if (commentDraft.trim()) {
                    onAddComment(post.id, commentDraft);
                    setCommentDraft('');
                  }
                }}
              >
                <Text style={styles.commentSendText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
);

export const MobileExploreScreen: React.FC = () => {
  const {
    exploreSubTab,
    setExploreSubTab,
    posts,
    reactToPost,
    toggleBookmarkPost,
    addCommentToPost,
    groups,
    toggleJoinGroup,
    partners,
    places,
    radarCandidates,
    matchedIds,
    latestMatchPetName,
    swipeRadarCandidate,
    clearMatchCelebration,
    setActiveModal,
    setActiveTab,
  } = useMobilePawty();

  const [searchQuery, setSearchQuery] = useState('');
  const [safePetFilterOnly, setSafePetFilterOnly] = useState(true);
  const [radarIndex, setRadarIndex] = useState(0);

  const SUB_TABS: Array<{ id: MobileExploreSubTab; label: string }> = [
    { id: 'feed', label: '🐾 Bảng tin' },
    { id: 'trending', label: '🔥 Xu hướng' },
    { id: 'groups', label: '👥 Hội nhóm' },
    { id: 'qa', label: '⚕️ Hỏi đáp' },
    { id: 'services', label: '✂️ Dịch vụ' },
    { id: 'places', label: '🌳 Địa điểm' },
    { id: 'radar', label: '📡 Radar' },
  ];

  const handleBookSponsored = useCallback(() => {
    setActiveModal('book_service', 'partner-1');
  }, [setActiveModal]);

  const renderFeedItem = useCallback(
    ({ item }: { item: MobilePost }) => (
      <PostFeedCard
        post={item}
        onReact={reactToPost}
        onBookmark={toggleBookmarkPost}
        onAddComment={addCommentToPost}
        onBookSponsored={handleBookSponsored}
      />
    ),
    [addCommentToPost, handleBookSponsored, reactToPost, toggleBookmarkPost]
  );

  const keyExtractor = useCallback((item: MobilePost) => item.id, []);

  const filteredPosts = posts.filter((p) =>
    searchQuery.trim()
      ? p.textContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.petName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const currentRadarCandidate =
    radarCandidates[radarIndex % radarCandidates.length] || radarCandidates[0];

  return (
    <View style={styles.container}>
      {/* Search Bar & Sub-Tabs Header */}
      <View style={styles.topHeader}>
        <TextInput
          style={styles.searchBar}
          placeholder="🔍 Tìm khoảnh khắc, #GoldenRetriever, phòng khám..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabsRow}
        >
          {SUB_TABS.map((tab) => {
            const active = exploreSubTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.subTabPill, active && styles.subTabPillActive]}
                onPress={() => setExploreSubTab(tab.id)}
              >
                <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 1. FEED SUB-TAB (FlatList + React.memo per mobile-performance.md) */}
      {exploreSubTab === 'feed' && (
        <FlatList
          data={filteredPosts}
          keyExtractor={keyExtractor}
          renderItem={renderFeedItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 2. TRENDING SUB-TAB */}
      {exploreSubTab === 'trending' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔥 Hashtag Thịnh Hành Tuần Này</Text>
            <View style={styles.chipsWrap}>
              {[
                '#GoldenRetriever (1.2k bài)',
                '#MèoAnhLôngNgắn (980 bài)',
                '#VinhomesGrandPark (640 bài)',
                '#HẹnDạoChiềuNay (410 bài)',
                '#MẹoChămBoss (530 bài)',
                '#KhoảnhKhắcBựa (890 bài)',
              ].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.trendChip}
                  onPress={() => {
                    setExploreSubTab('feed');
                  }}
                >
                  <Text style={styles.trendChipText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.expertTipCard}>
            <Text style={styles.expertBadge}>🟢 MẸO CHUYÊN GIA HÔM NAY — BS. TRẦN MINH KHOA</Text>
            <Text style={styles.expertTitle}>
              Cách kiểm tra nhiệt độ mặt đường trước khi dắt cún đi dạo chiều
            </Text>
            <Text style={styles.expertBody}>
              Áp mu bàn tay của bạn xuống mặt đường nhựa trong 7 giây. Nếu thấy nóng rát, đệm thịt chân của Boss cũng sẽ bị bỏng! Hãy ưu tiên dắt dạo trên thảm cỏ công viên sau 17h00.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* 3. GROUPS SUB-TAB */}
      {exploreSubTab === 'groups' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {groups.map((grp) => (
            <View key={grp.id} style={styles.card}>
              <Image source={{ uri: grp.coverUrl }} style={styles.groupCover} />
              <Text style={styles.cardTitle}>{grp.name}</Text>
              <Text style={styles.cardSub}>
                📍 {grp.district} · 👥 {grp.memberCount} thành viên · +{grp.postsToday} bài hôm nay
              </Text>
              <Text style={styles.groupDesc}>{grp.description}</Text>
              <TouchableOpacity
                style={[styles.primaryBtn, grp.isJoined && styles.secondaryBtn]}
                onPress={() => toggleJoinGroup(grp.id)}
              >
                <Text style={[styles.primaryBtnText, grp.isJoined && styles.secondaryBtnText]}>
                  {grp.isJoined ? '✓ Đã tham gia Nhóm (Chạm để rời)' : '+ Tham gia Nhóm Cộng đồng'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 4. Q&A SUB-TAB */}
      {exploreSubTab === 'qa' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.qaHeaderCard}>
            <Text style={styles.cardTitle}>⚕️ Hỏi Đáp Cùng Chuyên Gia Xác Minh</Text>
            <Text style={styles.cardSub}>
              Câu trả lời từ Bác sĩ Thú y & Huấn luyện viên có huy hiệu Xanh Mint luôn được ghim lên đầu.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setActiveModal('new_question')}
            >
              <Text style={styles.primaryBtnText}>+ Đặt câu hỏi cho Bác sĩ Thú y</Text>
            </TouchableOpacity>
          </View>

          {posts
            .filter((p) => p.contentType === 'tip' || p.contentType === 'question' || p.hasHealthDisclaimer)
            .map((p) => (
              <PostFeedCard
                key={p.id}
                post={p}
                onReact={reactToPost}
                onBookmark={toggleBookmarkPost}
                onAddComment={addCommentToPost}
                onBookSponsored={handleBookSponsored}
              />
            ))}
        </ScrollView>
      )}

      {/* 5. SERVICES SUB-TAB (Layer 4: Pawty Services) */}
      {exploreSubTab === 'services' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {partners.map((partner) => (
            <View key={partner.id} style={styles.card}>
              <View style={styles.partnerRow}>
                <Image source={{ uri: partner.avatarUrl }} style={styles.partnerAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mintBadgeInline}>✓ ĐỐI TÁC XÁC MINH PAWTY PRO</Text>
                  <Text style={styles.cardTitle}>{partner.businessName}</Text>
                  <Text style={styles.cardSub}>
                    ⭐ {partner.ratingAvg} ({partner.reviewCount} đánh giá) · Cách bạn {partner.distanceMeters}m
                  </Text>
                  <Text style={styles.cardSub}>📍 {partner.address}</Text>
                </View>
              </View>

              <View style={styles.servicesList}>
                {partner.services.map((srv) => (
                  <View key={srv.id} style={styles.serviceItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{srv.name}</Text>
                      <Text style={styles.serviceDuration}>⏱️ {srv.durationMinutes} phút</Text>
                    </View>
                    <Text style={styles.servicePrice}>
                      {srv.priceVnd.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setActiveModal('book_service', partner.id)}
              >
                <Text style={styles.primaryBtnText}>📅 Đặt lịch hẹn ngay (4 bước)</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 6. PLACES SUB-TAB */}
      {exploreSubTab === 'places' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {places.map((pl) => (
            <View key={pl.id} style={styles.card}>
              <Image source={{ uri: pl.imageUrl }} style={styles.groupCover} />
              <View style={styles.placeBadgeRow}>
                <Text style={styles.mintBadgeInline}>🌳 PET-FRIENDLY XÁC MINH</Text>
                <Text style={styles.placeDist}>Cách bạn {pl.distanceMeters}m</Text>
              </View>
              <Text style={styles.cardTitle}>{pl.name}</Text>
              <Text style={styles.cardSub}>📍 {pl.address} · ⭐ {pl.rating}</Text>
              <View style={styles.chipsWrap}>
                {pl.features.map((f) => (
                  <View key={f} style={styles.featureChip}>
                    <Text style={styles.featureChipText}>✓ {f}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 7. RADAR SUB-TAB (PostGIS Proximity Matching) */}
      {exploreSubTab === 'radar' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.radarFilterCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.radarFilterTitle}>🟢 Chỉ hiển thị Boss đã tiêm phòng (Safe Pet)</Text>
              <Text style={styles.radarFilterSub}>
                Bán kính PostGIS ST_DWithin: 500m – 3km quanh chung cư của bạn
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.togglePill, safePetFilterOnly && styles.togglePillOn]}
              onPress={() => setSafePetFilterOnly(!safePetFilterOnly)}
            >
              <Text style={styles.togglePillText}>{safePetFilterOnly ? 'BẬT' : 'TẮT'}</Text>
            </TouchableOpacity>
          </View>

          {latestMatchPetName && (
            <View style={styles.matchCelebrationBanner}>
              <Text style={styles.matchEmoji}>🎉🐾💖</Text>
              <Text style={styles.matchTitle}>TƯƠNG HỢP HẸN DẮT DẠO!</Text>
              <Text style={styles.matchSub}>
                Boss của bạn và {latestMatchPetName} đã sẵn sàng đi dạo cùng nhau!
              </Text>
              <View style={styles.matchActions}>
                <TouchableOpacity
                  style={styles.matchChatBtn}
                  onPress={() => {
                    clearMatchCelebration();
                    setActiveModal('walk_scheduler');
                  }}
                >
                  <Text style={styles.matchChatBtnText}>📍 Chọn Trung điểm Hẹn Dạo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.matchCloseBtn}
                  onPress={() => {
                    clearMatchCelebration();
                    setActiveTab('chat');
                  }}
                >
                  <Text style={styles.matchCloseBtnText}>Mở Chat ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentRadarCandidate && (
            <View style={styles.radarCard}>
              <Image
                source={{ uri: currentRadarCandidate.petAvatar }}
                style={styles.radarPhoto}
              />
              <View style={styles.radarOverlayBadge}>
                <Text style={styles.radarDistanceText}>
                  📍 Cách bạn {currentRadarCandidate.distanceMeters}m · Hợp {currentRadarCandidate.compatibilityScore}%
                </Text>
              </View>

              <View style={styles.radarBody}>
                <View style={styles.radarTitleRow}>
                  <Text style={styles.radarPetName}>
                    {currentRadarCandidate.petName} ({currentRadarCandidate.petBreed})
                  </Text>
                  <Text style={styles.safePetPill}>🟢 Đã tiêm đủ 7 bệnh & Dại</Text>
                </View>

                <Text style={styles.radarMeta}>
                  👤 Chủ nuôi: {currentRadarCandidate.ownerName} · 🏢 {currentRadarCandidate.neighborhood}
                </Text>
                <Text style={styles.radarMeta}>
                  ⏰ Giờ dắt dạo: {currentRadarCandidate.walkRoutineTime} · ⚖️ {currentRadarCandidate.petWeightKg}kg
                </Text>

                <Text style={styles.habitHeading}>Thói quen tốt:</Text>
                <View style={styles.chipsWrap}>
                  {currentRadarCandidate.goodHabits.map((h) => (
                    <View key={h} style={styles.mintChip}>
                      <Text style={styles.mintChipText}>✓ {h}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.habitHeading}>Cần lưu ý (Phòng tránh xung đột):</Text>
                <View style={styles.chipsWrap}>
                  {currentRadarCandidate.cautions.map((c) => (
                    <View key={c} style={styles.amberChip}>
                      <Text style={styles.amberChipText}>⚠️ {c}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.radarBtnRow}>
                  <TouchableOpacity
                    style={styles.passBtn}
                    onPress={() => {
                      swipeRadarCandidate(currentRadarCandidate.id, 'left');
                      setRadarIndex((i) => i + 1);
                    }}
                  >
                    <Text style={styles.passBtnText}>✕ Bỏ qua</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.likeBtn}
                    onPress={() => {
                      swipeRadarCandidate(currentRadarCandidate.id, 'right');
                      setRadarIndex((i) => i + 1);
                    }}
                  >
                    <Text style={styles.likeBtnText}>
                      {matchedIds.includes(currentRadarCandidate.id)
                        ? '💖 Đã Match (Hẹn dạo ngay)'
                        : '🐾 Mời Đi Dạo Chung'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAWTY_COLORS.cream },
  topHeader: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: PAWTY_COLORS.border,
  },
  searchBar: {
    backgroundColor: PAWTY_COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: PAWTY_COLORS.charcoal,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    marginBottom: 10,
  },
  subTabsRow: { gap: 8 },
  subTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: PAWTY_COLORS.cream,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  subTabPillActive: {
    backgroundColor: PAWTY_COLORS.coral,
    borderColor: PAWTY_COLORS.coral,
  },
  subTabText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.slate },
  subTabTextActive: { color: '#FFF' },

  listContent: { padding: 14, paddingBottom: 110 },

  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  postCardSponsored: {
    borderColor: PAWTY_COLORS.gold,
    backgroundColor: '#FFFDF7',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  authorAvatar: { width: 42, height: 42, borderRadius: 21 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  authorName: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  vipBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: PAWTY_COLORS.goldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vetBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: PAWTY_COLORS.mintDark,
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partnerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: PAWTY_COLORS.coral,
    backgroundColor: PAWTY_COLORS.coralSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  postMeta: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2 },
  bookmarkBtn: { padding: 8 },
  disclaimerBanner: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: PAWTY_COLORS.mintDark,
  },
  disclaimerText: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.mintDark, lineHeight: 16 },
  postText: { fontSize: 14, color: PAWTY_COLORS.charcoal, lineHeight: 20, marginBottom: 8 },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  hashtagText: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.coral },
  postImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 10 },
  sponsorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PAWTY_COLORS.coralSoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  sponsorTitle: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  sponsorCode: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.coral, marginTop: 2 },
  sponsorCta: {
    backgroundColor: PAWTY_COLORS.coral,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sponsorCtaText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  reactionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  reactionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: PAWTY_COLORS.cream,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  reactionBtnActive: {
    backgroundColor: PAWTY_COLORS.coralSoft,
    borderColor: PAWTY_COLORS.coral,
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.slate },
  reactionCountActive: { color: PAWTY_COLORS.coral, fontWeight: '800' },

  commentToggle: { marginTop: 10, paddingVertical: 4 },
  commentToggleText: { fontSize: 12, fontWeight: '700', color: PAWTY_COLORS.slate },
  commentsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: PAWTY_COLORS.border,
  },
  commentItem: {
    backgroundColor: PAWTY_COLORS.cream,
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  commentItemVet: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.mintDark,
  },
  commentAuthor: { fontSize: 11, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  commentText: { fontSize: 12, color: PAWTY_COLORS.charcoal, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  commentInput: {
    flex: 1,
    backgroundColor: PAWTY_COLORS.cream,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  commentSendBtn: {
    backgroundColor: PAWTY_COLORS.coral,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  cardSub: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  trendChip: {
    backgroundColor: PAWTY_COLORS.coralSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trendChipText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.coral },

  expertTipCard: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: PAWTY_COLORS.mintDark,
  },
  expertBadge: { fontSize: 10, fontWeight: '900', color: PAWTY_COLORS.mintDark, marginBottom: 6 },
  expertTitle: { fontSize: 16, fontWeight: '800', color: PAWTY_COLORS.charcoal, marginBottom: 6 },
  expertBody: { fontSize: 13, color: PAWTY_COLORS.charcoal, lineHeight: 19 },

  groupCover: { width: '100%', height: 140, borderRadius: 14, marginBottom: 10 },
  groupDesc: { fontSize: 13, color: PAWTY_COLORS.charcoal, marginTop: 6, lineHeight: 18 },
  primaryBtn: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  secondaryBtn: { backgroundColor: PAWTY_COLORS.mintSoft },
  secondaryBtnText: { color: PAWTY_COLORS.mintDark },

  qaHeaderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  partnerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  partnerAvatar: { width: 64, height: 64, borderRadius: 16 },
  mintBadgeInline: {
    fontSize: 10,
    fontWeight: '800',
    color: PAWTY_COLORS.mintDark,
    marginBottom: 2,
  },
  servicesList: { marginTop: 12, gap: 8 },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PAWTY_COLORS.cream,
    padding: 10,
    borderRadius: 12,
  },
  serviceName: { fontSize: 13, fontWeight: '700', color: PAWTY_COLORS.charcoal },
  serviceDuration: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2 },
  servicePrice: { fontSize: 13, fontWeight: '800', color: PAWTY_COLORS.coral },

  placeBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  placeDist: { fontSize: 11, fontWeight: '800', color: PAWTY_COLORS.coral },
  featureChip: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  featureChipText: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.mintDark },

  radarFilterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  radarFilterTitle: { fontSize: 13, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  radarFilterSub: { fontSize: 11, color: PAWTY_COLORS.slate, marginTop: 2 },
  togglePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  togglePillOn: { backgroundColor: PAWTY_COLORS.mintDark },
  togglePillText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  matchCelebrationBanner: {
    backgroundColor: PAWTY_COLORS.coral,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  matchEmoji: { fontSize: 34, marginBottom: 6 },
  matchTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  matchSub: { color: '#FFF', fontSize: 13, textAlign: 'center', marginTop: 4 },
  matchActions: { flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' },
  matchChatBtn: {
    flex: 1,
    minHeight: 46,
    backgroundColor: '#FFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchChatBtnText: { color: PAWTY_COLORS.coral, fontSize: 12, fontWeight: '800' },
  matchCloseBtn: {
    paddingHorizontal: 14,
    minHeight: 46,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchCloseBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  radarCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  radarPhoto: { width: '100%', height: 250 },
  radarOverlayBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(44,62,80,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  radarDistanceText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  radarBody: { padding: 16 },
  radarTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  radarPetName: { fontSize: 18, fontWeight: '900', color: PAWTY_COLORS.charcoal },
  safePetPill: {
    fontSize: 11,
    fontWeight: '800',
    color: PAWTY_COLORS.mintDark,
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  radarMeta: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 4 },
  habitHeading: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal, marginTop: 12 },
  mintChip: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  mintChipText: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.mintDark },
  amberChip: {
    backgroundColor: PAWTY_COLORS.amberSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  amberChipText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  radarBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  passBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PAWTY_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passBtnText: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.slate },
  likeBtn: {
    flex: 2,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
});

