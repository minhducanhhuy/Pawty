import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, cleanName } from '../context/MobilePawtyContext';
import { FacebookCommentSection } from '../components/FacebookCommentSection';
import { PawtyLoadingState } from '../components/PawtyLoadingState';
import { MobilePost } from '../types/mobileTypes';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MEDIA_WIDTH = SCREEN_WIDTH - 32 - 28;

export const MobileExploreScreen: React.FC = () => {
  const {
    theme,
    posts,
    isLoadingData,
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
    openUserProfileInTab,
    openLightboxMedia,
    setActiveModal,
    pullToRefreshExplore,
    ownerAvatarUrl,
    ownerAvatar,
    showToast,
  } = useMobilePawty();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);

  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [activePhotoIndexMap, setActivePhotoIndexMap] = useState<Record<string, number>>({});

  const handlePullRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const start = Date.now();
    try {
      await pullToRefreshExplore();
      const elapsed = Date.now() - start;
      if (elapsed < 900) {
        await new Promise((resolve) => setTimeout(resolve, 900 - elapsed));
      }
      showToast('Đã làm mới bảng tin Khám phá!');
    } catch {
      showToast('Đang kết nối lại máy chủ...');
    } finally {
      setIsRefreshing(false);
    }
  }, [pullToRefreshExplore, showToast]);

  const filteredPosts = posts.filter((post) => {
    if (!post) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const postContent = (post.content || '').toLowerCase();
    const authorName = (post.authorName || '').toLowerCase();
    const authorHandle = (post.authorHandle || '').toLowerCase();
    const tags = Array.isArray(post.tags) ? post.tags : [];
    return (
      postContent.includes(q) ||
      authorName.includes(q) ||
      authorHandle.includes(q) ||
      tags.some((h) => (h || '').toLowerCase().includes(q))
    );
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
    setActivePhotoIndexMap((prev) =>
      prev[postId] === index ? prev : { ...prev, [postId]: index }
    );
  };

  const flatListRef = useRef<FlatList<MobilePost>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const postLayoutsRef = useRef<Record<string, { y: number; height: number }>>({});

  const scrollToActiveComment = useCallback(
    (postId: string, currentKbH?: number) => {
      if (!flatListRef.current) return;
      const kbH = currentKbH || keyboardHeight || 300;
      const windowH = Dimensions.get('window').height;
      const visibleH = windowH - kbH - (StatusBar.currentHeight || 24) - 75;

      const layout = postLayoutsRef.current[postId];
      let targetOffset = 0;

      if (layout) {
        // Đáy của bài viết (vị trí đặt thanh viết bình luận) = layout.y + layout.height
        targetOffset = Math.max(0, layout.y + layout.height - visibleH + 40);
      } else {
        const postIndex = filteredPosts.findIndex((p) => p.id === postId);
        const approxY = postIndex >= 0 ? postIndex * 540 : 0;
        targetOffset = Math.max(0, approxY + 540 - visibleH + 40);
      }

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: targetOffset,
          animated: true,
        });
      }, 100);
    },
    [keyboardHeight, filteredPosts]
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates.height;
      setKeyboardHeight(h);
      if (expandedCommentId) {
        scrollToActiveComment(expandedCommentId, h);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [expandedCommentId, scrollToActiveComment]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : (StatusBar.currentHeight || 0) + 10}
    >
      <FlatList<MobilePost>
        ref={flatListRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 120 : 36 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            try {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                viewPosition: 1.0,
                animated: true,
              });
            } catch (e) {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }
          }, 80);
        }}
      data={filteredPosts}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handlePullRefresh}
          progressViewOffset={-1000}
          tintColor="transparent"
          colors={["transparent"]}
          progressBackgroundColor="transparent"
        />
      }
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          {isRefreshing && (
            <View style={styles.pullRefreshArea}>
              <PawtyLoadingState text="Đợi Pawty xíu nha" spinnerSize={84} />
            </View>
          )}
      {/* Search Bar with History & Trending Dropdown */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#8E8074" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài viết, #hashtag, người dùng..."
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

      {searchQuery.trim().length > 0 && (
        <View style={styles.activeFilterBanner}>
          <Text style={styles.activeFilterText}>
            Kết quả cho: <Text style={{ fontWeight: '800' }}>{searchQuery}</Text> (
            {filteredPosts.length} bài)
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearFilterLink, { color: theme.primary }]}>Bỏ lọc</Text>
          </TouchableOpacity>
        </View>
      )}


        </View>
      }
      ListEmptyComponent={
        (isLoadingData || isRefreshing) && !searchQuery.trim() ? (
          <View style={styles.loadingFeedContainer}>
            <PawtyLoadingState
              text="Đợi Pawty xíu nha"
              subtext="Đang kết nối cộng đồng Boss và tải bảng tin mới..."
              spinnerSize={84}
            />
          </View>
        ) : (
          <View style={styles.emptyFeedCard}>
          <View style={[styles.emptyFeedIconCircle, { backgroundColor: theme.primarySoft }]}>
            <Feather name="paw" size={28} color={theme.primary} />
          </View>
          <Text style={styles.emptyFeedTitle}>
            {searchQuery.trim()
              ? 'Không tìm thấy bài viết phù hợp'
              : 'Chưa có bài đăng nào trên Khám phá'}
          </Text>
          <Text style={styles.emptyFeedSub}>
            {searchQuery.trim()
              ? 'Thử tìm kiếm với từ khóa hoặc hashtag khác nhé.'
              : 'Hãy là người đầu tiên chia sẻ hình ảnh đáng yêu của thú cưng hoặc kéo xuống để làm mới bảng tin!'}
          </Text>
          {!searchQuery.trim() && (
            <TouchableOpacity
              style={[styles.emptyFeedActionBtn, { backgroundColor: theme.primary }]}
              onPress={() => setActiveModal('new_moment')}
            >
              <Feather name="plus" size={15} color="#FFFFFF" />
              <Text style={styles.emptyFeedActionText}>Đăng khoảnh khắc đầu tiên</Text>
            </TouchableOpacity>
          )}
        </View>
        )
      }
      renderItem={({ item: post }) => {
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
              <View
                key={post.id}
                style={styles.postCard}
                onLayout={(e) => {
                  postLayoutsRef.current[post.id] = e.nativeEvent.layout;
                }}
              >
                <View style={styles.postHeader}>
                  <TouchableOpacity
                    style={styles.authorTouchRow}
                    onPress={() => openPublicUserProfile(post.authorHandle)}
                    activeOpacity={0.7}
                  >
                    {post.authorAvatar ? (
                      <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
                    ) : (
                      <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
                        <Feather name="user" size={18} color="#8E8074" />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={styles.authorRow}>
                        <Text style={styles.authorName}>{cleanName(post.authorName)}</Text>
                        
                      </View>
                      <Text style={styles.postMeta}>
                        {post.categoryLabel} · {post.createdAt}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.viewProfileHeaderBtn,
                      { borderColor: theme.border, backgroundColor: theme.surface },
                    ]}
                    onPress={() => openUserProfileInTab(post.authorHandle)}
                    activeOpacity={0.7}
                  >
                    <Feather name="user" size={12} color={theme.primary} />
                    <Text style={[styles.viewProfileHeaderBtnText, { color: theme.primary }]}>
                      Hồ sơ
                    </Text>
                  </TouchableOpacity>
                </View>

                {post.content ? <Text style={styles.caption}>{post.content}</Text> : null}

                {post.tags.length > 0 && (
                  <View style={styles.hashtagRow}>
                    {post.tags.map((tag) => (
                      <TouchableOpacity key={tag} onPress={() => handleSelectSuggestion(tag)}>
                        <Text style={[styles.hashtagText, { color: theme.primary }]}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Media Render: Video Player or Horizontal Multi-Photo Carousel */}
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
                        {isPlayingVideo
                          ? 'Đang phát Video'
                          : `Video · ${post.videoDuration || '0:18'}`}
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

                {/* Action Row with Paw icon */}
                <View style={styles.igActionRow}>
                  <View style={styles.igActionLeft}>
                    <TouchableOpacity
                      style={styles.igActionBtn}
                      onPress={() => toggleReaction(post.id)}
                    >
                      <Feather
                        name="paw"
                        size={20}
                        color={isLiked ? theme.primary : '#2C2520'}
                        fill={isLiked ? theme.primary : 'none'}
                      />
                      <Text
                        style={[
                          styles.igActionCount,
                          isLiked && { color: theme.primary, fontWeight: '800' },
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
                      <Text style={styles.igActionCount}>
                        {(post.comments || []).reduce(
                          (sum, c) => sum + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
                          0
                        )}
                      </Text>
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
                  <FacebookCommentSection
                    postId={post.id}
                    comments={post.comments}
                    currentUserAvatar={(ownerAvatarUrl || ownerAvatar || '').trim()}
                    onOpenProfile={openPublicUserProfile}
                    compact
                    onFocusInput={() => scrollToActiveComment(post.id)}
                  />
                )}
              </View>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      removeClippedSubviews={true}
      />
    </KeyboardAvoidingView>
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
  emptyFeedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    marginTop: 8,
  },
  emptyFeedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyFeedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyFeedSub: {
    fontSize: 13,
    color: '#7A6E63',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyFeedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  emptyFeedActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
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
  authorAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5DDD3',
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
  viewProfileHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
    marginLeft: 6,
  },
  viewProfileHeaderBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pullRefreshArea: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingFeedContainer: {
    paddingVertical: 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});