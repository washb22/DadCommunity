import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import * as postService from '../services/postService';
import * as followService from '../services/followService';
import {getRelativeTime} from '../data/mockData';
import {Comment} from '../data/mockData';

export default function PostDetailScreen({route, navigation}: any) {
  const {postId} = route.params;
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<{commentId: string; userName: string} | null>(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const post = state.posts.find(p => p.id === postId);

  // Check follow status on mount
  useEffect(() => {
    if (!state.uid || !post) return;
    const authorId = (post as any).userId;
    if (!authorId || authorId === state.uid) return;
    followService.isFollowing(state.uid, authorId).then(setIsFollowingAuthor).catch(() => {});
  }, [state.uid, post]);

  const handleToggleFollow = async () => {
    if (!state.uid || !post) return;
    const authorId = (post as any).userId;
    if (!authorId || authorId === state.uid) return;

    setFollowLoading(true);
    try {
      if (isFollowingAuthor) {
        await followService.unfollowUser(state.uid, authorId);
        setIsFollowingAuthor(false);
      } else {
        await followService.followUser(state.uid, authorId);
        setIsFollowingAuthor(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      const preview = post.text.length > 100 ? post.text.substring(0, 100) + '...' : post.text;
      await Share.share({
        title: post.title,
        message: `[아빠의 다락방] ${post.title}\n\n${preview}\n\n앱에서 더 보기: https://dadcommunity.app/post/${post.id}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Fetch comments from Firebase on mount
  const fetchComments = useCallback(async () => {
    try {
      const comments = await postService.fetchComments(postId);
      const enrichedComments: Comment[] = comments.map(c => {
        const ts =
          c.timestamp && typeof (c.timestamp as any).toDate === 'function'
            ? (c.timestamp as any).toDate().getTime()
            : typeof c.timestamp === 'number'
            ? c.timestamp
            : Date.now();
        return {
          ...c,
          time: getRelativeTime(ts),
          timestamp: ts,
          liked: Array.isArray((c as any).likedBy)
            ? (c as any).likedBy.includes(state.uid || '')
            : false,
          replies: (c.replies || []).map(r => {
            const rts =
              r.timestamp && typeof (r.timestamp as any).toDate === 'function'
                ? (r.timestamp as any).toDate().getTime()
                : typeof r.timestamp === 'number'
                ? r.timestamp
                : Date.now();
            return {
              ...r,
              time: getRelativeTime(rts),
              timestamp: rts,
              liked: Array.isArray((r as any).likedBy)
                ? (r as any).likedBy.includes(state.uid || '')
                : false,
            };
          }),
        };
      });
      dispatch({type: 'SET_COMMENTS', postId, comments: enrichedComments});
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [postId, state.uid, dispatch]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (!post) {
    return (
      <SafeAreaView style={s.container}>
        <Header
          title=""
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={s.loadingContainer}>
          <Text style={{color: theme.colors.textSecondary, ...theme.typography.bodySmall}}>게시글을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleComment = async () => {
    if (!comment.trim() || submitting) return;
    if (!state.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    setSubmitting(true);
    try {
      if (replyTo) {
        await postService.addReply(postId, replyTo.commentId, {
          user: state.user.nickname,
          userId: state.uid,
          avatar: state.user.avatar,
          text: comment.trim(),
        });
        setReplyTo(null);
      } else {
        await postService.addComment(postId, {
          user: state.user.nickname,
          userId: state.uid,
          avatar: state.user.avatar,
          text: comment.trim(),
        });
      }
      setComment('');
      await fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async () => {
    if (!state.uid) return;
    dispatch({type: 'TOGGLE_LIKE', postId: post.id});
    try {
      await postService.toggleLike(post.id, state.uid);
    } catch (error) {
      dispatch({type: 'TOGGLE_LIKE', postId: post.id});
      console.error('Failed to toggle like:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!state.uid) return;
    dispatch({type: 'TOGGLE_SAVE', postId: post.id});
    try {
      await postService.toggleSave(post.id, state.uid);
    } catch (error) {
      dispatch({type: 'TOGGLE_SAVE', postId: post.id});
      console.error('Failed to toggle save:', error);
    }
  };

  const isMyPost = post.user === state.user.nickname || (post as any).userId === state.uid;

  const handleEdit = () => {
    navigation.navigate('WritePost', {
      editMode: true,
      postId: post.id,
      initialTitle: post.title,
      initialContent: post.text,
      initialCategory: post.category,
    });
  };

  const handleDelete = () => {
    Alert.alert('게시글 삭제', '정말 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await postService.deletePost(post.id);
            dispatch({type: 'DELETE_POST', postId: post.id});
            navigation.goBack();
          } catch (error) {
            console.error('Failed to delete post:', error);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const REPORT_REASONS = [
    '욕설/비방',
    '음란물',
    '광고/스팸',
    '개인정보 노출',
    '기타',
  ];

  const handleReport = () => {
    Alert.alert('신고 사유 선택', '', [
      ...REPORT_REASONS.map(reason => ({
        text: reason,
        onPress: () => {
          Alert.alert('신고 완료', '신고가 접수되었습니다. 검토 후 조치하겠습니다.');
        },
      })),
      {text: '취소', style: 'cancel' as const},
    ]);
  };

  const handleBlockUser = () => {
    Alert.alert(
      '사용자 차단',
      `${post.user}님을 차단하시겠습니까?\n차단된 사용자의 글은 더 이상 보이지 않습니다.`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '차단',
          style: 'destructive',
          onPress: () => {
            dispatch({type: 'BLOCK_USER', userId: post.user});
            Alert.alert('차단 완료', `${post.user}님을 차단했습니다.`);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleMore = () => {
    if (isMyPost) {
      Alert.alert('게시글 옵션', '', [
        {text: '수정하기', onPress: handleEdit},
        {text: '삭제하기', style: 'destructive', onPress: handleDelete},
        {text: '취소', style: 'cancel'},
      ]);
    } else {
      Alert.alert('게시글 옵션', '', [
        {text: '신고하기', style: 'destructive', onPress: handleReport},
        {text: '이 사용자 차단', onPress: handleBlockUser},
        {text: '공유하기', onPress: handleShare},
        {text: '취소', style: 'cancel'},
      ]);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Header
        title={post.category}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="⋯"
        onRightPress={handleMore}
      />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={post.comments}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <View style={s.postSection}>
              <View style={s.postHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{post.avatar}</Text>
                </View>
                <View style={s.postHeaderInfo}>
                  <Text style={s.postUser}>{post.user}</Text>
                  <Text style={s.postTime}>{post.time}</Text>
                </View>
                {post.isAnonymous && (
                  <View style={s.anonBadge}>
                    <Text style={s.anonBadgeText}>익명</Text>
                  </View>
                )}
                {!post.isAnonymous &&
                  state.uid &&
                  (post as any).userId &&
                  (post as any).userId !== state.uid && (
                    <TouchableOpacity
                      style={[
                        s.followBtn,
                        isFollowingAuthor && s.followBtnActive,
                      ]}
                      onPress={handleToggleFollow}
                      disabled={followLoading}>
                      {followLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      ) : (
                        <Text
                          style={[
                            s.followBtnText,
                            isFollowingAuthor && s.followBtnTextActive,
                          ]}>
                          {isFollowingAuthor ? '팔로잉' : '팔로우'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
              </View>

              {post.title ? (
                <Text style={s.postTitle}>{post.title}</Text>
              ) : null}
              <Text style={s.postText}>{post.text}</Text>

              <View style={s.postActions}>
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={handleToggleLike}>
                  <Text
                    style={[
                      s.actionText,
                      post.liked && s.actionActive,
                    ]}>
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
                  onPress={handleToggleSave}>
                  <Text
                    style={[
                      s.actionText,
                      post.saved && s.actionActive,
                    ]}>
                    {post.saved ? '★ 저장됨' : '☆ 저장'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={handleShare}>
                  <Text style={s.actionText}>{'↗ 공유'}</Text>
                </TouchableOpacity>
              </View>

              <View style={s.commentsHeader}>
                <Text style={s.commentsTitle}>
                  댓글 {post.comments.length}
                </Text>
                {loadingComments && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{marginLeft: 8}}
                  />
                )}
              </View>
            </View>
          )}
          renderItem={({item}) => (
            <View>
              <View style={s.commentItem}>
                <View style={s.commentAvatar}>
                  <Text style={s.commentAvatarText}>{item.avatar}</Text>
                </View>
                <View style={s.commentContent}>
                  <View style={s.commentHeader}>
                    <Text style={s.commentUser}>{item.user}</Text>
                    <Text style={s.commentTime}>{item.time}</Text>
                  </View>
                  <Text style={s.commentText}>{item.text}</Text>
                  <View style={s.commentActions}>
                    <TouchableOpacity
                      onPress={() =>
                        dispatch({
                          type: 'TOGGLE_COMMENT_LIKE',
                          postId,
                          commentId: item.id,
                        })
                      }>
                      <Text
                        style={[
                          s.commentAction,
                          item.liked && s.commentActionActive,
                        ]}>
                        {item.liked ? '♥' : '♡'} {item.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setReplyTo({commentId: item.id, userName: item.user})
                      }>
                      <Text style={s.commentAction}>답글</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {/* Replies */}
              {item.replies.map(reply => (
                <View key={reply.id} style={s.replyItem}>
                  <View style={s.replyAvatar}>
                    <Text style={s.replyAvatarText}>{reply.avatar}</Text>
                  </View>
                  <View style={s.commentContent}>
                    <View style={s.commentHeader}>
                      <Text style={s.commentUser}>{reply.user}</Text>
                      <Text style={s.commentTime}>{reply.time}</Text>
                    </View>
                    <Text style={s.commentText}>{reply.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          ListEmptyComponent={
            loadingComments ? null : (
              <View style={s.emptyComments}>
                <Text style={s.emptyText}>
                  아직 댓글이 없습니다. 첫 댓글을 달아보세요!
                </Text>
              </View>
            )
          }
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Reply indicator */}
        {replyTo && (
          <View style={s.replyIndicator}>
            <Text style={s.replyIndicatorText}>
              {replyTo.userName}님에게 답글 작성 중
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={s.replyCancel}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comment Input */}
        <View style={s.commentInput}>
          <TextInput
            style={s.input}
            placeholder={
              replyTo
                ? `${replyTo.userName}님에게 답글...`
                : '댓글을 입력하세요...'
            }
            placeholderTextColor={theme.colors.textTertiary}
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={handleComment}
            returnKeyType="send"
            editable={!submitting}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!comment.trim() || submitting) && s.sendBtnDisabled]}
            onPress={handleComment}
            disabled={!comment.trim() || submitting}>
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.sendText}>등록</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    flex: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingBottom: theme.spacing.sm,
    },
    postSection: {
      padding: theme.spacing.base,
      borderBottomWidth: 8,
      borderBottomColor: theme.colors.background,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      fontSize: 20,
    },
    postHeaderInfo: {
      flex: 1,
    },
    postUser: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    postTime: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    anonBadge: {
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.radius.sm,
    },
    anonBadgeText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    followBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 5,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
    },
    followBtnActive: {
      backgroundColor: theme.colors.surfaceElevated,
    },
    followBtnText: {
      ...theme.typography.captionSmall,
      fontWeight: '700',
      color: '#fff',
    },
    followBtnTextActive: {
      color: theme.colors.textSecondary,
    },
    postTitle: {
      ...theme.typography.h2,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    postText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.base,
    },
    postActions: {
      flexDirection: 'row',
      gap: theme.spacing.xl,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionBtn: {},
    actionText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    actionActive: {
      color: theme.colors.error,
    },
    commentsHeader: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    commentsTitle: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    commentItem: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    commentAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    commentAvatarText: {
      fontSize: 15,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    commentUser: {
      ...theme.typography.caption,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    commentTime: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
    },
    commentText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    commentActions: {
      flexDirection: 'row',
      gap: theme.spacing.base,
      marginTop: theme.spacing.sm,
    },
    commentAction: {
      ...theme.typography.captionSmall,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    commentActionActive: {
      color: theme.colors.error,
    },
    replyItem: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      paddingLeft: 60,
      backgroundColor: theme.colors.surfaceElevated,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    replyAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    replyAvatarText: {
      fontSize: 12,
    },
    emptyComments: {
      padding: theme.spacing['2xl'],
      alignItems: 'center',
    },
    emptyText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
    },
    replyIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    replyIndicatorText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    replyCancel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
    },
    commentInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      height: 42,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.base,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    sendBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
    },
    sendBtnDisabled: {
      backgroundColor: theme.colors.textTertiary,
    },
    sendText: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      color: '#fff',
    },
  });
