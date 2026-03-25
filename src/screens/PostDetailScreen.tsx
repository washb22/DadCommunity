import React, {useState} from 'react';
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
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';

export default function PostDetailScreen({route, navigation}: any) {
  const {postId} = route.params;
  const {state, dispatch} = useApp();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<{commentId: string; userName: string} | null>(null);

  const post = state.posts.find(p => p.id === postId);
  if (!post) return null;

  const handleComment = () => {
    if (!comment.trim()) return;
    if (replyTo) {
      dispatch({
        type: 'ADD_REPLY',
        postId,
        commentId: replyTo.commentId,
        text: comment.trim(),
      });
      setReplyTo(null);
    } else {
      dispatch({type: 'ADD_COMMENT', postId, text: comment.trim()});
    }
    setComment('');
  };

  const isMyPost = post.user === state.user.nickname;

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
        onPress: () => {
          dispatch({type: 'DELETE_POST', postId: post.id});
          navigation.goBack();
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
        {text: '공유하기'},
        {text: '취소', style: 'cancel'},
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={post.category}
        showBack
        onBack={() => navigation.goBack()}
        backgroundColor="#fff"
        light
        rightIcon="⋯"
        onRightPress={handleMore}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={post.comments}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <View style={styles.postSection}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.avatar}</Text>
                </View>
                <View style={styles.postHeaderInfo}>
                  <Text style={styles.postUser}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                {post.isAnonymous && (
                  <View style={styles.anonBadge}>
                    <Text style={styles.anonBadgeText}>익명</Text>
                  </View>
                )}
              </View>

              {post.title ? (
                <Text style={styles.postTitle}>{post.title}</Text>
              ) : null}
              <Text style={styles.postText}>{post.text}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    dispatch({type: 'TOGGLE_LIKE', postId: post.id})
                  }>
                  <Text
                    style={[
                      styles.actionText,
                      post.liked && styles.actionActive,
                    ]}>
                    {post.liked ? '♥' : '♡'} {post.likes}
                  </Text>
                </TouchableOpacity>
                <View style={styles.actionBtn}>
                  <Text style={styles.actionText}>
                    💬 {post.comments.length}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    dispatch({type: 'TOGGLE_SAVE', postId: post.id})
                  }>
                  <Text
                    style={[
                      styles.actionText,
                      post.saved && styles.actionActive,
                    ]}>
                    {post.saved ? '★ 저장됨' : '☆ 저장'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  댓글 {post.comments.length}
                </Text>
              </View>
            </View>
          )}
          renderItem={({item}) => (
            <View>
              <View style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{item.avatar}</Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{item.user}</Text>
                    <Text style={styles.commentTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <View style={styles.commentActions}>
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
                          styles.commentAction,
                          item.liked && styles.commentActionActive,
                        ]}>
                        {item.liked ? '♥' : '♡'} {item.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setReplyTo({commentId: item.id, userName: item.user})
                      }>
                      <Text style={styles.commentAction}>답글</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {/* Replies */}
              {item.replies.map(reply => (
                <View key={reply.id} style={styles.replyItem}>
                  <View style={styles.replyAvatar}>
                    <Text style={styles.replyAvatarText}>{reply.avatar}</Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{reply.user}</Text>
                      <Text style={styles.commentTime}>{reply.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{reply.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <Text style={styles.emptyText}>
                아직 댓글이 없습니다. 첫 댓글을 달아보세요!
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Reply indicator */}
        {replyTo && (
          <View style={styles.replyIndicator}>
            <Text style={styles.replyIndicatorText}>
              {replyTo.userName}님에게 답글 작성 중
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={styles.replyCancel}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comment Input */}
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder={
              replyTo
                ? `${replyTo.userName}님에게 답글...`
                : '댓글을 입력하세요...'
            }
            placeholderTextColor="#bbb"
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={handleComment}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !comment.trim() && styles.sendBtnDisabled]}
            onPress={handleComment}
            disabled={!comment.trim()}>
            <Text style={styles.sendText}>등록</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  postSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#F5F6F8',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  anonBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  anonBadgeText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  postText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionBtn: {},
  actionText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  actionActive: {
    color: '#FF4466',
  },
  commentsHeader: {
    marginTop: 20,
    paddingTop: 12,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    gap: 8,
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  commentTime: {
    fontSize: 11,
    color: '#aaa',
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  commentAction: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  commentActionActive: {
    color: '#FF4466',
  },
  replyItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingLeft: 60,
    backgroundColor: '#FAFBFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8EAF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  replyAvatarText: {
    fontSize: 12,
  },
  emptyComments: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#bbb',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyIndicatorText: {
    fontSize: 13,
    color: '#2D5BFF',
    fontWeight: '600',
  },
  replyCancel: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#F5F6F8',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#2D5BFF',
    borderRadius: 21,
  },
  sendBtnDisabled: {
    backgroundColor: '#CCC',
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
