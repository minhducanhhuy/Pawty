import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from './FeatherIcon';
import { useMobilePawty, cleanName } from '../context/MobilePawtyContext';
import { MobilePost } from '../types/mobileTypes';

interface FacebookCommentSectionProps {
  postId: string;
  comments?: MobilePost['comments'];
  currentUserAvatar?: string;
  onOpenProfile?: (handle: string) => void;
  compact?: boolean;
  onFocusInput?: () => void;
}

interface ReplyingTarget {
  rootCommentId: string;
  targetCommentId: string;
  targetAuthorName: string;
}

export const FacebookCommentSection: React.FC<FacebookCommentSectionProps> = ({
  postId,
  comments = [],
  currentUserAvatar,
  onOpenProfile,
  compact = false,
  onFocusInput,
}) => {
  const { addComment, addCommentReply, toggleCommentLike } = useMobilePawty();

  const [inputText, setInputText] = useState('');
  const [replyingInfo, setReplyingInfo] = useState<ReplyingTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const inputRef = useRef<any>(null);

  // Tổng số lượng bình luận bao gồm cả bình luận gốc và toàn bộ câu trả lời con
  const totalCommentsCount = useMemo(() => {
    return (comments || []).reduce(
      (sum, c) => sum + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
      0
    );
  }, [comments]);

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

    onFocusInput?.();

    // Tự động kích hoạt bàn phím và focus ngay vào ô nhập liệu, kích hoạt đẩy view
    setTimeout(() => {
      inputRef.current?.focus();
      onFocusInput?.();
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
    if (!text || isSubmitting) return;

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
          <Text style={styles.replyMentionHighlight}>{mentionPart} </Text>
          {restPart}
        </Text>
      );
    }
    return <Text style={styles.commentContentText}>{content}</Text>;
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Tiêu đề tổng số bình luận */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          Bình luận ({totalCommentsCount})
        </Text>
      </View>

      {/* Danh sách bình luận dạng cây chuẩn Facebook */}
      <View style={styles.commentsList}>
        {comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</Text>
          </View>
        ) : (
          comments.map((cmt) => {
            const replies = Array.isArray(cmt.replies) ? cmt.replies : [];
            const hasReplies = replies.length > 0;
            // Mặc định luôn mở để người dùng nhìn thấy ngay câu trả lời đã rep
            const isRepliesVisible = expandedReplies[cmt.id] !== false;

            return (
              <View key={cmt.id} style={styles.commentItemWrap}>
                {/* 1. Bình luận gốc cha (Root Comment) */}
                <View style={styles.commentRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => cmt.authorHandle && onOpenProfile?.(cmt.authorHandle)}
                  >
                    {cmt.authorAvatar ? (
                      <Image source={{ uri: cmt.authorAvatar }} style={styles.authorAvatar} />
                    ) : (
                      <View style={[styles.authorAvatar, styles.avatarFallback]}>
                        <Feather name="user" size={14} color="#7E6E60" />
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

                    {/* Thanh hành động bên dưới bong bóng: Giờ · Thích · Trả lời */}
                    <View style={styles.metaActionRow}>
                      <Text style={styles.timeText}>{cmt.createdAt || 'Vừa xong'}</Text>

                      <TouchableOpacity
                        onPress={() => toggleCommentLike(postId, cmt.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[styles.actionText, cmt.isLiked && styles.actionTextLiked]}>
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

                {/* 2. Cây phản hồi con chuẩn Facebook (Lùi dòng + Vạch kẻ kết nối chữ L) */}
                {hasReplies && (
                  <View style={styles.repliesBranchWrap}>
                    {/* Tùy chọn thu gọn nếu có quá nhiều replies */}
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
                            : `Xem thêm ${replies.length} phản hồi...`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {isRepliesVisible &&
                      replies.map((rep) => (
                        <View key={rep.id} style={styles.replyRow}>
                          {/* Đường kẻ nhánh chữ L mềm mại phong cách Facebook */}
                          <View style={styles.branchCurvedLine} />

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => rep.authorHandle && onOpenProfile?.(rep.authorHandle)}
                          >
                            {rep.authorAvatar ? (
                              <Image source={{ uri: rep.authorAvatar }} style={styles.replyAvatar} />
                            ) : (
                              <View style={[styles.replyAvatar, styles.avatarFallback]}>
                                <Feather name="user" size={11} color="#7E6E60" />
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
                                <Text style={[styles.actionText, rep.isLiked && styles.actionTextLiked]}>
                                  {rep.isLiked ? 'Đã thích' : 'Thích'}
                                  {(rep.likesCount || 0) > 0 ? ` · ❤️ ${rep.likesCount}` : ''}
                                </Text>
                              </TouchableOpacity>

                              {/* Bấm Trả lời vào câu trả lời con -> Tự động rep target này */}
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
      </View>

      {/* 3. Banner chỉ báo đang trả lời ai chuẩn Facebook */}
      {replyingInfo && (
        <View style={styles.replyingBanner}>
          <View style={styles.replyingBannerLeft}>
            <Feather name="corner-down-right" size={14} color="#FF6F61" />
            <Text style={styles.replyingBannerText}>
              Đang trả lời <Text style={styles.replyingTargetBold}>{replyingInfo.targetAuthorName}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCancelReply}
            style={styles.replyingCancelBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={14} color="#7E6E60" />
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Thanh nhập liệu bình luận & gửi */}
      <View style={styles.inputContainer}>
        {currentUserAvatar ? (
          <Image source={{ uri: currentUserAvatar }} style={styles.currentUserAvatar} />
        ) : (
          <View style={[styles.currentUserAvatar, styles.avatarFallback]}>
            <Feather name="user" size={13} color="#7E6E60" />
          </View>
        )}

        <TextInput
          ref={inputRef}
          style={styles.textInput}
          onFocus={onFocusInput}
          placeholder={
            replyingInfo
              ? `Trả lời ${replyingInfo.targetAuthorName}...`
              : 'Viết bình luận công khai...'
          }
          placeholderTextColor="#A89E94"
          value={inputText}
          onChangeText={setInputText}
          multiline={false}
          maxLength={300}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            inputText.trim().length > 0 ? styles.sendBtnActive : styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={14} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2ECE4',
  },
  containerCompact: {
    paddingTop: 8,
  },
  headerRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  commentsList: {
    gap: 12,
  },
  emptyContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#8A7D75',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  commentItemWrap: {
    marginBottom: 6,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  currentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    backgroundColor: '#EADFD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleAndActions: {
    flex: 1,
    marginLeft: 8,
  },
  commentBubble: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    maxWidth: '96%',
    borderWidth: 1,
    borderColor: '#F0ECE4',
  },
  replyBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECE4DA',
  },
  authorNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 2,
  },
  commentContentText: {
    fontSize: 13,
    color: '#3A332C',
    lineHeight: 18,
  },
  replyMentionHighlight: {
    color: '#FF6F61',
    fontWeight: '800',
  },
  metaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#8A7D75',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B5E59',
  },
  actionTextLiked: {
    color: '#FF6F61',
  },
  replyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6F61',
  },
  /* Cây phản hồi Facebook */
  repliesBranchWrap: {
    marginLeft: 18,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#EBE4DC',
    marginTop: 8,
    gap: 8,
  },
  toggleRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  toggleRepliesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E6E60',
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  branchCurvedLine: {
    position: 'absolute',
    left: -18,
    top: 12,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#EBE4DC',
    borderBottomLeftRadius: 8,
  },
  /* Chỉ báo đang trả lời ai */
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginTop: 10,
    marginBottom: 4,
  },
  replyingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyingBannerText: {
    fontSize: 12,
    color: '#5C5046',
  },
  replyingTargetBold: {
    fontWeight: '800',
    color: '#FF6F61',
  },
  replyingCancelBtn: {
    padding: 4,
  },
  /* Thanh nhập liệu */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1815',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#FF6F61',
  },
  sendBtnDisabled: {
    backgroundColor: '#DECFC5',
  },
});
