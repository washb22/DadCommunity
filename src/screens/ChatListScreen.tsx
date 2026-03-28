import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import {subscribeToChatRooms} from '../services/chatService';
import {getRelativeTime} from '../data/mockData';

export default function ChatListScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [loading, setLoading] = useState(true);

  // Subscribe to realtime chat rooms from Firebase
  useEffect(() => {
    if (!state.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToChatRooms(state.uid, rooms => {
      const enrichedRooms = rooms.map(room => {
        const roomData = room as any;
        const otherMemberInfo = roomData.memberInfo
          ? Object.entries(roomData.memberInfo).find(
              ([key]) => key !== state.uid,
            )
          : null;
        const otherInfo = otherMemberInfo
          ? (otherMemberInfo[1] as any)
          : null;

        return {
          ...room,
          user: otherInfo?.name || room.user || '알 수 없음',
          avatar: otherInfo?.avatar || room.avatar || '🧔',
          messages: room.messages || [],
          unread:
            roomData.unreadCount && roomData.unreadCount[state.uid!]
              ? roomData.unreadCount[state.uid!]
              : 0,
        };
      });

      dispatch({type: 'SET_CHATROOMS', chatRooms: enrichedRooms});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [state.uid, dispatch]);

  const chatRooms = state.chatRooms;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title="채팅" />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
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
            const roomData = item as any;
            const lastMessage = roomData.lastMessage || '';
            const lastMessageAt = roomData.lastMessageAt;
            const lastTime = lastMessageAt
              ? typeof lastMessageAt.toDate === 'function'
                ? getRelativeTime(lastMessageAt.toDate().getTime())
                : typeof lastMessageAt === 'number'
                ? getRelativeTime(lastMessageAt)
                : ''
              : '';

            return (
              <TouchableOpacity
                style={s.chatItem}
                onPress={() =>
                  navigation.navigate('ChatDetail', {chatRoomId: item.id})
                }
                activeOpacity={0.6}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.avatar}</Text>
                </View>
                <View style={s.chatInfo}>
                  <View style={s.chatTop}>
                    <Text style={s.chatUser}>{item.user}</Text>
                    <Text style={s.chatTime}>{lastTime}</Text>
                  </View>
                  <View style={s.chatBottom}>
                    <Text style={s.chatMessage} numberOfLines={1}>
                      {lastMessage}
                    </Text>
                    {item.unread > 0 && (
                      <View style={s.unreadBadge}>
                        <Text style={s.unreadText}>{item.unread}</Text>
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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
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
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    chatTime: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
    },
    chatBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chatMessage: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    unreadBadge: {
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      marginLeft: theme.spacing.sm,
    },
    unreadText: {
      ...theme.typography.overline,
      fontWeight: '700',
      color: '#fff',
    },
  });
