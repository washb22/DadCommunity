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
} from 'react-native';

const DUMMY_COMMENTS = [
  {
    id: '1',
    user: '세아이아빠',
    avatar: '👨',
    text: '저도 같은 경험이 있어요. 가장 중요한 건 그냥 옆에서 들어주는 거예요. 해결책을 제시하려 하지 말고요.',
    time: '3분 전',
    likes: 5,
  },
  {
    id: '2',
    user: '익명의 아빠',
    avatar: '🧔',
    text: '집안일을 좀 더 분담해보시는 건 어떨까요? 저는 그렇게 하니까 아내 표정이 확 밝아지더라고요.',
    time: '10분 전',
    likes: 8,
  },
  {
    id: '3',
    user: '육아전문가아빠',
    avatar: '👴',
    text: '부부 상담도 좋은 방법입니다. 전문가의 도움을 받으면 서로의 마음을 더 잘 이해할 수 있어요.',
    time: '25분 전',
    likes: 3,
  },
];

export default function PostDetailScreen({route, navigation}: any) {
  const {post} = route.params;
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{post.category}</Text>
        <TouchableOpacity>
          <Text style={styles.moreBtn}>⋯</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={DUMMY_COMMENTS}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <View style={styles.postSection}>
              {/* Post Content */}
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.avatar}</Text>
                </View>
                <View>
                  <Text style={styles.postUser}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </View>
              <Text style={styles.postText}>{post.text}</Text>

              {/* Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setLiked(!liked)}>
                  <Text style={styles.actionText}>
                    {liked ? '❤️' : '🤍'} {post.likes + (liked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.actionText}>💬 {post.comments}</Text>
                <TouchableOpacity onPress={() => setSaved(!saved)}>
                  <Text style={styles.actionText}>
                    {saved ? '🔖' : '📑'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.actionText}>↗️</Text>
              </View>

              {/* Comments Header */}
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  댓글 {DUMMY_COMMENTS.length}
                </Text>
              </View>
            </View>
          )}
          renderItem={({item}) => (
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
                  <Text style={styles.commentAction}>❤️ {item.likes}</Text>
                  <Text style={styles.commentAction}>답글</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* Comment Input */}
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="댓글을 입력하세요..."
            placeholderTextColor="#ccc"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.sendBtn}>
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
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    fontSize: 15,
    color: '#2D5BFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  moreBtn: {
    fontSize: 20,
    color: '#999',
  },
  listContent: {
    paddingBottom: 16,
  },
  postSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  postUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 1,
  },
  postText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {},
  actionText: {
    fontSize: 14,
    color: '#666',
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
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
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
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2D5BFF',
    borderRadius: 20,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
