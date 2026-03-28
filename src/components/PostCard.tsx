import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Post} from '../data/mockData';
import {useTheme, Theme} from '../theme';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onSave: () => void;
}

export default function PostCard({post, onPress, onLike, onSave}: PostCardProps) {
  const theme = useTheme();
  const s = makeStyles(theme);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{post.avatar}</Text>
        </View>
        <View style={s.headerInfo}>
          <Text style={s.user}>{post.user}</Text>
          <Text style={s.meta}>
            {post.time} · {post.category}
          </Text>
        </View>
        {post.isAnonymous && (
          <View style={s.anonBadge}>
            <Text style={s.anonText}>익명</Text>
          </View>
        )}
      </View>

      {post.title ? (
        <Text style={s.title} numberOfLines={1}>
          {post.title}
        </Text>
      ) : null}
      <Text style={s.text} numberOfLines={3}>
        {post.text}
      </Text>

      <View style={s.actions}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={onLike}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[s.actionText, post.liked && {color: theme.colors.error}]}>
            {post.liked ? '♥' : '♡'} {post.likes}
          </Text>
        </TouchableOpacity>
        <View style={s.actionBtn}>
          <Text style={s.actionText}>
            💬 {post.comments.length}
          </Text>
        </View>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={onSave}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[s.actionText, post.saved && {color: theme.colors.accent}]}>
            {post.saved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.md,
      padding: theme.spacing.base,
      ...theme.shadows.level2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    avatarText: {
      fontSize: 18,
    },
    headerInfo: {
      flex: 1,
    },
    user: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    meta: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    anonBadge: {
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.radius.sm,
    },
    anonText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    title: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    text: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    actions: {
      flexDirection: 'row',
      gap: 20,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
  });
