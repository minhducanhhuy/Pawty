import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { ModalSheet, Avatar, Button } from '../../components';
import { MomentComment } from '../../types';
import { api } from '../../api/endpoints';
import { useTranslation } from '../../i18n';

interface CommentsSheetProps {
  momentId: string | null;
  onClose: () => void;
  onCommentAdded: (momentId: string) => void;
}

export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  momentId,
  onClose,
  onCommentAdded,
}) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<MomentComment[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!momentId) return;
    api
      .getComments(momentId)
      .then((res) => setComments(res.items))
      .catch(() => {});
  }, [momentId]);

  const handleSend = async () => {
    if (!momentId || !text.trim()) return;
    const created = await api.postComment(momentId, text.trim());
    setComments((prev) => [...prev, created]);
    setText('');
    onCommentAdded(momentId);
  };

  return (
    <ModalSheet visible={Boolean(momentId)} title={`💬 ${t('feed.comments.title')}`} onClose={onClose}>
      <View style={styles.container}>
        {comments.length === 0 ? (
          <Text style={styles.empty}>Chưa có bình luận nào. Hãy thả chiếc bình luận đầu tiên!</Text>
        ) : (
          comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <Avatar uri={c.userAvatarUrl} size={36} />
              <View style={styles.bubble}>
                <View style={styles.bubbleHeader}>
                  <Text style={styles.userName}>{c.userName}</Text>
                  <Text style={styles.time}>{c.createdAt}</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Viết bình luận khen Boss..."
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
          />
          <Button title="Gửi" size="sm" onPress={handleSend} />
        </View>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  empty: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center', marginVertical: 12 },
  commentRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  userName: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '800' },
  time: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.textMuted },
  commentText: { ...TYPOGRAPHY.body, color: COLORS.textBody },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    ...TYPOGRAPHY.body,
    color: COLORS.textDark,
  },
});
