import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const DUMMY_CHATS = [
  {
    id: '1',
    user: '세아이아빠',
    avatar: '👨',
    lastMessage: '네 맞아요, 저도 그때 많이 힘들었어요',
    time: '방금',
    unread: 2,
  },
  {
    id: '2',
    user: '캠핑매니아',
    avatar: '🏕️',
    lastMessage: '가평 쪽에 좋은 캠핑장 있어요!',
    time: '10분 전',
    unread: 0,
  },
  {
    id: '3',
    user: '육아전문가아빠',
    avatar: '👴',
    lastMessage: '그 책 정말 추천합니다 👍',
    time: '1시간 전',
    unread: 0,
  },
];

export default function ChatListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>

      {DUMMY_CHATS.length > 0 ? (
        <FlatList
          data={DUMMY_CHATS}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.chatItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.avatar}</Text>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatUser}>{item.user}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatBottom}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>아직 채팅이 없습니다</Text>
          <Text style={styles.emptySubtext}>
            게시글에서 다른 아빠에게 메시지를 보내보세요
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    backgroundColor: '#2D5BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  chatInfo: {
    flex: 1,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#aaa',
  },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 6,
  },
});
