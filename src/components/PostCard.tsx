import React from 'react';
import {View, Text, TouchableOpacity, Image, FlatList, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Post, ALL_CATEGORIES} from '../data/mockData';
import {useTheme, Theme} from '../theme';
import AgeBadge from './AgeBadge';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onSave: () => void;
  onEmpathize?: () => void;
}

function PostCard({post, onPress, onLike, onSave, onEmpathize}: PostCardProps) {
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
          <View style={s.metaRow}>
            <Text style={s.meta}>{post.time}</Text>
            <Text style={s.metaSep}> · </Text>
            <View style={[s.catDot, {backgroundColor: theme.colors.boardColors[Math.max(0, ALL_CATEGORIES.indexOf(post.category) - 1)] || theme.colors.primary}]} />
            <Text style={s.meta}>{post.category}</Text>
          </View>
        </View>
        {post.isAnonymous ? (
          <View style={s.anonBadge}>
            <Text style={s.anonText}>익명</Text>
          </View>
        ) : post.authorAgeGroup ? (
          <AgeBadge ageGroup={post.authorAgeGroup} />
        ) : null}
      </View>

      {post.title ? (
        <Text style={s.title} numberOfLines={1}>
          {post.title}
        </Text>
      ) : null}
      <Text style={s.text} numberOfLines={2}>
        {post.text}
      </Text>

      {post.images && post.images.length > 0 && (
        <FlatList
          horizontal
          data={post.images}
          keyExtractor={(_, idx) => `img_${idx}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <Image
              source={{uri: item}}
              style={s.postImage}
              resizeMode="cover"
            />
          )}
          style={s.imageList}
        />
      )}

      <View style={s.actions}>
        <TouchableOpacity
          style={[
            s.empathyPill,
            post.empathized && {backgroundColor: theme.colors.accentLight},
          ]}
          onPress={onEmpathize}
          activeOpacity={0.7}>
          <Icon
            name={post.empathized ? 'hand-left' : 'hand-left-outline'}
            size={16}
            color={post.empathized ? theme.colors.accent : theme.colors.primary}
          />
          <Text style={[s.empathyText, post.empathized && {color: theme.colors.accent}]}>
            나도 그래요 {post.empathyCount || 0}
          </Text>
        </TouchableOpacity>
        <View style={s.ghostActions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={onLike}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon
              name={post.liked ? 'heart' : 'heart-outline'}
              size={18}
              color={post.liked ? theme.colors.error : theme.colors.textTertiary}
            />
            <Text style={[s.actionText, post.liked && {color: theme.colors.error}]}>
              {' '}{post.likes}
            </Text>
          </TouchableOpacity>
          <View style={s.actionBtn}>
            <Icon name="chatbubble-outline" size={18} color={theme.colors.textTertiary} />
            <Text style={s.actionText}>
              {' '}{post.comments.length}
            </Text>
          </View>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={onSave}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon
              name={post.saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={post.saved ? theme.colors.accent : theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.level2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.circle,
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
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    meta: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
    },
    metaSep: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
    },
    catDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.xs,
    },
    anonBadge: {
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm,
    },
    anonText: {
      ...theme.typography.overline,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    text: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    imageList: {
      marginBottom: theme.spacing.sm,
    },
    postImage: {
      width: 200,
      height: 150,
      borderRadius: theme.radius.sm,
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.xs,
    },
    empathyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.secondary,
      borderRadius: 999,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    empathyText: {
      ...theme.typography.overline,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    ghostActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.base,
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

export default React.memo(PostCard);
