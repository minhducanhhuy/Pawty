import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Feather } from './FeatherIcon';
import { useMobilePawty, cleanName } from '../context/MobilePawtyContext';
import { MobilePost } from '../types/mobileTypes';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const COMMENTS_PAGE_SIZE = 5;

interface FacebookCommentModalProps {
  visible: boolean;
  onClose: () => void;
  post: MobilePost | null;
  currentUserAvatar?: string;
  onOpenProfile?: (handle: string) => void;
}

interface ReplyingTarget {
  rootCommentId: string;
  targetCommentId: string;
  targetAuthorName: string;
}

export const FacebookCommentModal: React.FC<FacebookCommentModalProps> = ({
  visible,
  onClose,
  post,
  currentUserAvatar,
  onOpenProfile,
}) => {
  const { theme, addComment, addCommentReply, toggleCommentLike } = useMobilePawty();

  const [inputText, setInputText] = useState('');
  const [replyingInfo, setReplyingInfo] = useState<ReplyingTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  
  // Lazy loading bình luận Facebook-style (mỗi lần tải thêm 5 bình luận)
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);

  const inputRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);

  const postId = post?.id || '';
  const rawComments = post?.comments || [];

  // Reset trạng thái khi đổi bài viết hoặc mở lại modal
  useEffect(() => {
    if (visible) {
      setVisibleCount(COMMENTS_PAGE_SIZE);
      setReplyingInfo(null);
      setInputText('');
    }
  }, [visible, postId]);

  // Tổng số lượng bình luận bao gồm cả bình luận gốc và toàn bộ câu trả lời con
  const totalCommentsCount = useMemo(() => {
    return rawComments.reduce(
      (sum, c) => sum + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
      0
    );
  }, [rawComments]);

  // Danh sách bình luận được phân trang lazy loading (tối đa visibleCount bình luận gốc)
  const displayedComments = useMemo(() => {
    return rawComments.slice(0, visibleCount);
  }, [rawComments, visibleCount]);

  const hasMoreComments = rawComments.length > visibleCount;
  const remainingCount = rawComments.length - visibleCount;

  const handleLoadMoreComments = () => {
    setVisibleCount((prev) => Math.min(prev + COMMENTS_PAGE_SIZE, rawComments.length));
  };

  const handleStartReply = (
    rootCommentId: string,
    targetCommentId: string,
    authorName: string
  ) => {
    const cleaned = cleanName(authorName);
    setReplyingInfo({
      rootCommentId,
      targetCommentId,
      targetAuthorName: cleaned,
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
  };

  const handleCancelReply = () => {
    setReplyingInfo(null);
  };

  const handleToggleRepliesVisibility = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSubmitting || !postId) return;

    try {
      setIsSubmitting(true);
      setInputText('');

      if (replyingInfo) {
        await addCommentReply(
          postId,
          replyingInfo.rootCommentId,
          text,
          replyingInfo.targetAuthorName
        );
        setReplyingInfo(null);
      } else {
        await addComment(postId, text);
      }

      // Cuộn nhẹ xuống dưới để xem bình luận mới
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 250);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper hiển thị nội dung câu trả lời chuẩn Facebook: tô đậm mention @Tên nếu có
  const renderReplyContent = (content: string) => {
    const mentionMatch = content.match(/^(@[^\s]+(?:\s+[^\s]+)?)\s*(.*)$/);
    if (mentionMatch) {
      const mentionPart = mentionMatch[1];
      const restPart = mentionMatch[2];
      return (
        <Text style={styles.commentContentText}>
          <Text style={[styles.replyMentionHighlight, { color: theme.primary }]}>{mentionPart} </Text>
          {restPart}
        </Text>
      );
    }
    return <Text style={styles.commentContentText}>{content}</Text>;
  };

  if (!visible || !post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Vùng bấm ra ngoài để đóng modal */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalDismissArea} />
        </TouchableWithoutFeedback>

        {/* Khung Bottom Sheet Modal chuẩn Facebook */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          {/* 1. Drag Handle Pill & Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTitleRow}>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerMainTitle}>Bình luận</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{totalCommentsCount}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#5C5046" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Scrollable Comments List với Lazy Loading */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Nút Lazy Loading bình luận: Tải thêm bình luận cũ hơn nếu > 5 bình luận */}
            {hasMoreComments && (
              <TouchableOpacity
                style={styles.loadMoreRow}
                onPress={handleLoadMoreComments}
                activeOpacity={0.8}
              >
                <Feather name="corner-down-right" size={13} color={theme.primary} />
                <Text style={[styles.loadMoreText, { color: theme.primary }]}>
                  Xem các bình luận trước ({remainingCount} bình luận còn lại)...
                </Text>
              </TouchableOpacity>
            )}

            {rawComments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="message-circle" size={24} color="#B8ABA0" />
                </View>
                <Text style={styles.emptyTitle}>Chưa có bình luận nào</Text>
                <Text style={styles.emptySubtitle}>Hãy là người đầu tiên chia sẻ cảm nghĩ về bài viết này!</Text>
              </View>
            ) : (
              displayedComments.map((cmt) => {
                const replies = Array.isArray(cmt.replies) ? cmt.replies : [];
                const hasReplies = replies.length > 0;
                const isRepliesVisible = expandedReplies[cmt.id] !== false;

                return (
                  <View key={cmt.id} style={styles.commentItemWrap}>
                    {/* Bình luận gốc cha (Root Comment) */}
                    <View style={styles.commentRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => cmt.authorHandle && onOpenProfile?.(cmt.authorHandle)}
                      >
                        {cmt.authorAvatar ? (
                          <Image source={{ uri: cmt.authorAvatar }} style={styles.authorAvatar} />
                        ) : (
                          <View style={[styles.authorAvatar, styles.avatarFallback]}>
                            <Feather name="user" size={15} color="#7E6E60" />
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={styles.bubbleAndActions}>
                        <View style={styles.commentBubble}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => cmt.authorHandle && onOpenProfile?.(cmt.authorHandle)}
                          >
                            <Text style={styles.authorNameText}>{cleanName(cmt.authorName)}</Text>
                          </TouchableOpacity>
                          <Text style={styles.commentContentText}>{cmt.content}</Text>
                        </View>

                        {/* Thanh hành động bên dưới: Giờ · Thích · Trả lời */}
                        <View style={styles.metaActionRow}>
                          <Text style={styles.timeText}>{cmt.createdAt || 'Vừa xong'}</Text>

                          <TouchableOpacity
                            onPress={() => toggleCommentLike(postId, cmt.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={[styles.actionText, cmt.isLiked && { color: theme.primary, fontWeight: '800' }]}>
                              {cmt.isLiked ? 'Đã thích' : 'Thích'}
                              {(cmt.likesCount || 0) > 0 ? ` · ❤️ ${cmt.likesCount}` : ''}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleStartReply(cmt.id, cmt.id, cmt.authorName)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={styles.replyBtnText}>Trả lời</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Cây phản hồi con chuẩn Facebook */}
                    {hasReplies && (
                      <View style={styles.repliesBranchWrap}>
                        {replies.length > 3 && (
                          <TouchableOpacity
                            onPress={() => handleToggleRepliesVisibility(cmt.id)}
                            style={styles.toggleRepliesBtn}
                          >
                            <Feather
                              name={isRepliesVisible ? 'chevron-up' : 'corner-down-right'}
                              size={12}
                              color="#7E6E60"
                            />
                            <Text style={styles.toggleRepliesText}>
                              {isRepliesVisible
                                ? 'Thu gọn phản hồi'
                                : `Xem thêm ${replies.length} câu trả lời`}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {isRepliesVisible &&
                          replies.map((rep) => (
                            <View key={rep.id} style={styles.replyRow}>
                              <View style={styles.branchCurvedLine} />

                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => rep.authorHandle && onOpenProfile?.(rep.authorHandle)}
                              >
                                {rep.authorAvatar ? (
                                  <Image source={{ uri: rep.authorAvatar }} style={styles.replyAvatar} />
                                ) : (
                                  <View style={[styles.replyAvatar, styles.avatarFallback]}>
                                    <Feather name="user" size={12} color="#7E6E60" />
                                  </View>
                                )}
                              </TouchableOpacity>

                              <View style={styles.bubbleAndActions}>
                                <View style={[styles.commentBubble, styles.replyBubble]}>
                                  <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => rep.authorHandle && onOpenProfile?.(rep.authorHandle)}
                                  >
                                    <Text style={styles.authorNameText}>{cleanName(rep.authorName)}</Text>
                                  </TouchableOpacity>
                                  {renderReplyContent(rep.content)}
                                </View>

                                <View style={styles.metaActionRow}>
                                  <Text style={styles.timeText}>{rep.createdAt || 'Vừa xong'}</Text>

                                  <TouchableOpacity
                                    onPress={() => toggleCommentLike(postId, rep.id)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  >
                                    <Text style={[styles.actionText, rep.isLiked && { color: theme.primary, fontWeight: '800' }]}>
                                      {rep.isLiked ? 'Đã thích' : 'Thích'}
                                      {(rep.likesCount || 0) > 0 ? ` · ❤️ ${rep.likesCount}` : ''}
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    onPress={() => handleStartReply(cmt.id, rep.id, rep.authorName)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  >
                                    <Text style={styles.replyBtnText}>Trả lời</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* 3. Pinned Input Area ở đáy Bottom Sheet */}
          <View style={styles.bottomInputContainer}>
            {/* Banner nhỏ hiển thị mục tiêu đang trả lời */}
            {replyingInfo && (
              <View style={[styles.replyingBanner, { backgroundColor: theme.primarySoft }]}>
                <View style={styles.replyingBannerLeft}>
                  <Feather name="corner-down-right" size={12} color={theme.primary} />
                  <Text style={styles.replyingBannerText} numberOfLines={1}>
                    Đang trả lời <Text style={{ fontWeight: '800', color: theme.primary }}>{replyingInfo.targetAuthorName}</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={handleCancelReply} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Feather name="x" size={14} color="#7E6E60" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              {currentUserAvatar ? (
                <Image source={{ uri: currentUserAvatar }} style={styles.inputAvatar} />
              ) : (
                <View style={[styles.inputAvatar, styles.avatarFallback]}>
                  <Feather name="user" size={14} color="#7E6E60" />
                </View>
              )}

              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder={replyingInfo ? `Trả lời @${replyingInfo.targetAuthorName}...` : 'Viết bình luận công khai...'}
                  placeholderTextColor="#9C8E82"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline={true}
                  maxLength={500}
                />

                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    { backgroundColor: inputText.trim() ? theme.primary : '#EAE4DC' },
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="arrow-up" size={16} color={inputText.trim() ? '#FFFFFF' : '#A89E96'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE2',
    alignItems: 'center',
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6CFC7',
    marginBottom: 10,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
  },
  countBadge: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6E63',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  loadMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    marginBottom: 14,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A3E36',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7D75',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  commentItemWrap: {
    marginBottom: 16,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBE5DE',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleAndActions: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F3EFEA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  authorNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 2,
  },
  commentContentText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#3D342E',
  },
  replyMentionHighlight: {
    fontWeight: '800',
  },
  metaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 6,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#8E8278',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  replyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C5046',
  },
  repliesBranchWrap: {
    marginLeft: 36,
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 1.5,
    borderLeftColor: '#E6DDD4',
  },
  toggleRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    marginBottom: 6,
  },
  toggleRepliesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E6E60',
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    position: 'relative',
  },
  branchCurvedLine: {
    position: 'absolute',
    left: -12,
    top: 14,
    width: 10,
    height: 1.5,
    backgroundColor: '#E6DDD4',
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBE5DE',
  },
  replyBubble: {
    backgroundColor: '#F8F5F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bottomInputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EAE2',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  replyingBannerText: {
    fontSize: 12,
    color: '#5C5046',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBE5DE',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2520',
    maxHeight: 90,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

