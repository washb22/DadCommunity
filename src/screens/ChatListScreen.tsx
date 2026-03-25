import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

export default function ChatListScreen({navigation}: any) {
  const {state} = useApp();
  const chatRooms = state.chatRooms;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="채팅" />

      {chatRooms.length === 0 ? (
        <EmptyState
          icon="💬"
          title="아직 채팅이 없습니다"
          subtitle="게시글에서 다른 아빠에게 메시지를 보내보세요"
        />
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={item => item.id}
          renderItem={({item}) => {
            const lastMsg =
              item.messages.length > 0
                ? item.messages[item.messages.length - 1]
                : null;
            return (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() =>
                  navigation.navigate('ChatDetail', {chatRoomId: item.id})
                }
                activeOpacity={0.6}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.avatar}</Text>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatTop}>
                    <Text style={styles.chatUser}>{item.user}</Text>
                    <Text style={styles.chatTime}>
                      {lastMsg ? lastMsg.time : ''}
                    </Text>
                  </View>
                  <View style={styles.chatBottom}>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                      {lastMsg ? lastMsg.text : ''}
                    </Text>
                    {item.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
  },
  chatInfo: {
    flex: 1,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
});
