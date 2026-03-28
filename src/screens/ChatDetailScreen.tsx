import React, {useState, useRef, useEffect} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {
  subscribeToMessages,
  sendMessage,
  markChatRead,
} from '../services/chatService';
import {ChatMessage, getRelativeTime} from '../data/mockData';
import type {ChatDetailScreenProps} from '../navigation/types';

export default function ChatDetailScreen({route, navigation}: ChatDetailScreenProps) {
  const {chatRoomId} = route.params;
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chatRoom = state.chatRooms.find(cr => cr.id === chatRoomId);

  // Subscribe to realtime messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatRoomId, msgs => {
      const enrichedMsgs: ChatMessage[] = msgs.map(m => {
        const ts =
          m.timestamp && typeof m.timestamp.toDate === 'function'
            ? m.timestamp.toDate().getTime()
            : typeof m.timestamp === 'number'
            ? m.timestamp
            : Date.now();
        return {
          ...m,
          time: getRelativeTime(ts),
          timestamp: ts,
          sender: m.senderId === state.uid ? 'me' : 'other',
        } as ChatMessage;
      });
      setMessages(enrichedMsgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatRoomId, state.uid]);

  // Mark chat as read
  useEffect(() => {
    if (state.uid && chatRoom && chatRoom.unread > 0) {
      markChatRead(chatRoomId, state.uid).catch(err =>
        console.error('Failed to mark chat read:', err),
      );
      dispatch({type: 'MARK_CHAT_READ', chatRoomId});
    }
  }, [chatRoomId, chatRoom, state.uid, dispatch]);

  const chatUser = chatRoom?.user || '채팅';
  const chatAvatar = chatRoom?.avatar || '🧔';

  const handleSend = async () => {
    if (!text.trim() || sending || !state.uid) return;

    setSending(true);
    try {
      await sendMessage(chatRoomId, {
        sender: state.user.nickname,
        senderId: state.uid,
        text: text.trim(),
      });
      setText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header
          title={chatUser}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header
        title={chatUser}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View
              style={[
                s.msgRow,
                item.sender === 'me' ? s.msgRowMe : s.msgRowOther,
              ]}>
              {item.sender === 'other' && (
                <View style={s.otherAvatar}>
                  <Text style={s.otherAvatarText}>{chatAvatar}</Text>
                </View>
              )}
              <View
                style={[
                  s.bubble,
                  item.sender === 'me' ? s.bubbleMe : s.bubbleOther,
                ]}>
                <Text
                  style={[
                    s.bubbleText,
                    item.sender === 'me'
                      ? s.bubbleTextMe
                      : s.bubbleTextOther,
                  ]}>
                  {item.text}
                </Text>
              </View>
              <Text style={s.msgTime}>{item.time}</Text>
            </View>
          )}
          contentContainerStyle={s.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: false})
          }
        />

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={theme.colors.textTertiary}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!sending}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}>
            {sending ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={s.sendText}>전송</Text>
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
      backgroundColor: theme.colors.background,
    },
    flex: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    msgList: {
      padding: theme.spacing.base,
      paddingBottom: theme.spacing.sm,
    },
    msgRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    msgRowMe: {
      justifyContent: 'flex-end',
    },
    msgRowOther: {
      justifyContent: 'flex-start',
    },
    otherAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otherAvatarText: {
      fontSize: 16,
    },
    bubble: {
      maxWidth: '70%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.lg,
    },
    bubbleMe: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: theme.spacing.xs,
    },
    bubbleOther: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: theme.spacing.xs,
    },
    bubbleText: {
      ...theme.typography.bodySmall,
    },
    bubbleTextMe: {
      color: theme.colors.onPrimary,
    },
    bubbleTextOther: {
      color: theme.colors.textPrimary,
    },
    msgTime: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
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
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
    },
    sendBtnDisabled: {
      backgroundColor: theme.colors.textTertiary,
    },
    sendText: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
  });
