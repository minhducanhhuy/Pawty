import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MEDIA_WIDTH = SCREEN_WIDTH - 32 - 28;

export const MobileExploreScreen: React.FC = () => {
  const {
    theme,
    posts,
    searchHistory,
    trendingSuggestions,
    isSearchPanelOpen,
    setIsSearchPanelOpen,
    recordSearchQuery,
    removeSearchHistoryItem,
    clearSearchHistory,
    toggleReaction,
    toggleSavePost,
    addComment,
    sharePost,
    openPublicUserProfile,
    openLightboxMedia,
    setActiveModal,
  } = useMobilePawty();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [activePhotoIndexMap, setActivePhotoIndexMap] = useState<Record<string, number>>({});

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      post.content.toLowerCase().includes(q) ||
      post.authorName.toLowerCase().includes(q) ||
      post.authorHandle.toLowerCase().includes(q) ||
      post.tags.some((h) => h.toLowerCase().includes(q));
    return matchQuery;
  });

  const handleSelectSuggestion = (keyword: string) => {
    setSearchQuery(keyword);
    recordSearchQuery(keyword);
    setIsSearchPanelOpen(false);
  };

  const handlePhotoScroll = (postId: string, event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const width = event.nativeEvent.layoutMeasurement.width || CARD_MEDIA_WIDTH;
    const index = Math.round(offsetX / width);
    setActivePhotoIndexMap((prev) => (prev[postId] === index ? prev : { ...prev, [postId]: index }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search Bar with History & Trending Dropdown */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#8E8074" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài viết, #hashtag, @tài_khoản..."
            placeholderTextColor="#A3968A"
            value={searchQuery}
            onFocus={() => setIsSearchPanelOpen(true)}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              recordSearchQuery(searchQuery);
              setIsSearchPanelOpen(false);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#8E8074" />
            </TouchableOpacity>
          )}
          {isSearchPanelOpen && (
            <TouchableOpacity
              onPress={() => setIsSearchPanelOpen(false)}
              style={styles.closeSearchBtn}
            >
              <Text style={[styles.closeSearchText, { color: theme.primary }]}>Đóng</Text>
            </TouchableOpacity>
          )}
        </View>

        {isSearchPanelOpen && (
          <View style={styles.searchDropdown}>
            {searchHistory.length > 0 && (
              <View style={styles.dropdownGroup}>
                <View style={styles.dropdownHeaderRow}>
                  <View style={styles.dropdownTitleRow}>
                    <Feather name="clock" size={13} color="#7A6E63" />
                    <Text style={styles.dropdownGroupTitle}>Lịch sử tìm kiếm</Text>
                  </View>
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Text style={styles.clearHistoryText}>Xóa hết</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.historyList}>
                  {searchHistory.map((item) => (
                    <View key={item} style={styles.historyChip}>
                      <TouchableOpacity
                        style={styles.historyChipMain}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <Text style={styles.historyChipText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeSearchHistoryItem(item)}
                        style={styles.historyRemoveBtn}
                      >
                        <Feather name="x" size={12} color="#8E8074" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.dropdownGroup}>
              <View style={styles.dropdownTitleRow}>
                <Feather name="trending-up" size={13} color={theme.primary} />
                <Text style={styles.dropdownGroupTitle}>Đề xuất & Thịnh hành</Text>
              </View>
              <View style={styles.trendingWrap}>
                {trendingSuggestions.map((trend) => (
                  <TouchableOpacity
                    key={trend}
                    style={[styles.trendingChip, { backgroundColor: theme.primarySoft }]}
                    onPress={() => handleSelectSuggestion(trend)}
                  >
                    <Text style={[styles.trendingChipText, { color: theme.primary }]}>
                      {trend}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Quick Composer Prompt Bar */}
      <TouchableOpacity
        style={styles.composerBar}
        activeOpacity={0.85}
        onPress={() => setActiveModal('new_moment')}
      >
        <View style={[styles.composerIconCircle, { backgroundColor: theme.primarySoft }]}>
          <Feather name="camera" size={16} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.composerTitle}>Chia sẻ ảnh hoặc video của thú cưng...</Text>
          <Text style={styles.composerSub}>Chọn nhiều ảnh hoặc video trực tiếp từ điện thoại</Text>
        </View>
        <View style={[styles.composerBtn, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.composerBtnText}>Đăng bài</Text>
        </View>
      </TouchableOpacity>

      {searchQuery.trim().length > 0 && (
        <View style={styles.activeFilterBanner}>
          <Text style={styles.activeFilterText}>
            Kết quả cho: <Text style={{ fontWeight: '800' }}>{searchQuery}</Text> ({filteredPosts.length} bài)
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearFilterLink, { color: theme.primary }]}>Bỏ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instagram-style Social Feed */}
      <View style={styles.stack}>
        {filteredPosts.map((post) => {
          const isCommentOpen = expandedCommentId === post.id;
          const isPlayingVideo = playingVideoId === post.id;
          const galleryUrls = post.mediaUrls.length > 0 ? post.mediaUrls : [];
          const currentPhotoIdx = activePhotoIndexMap[post.id] || 0;
          const totalLikes =
            post.reactions.paws +
            post.reactions.love +
            post.reactions.haha +
            post.reactions.wow +
            post.reactions.helpful;
          const isLiked = Boolean(post.userReaction);

          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <TouchableOpacity
                  style={styles.authorTouchRow}
                  onPress={() => openPublicUserProfile(post.authorHandle)}
                >
                  <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.authorRow}>
                      <Text style={styles.authorName}>{post.authorName}</Text>
                      <Text style={styles.authorHandleText}>{post.authorHandle}</Text>
                      <View style={[styles.badgePill, { backgroundColor: theme.primarySoft }]}>
                        <Feather name="award" size={11} color={theme.primary} />
                        <Text style={[styles.badgeText, { color: theme.primary }]}>
                          {post.authorNickname}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postMeta}>{post.createdAt}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {post.aiSosMatch && (
                <View style={styles.aiMatchBanner}>
                  <View style={styles.aiMatchHeaderRow}>
                    <View style={styles.aiMatchBadge}>
                      <Feather name="cpu" size={12} color="#FFFFFF" />
                      <Text style={styles.aiMatchBadgeText}>AI RADAR PHÁT HIỆN</Text>
                    </View>
                    <View style={styles.aiMatchScorePill}>
                      <Text style={styles.aiMatchScoreText}>Khớp {post.aiSosMatch.matchScore}%</Text>
                    </View>
                  </View>
                  <Text style={styles.aiMatchTitle}>
                    Nghi vấn khớp với tin SOS của bé <Text style={{ fontWeight: '800', color: '#E17055' }}>{post.aiSosMatch.petName}</Text>
                  </Text>
                  <View style={styles.aiMatchMetaRow}>
                    <Feather name="map-pin" size={12} color="#E17055" />
                    <Text style={styles.aiMatchLocationText}>{post.aiSosMatch.detectedLocationName}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.caption}>{post.content}</Text>

              {post.tags.length > 0 && (
                <View style={styles.hashtagRow}>
                  {post.tags.map((tag) => (
                    <TouchableOpacity key={tag} onPress={() => handleSelectSuggestion(tag)}>
                      <Text style={[styles.hashtagText, { color: theme.primary }]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Media Render: Video Player or Horizontal Swipeable Multi-Photo Carousel */}
              {post.mediaType === 'video' && galleryUrls.length > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.92}
                  style={styles.mediaContainer}
                  onPress={() => setPlayingVideoId(isPlayingVideo ? null : post.id)}
                >
                  <Image source={{ uri: galleryUrls[0] }} style={styles.postImage} />
                  <View style={styles.videoBadgeTopRight}>
                    <Feather name="video" size={12} color="#FFFFFF" />
                    <Text style={styles.videoBadgeText}>
                      {isPlayingVideo ? 'Đang phát Video' : `Video · ${post.videoDuration || '0:18'}`}
                    </Text>
                  </View>
                  <View style={styles.videoCenterOverlay}>
                    <View
                      style={[
                        styles.videoPlayCircle,
                        isPlayingVideo && { backgroundColor: 'rgba(62, 142, 108, 0.9)' },
                      ]}
                    >
                      <Feather
                        name={isPlayingVideo ? 'pause' : 'play'}
                        size={22}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.zoomCornerBtn}
                    onPress={() =>
                      openLightboxMedia({
                        postId: post.id,
                        mediaUrls: galleryUrls,
                        initialIndex: 0,
                        mediaType: 'video',
                        videoDuration: post.videoDuration,
                        caption: post.content,
                        authorName: post.authorName,
                      })
                    }
                  >
                    <Feather name="maximize-2" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : galleryUrls.length > 0 ? (
                <View style={styles.carouselWrapper}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => handlePhotoScroll(post.id, e)}
                    scrollEventThrottle={16}
                  >
                    {galleryUrls.map((imgUrl, idx) => (
                      <TouchableOpacity
                        key={`${post.id}-img-${idx}`}
                        activeOpacity={0.95}
                        style={{ width: CARD_MEDIA_WIDTH }}
                        onPress={() =>
                          openLightboxMedia({
                            postId: post.id,
                            mediaUrls: galleryUrls,
                            initialIndex: idx,
                            mediaType: 'image',
                            caption: post.content,
                            authorName: post.authorName,
                          })
                        }
                      >
                        <Image
                          source={{ uri: imgUrl }}
                          style={[styles.postImage, { width: CARD_MEDIA_WIDTH }]}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {galleryUrls.length > 1 && (
                    <View style={styles.photoCountBadge}>
                      <Text style={styles.photoCountText}>
                        {currentPhotoIdx + 1}/{galleryUrls.length}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.zoomCornerBtn}
                    onPress={() =>
                      openLightboxMedia({
                        postId: post.id,
                        mediaUrls: galleryUrls,
                        initialIndex: currentPhotoIdx,
                        mediaType: 'image',
                        caption: post.content,
                        authorName: post.authorName,
                      })
                    }
                  >
                    <Feather name="maximize-2" size={14} color="#FFFFFF" />
                  </TouchableOpacity>

                  {galleryUrls.length > 1 && (
                    <View style={styles.dotsRow}>
                      {galleryUrls.map((_, idx) => (
                        <View
                          key={`${post.id}-dot-${idx}`}
                          style={[
                            styles.dot,
                            idx === currentPhotoIdx && {
                              backgroundColor: theme.primary,
                              width: 16,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : null}

              {/* Instagram-style Action Row */}
              <View style={styles.igActionRow}>
                <View style={styles.igActionLeft}>
                  <TouchableOpacity
                    style={styles.igActionBtn}
                    onPress={() => toggleReaction(post.id)}
                  >
                    <Feather
                      name="heart"
                      size={20}
                      color={isLiked ? '#D9534F' : '#2C2520'}
                    />
                    <Text
                      style={[
                        styles.igActionCount,
                        isLiked && { color: '#D9534F', fontWeight: '800' },
                      ]}
                    >
                      {totalLikes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.igActionBtn}
                    onPress={() => setExpandedCommentId(isCommentOpen ? null : post.id)}
                  >
                    <Feather name="message-circle" size={20} color="#2C2520" />
                    <Text style={styles.igActionCount}>{post.comments.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.igActionBtn}
                    onPress={() => sharePost(post.id)}
                  >
                    <Feather name="share-2" size={19} color="#2C2520" />
                    <Text style={styles.igActionCount}>{post.shareCount}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => toggleSavePost(post.id)}
                  style={styles.igBookmarkBtn}
                >
                  <Feather
                    name="bookmark"
                    size={20}
                    color={post.isSaved ? theme.primary : '#2C2520'}
                  />
                </TouchableOpacity>
              </View>

              {isCommentOpen && (
                <View style={styles.commentBox}>
                  {post.comments.map((c) => (
                    <View key={c.id} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>
                        {c.authorName} <Text style={styles.commentTime}>· {c.createdAt}</Text>
                      </Text>
                      <Text style={styles.commentBody}>{c.content}</Text>
                    </View>
                  ))}
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Viết bình luận..."
                      placeholderTextColor="#A3968A"
                      value={commentInput}
                      onChangeText={setCommentInput}
                    />
                    <TouchableOpacity
                      style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        addComment(post.id, commentInput);
                        setCommentInput('');
                      }}
                    >
                      <Feather name="send" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
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
    paddingBottom: 28,
  },
  searchSection: {
    marginBottom: 10,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2520',
    paddingVertical: 0,
  },
  closeSearchBtn: {
    paddingLeft: 6,
  },
  closeSearchText: {
    fontSize: 12,
    fontWeight: '800',
  },
  searchDropdown: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5DDD3',
    gap: 14,
  },
  dropdownGroup: {
    gap: 8,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A3F35',
  },
  clearHistoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B85D43',
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    overflow: 'hidden',
  },
  historyChipMain: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  historyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A3F35',
  },
  historyRemoveBtn: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  trendingWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  trendingChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  trendingChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginBottom: 12,
  },
  composerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  composerSub: {
    fontSize: 11,
    color: '#8E8074',
    marginTop: 1,
  },
  composerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },
  composerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeFilterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#4A3F35',
  },
  clearFilterLink: {
    fontSize: 12,
    fontWeight: '800',
  },
  stack: {
    gap: 12,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorTouchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3EFEA',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  authorHandleText: {
    fontSize: 12,
    color: '#8E8074',
    fontWeight: '600',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  postMeta: {
    fontSize: 11,
    color: '#8E8074',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    color: '#2C2520',
    lineHeight: 20,
    marginBottom: 8,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mediaContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  carouselWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(28, 24, 21, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  zoomCornerBtn: {
    position: 'absolute',
    bottom: 12,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 24, 21, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8CFC5',
  },
  videoBadgeTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(28, 24, 21, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  videoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoCenterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(28, 24, 21, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  igActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  igActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  igActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  igActionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C2520',
  },
  igBookmarkBtn: {
    padding: 4,
  },
  commentBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
    gap: 8,
  },
  commentItem: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
  },
  commentTime: {
    fontWeight: '500',
    color: '#9C8E80',
  },
  commentBody: {
    fontSize: 13,
    color: '#4A3F35',
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2C2520',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiMatchBanner: {
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFF5F0',
    borderWidth: 1,
    borderColor: '#FFD9CC',
  },
  aiMatchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E17055',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiMatchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  aiMatchScorePill: {
    backgroundColor: '#FFE3D9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiMatchScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E17055',
  },
  aiMatchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2520',
    marginBottom: 4,
  },
  aiMatchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiMatchLocationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E17055',
  },
});
