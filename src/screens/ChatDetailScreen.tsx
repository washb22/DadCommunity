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
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';

export default function ChatDetailScreen({route, navigation}: any) {
  const {chatRoomId} = route.params;
  const {state, dispatch} = useApp();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const chatRoom = state.chatRooms.find(cr => cr.id === chatRoomId);

  useEffect(() => {
    if (chatRoom && chatRoom.unread > 0) {
      dispatch({type: 'MARK_CHAT_READ', chatRoomId});
    }
  }, [chatRoomId, chatRoom, dispatch]);

  if (!chatRoom) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    dispatch({type: 'SEND_MESSAGE', chatRoomId, text: text.trim()});
    setText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={chatRoom.user}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={chatRoom.messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View
              style={[
                styles.msgRow,
                item.sender === 'me' ? styles.msgRowMe : styles.msgRowOther,
              ]}>
              {item.sender === 'other' && (
                <View style={styles.otherAvatar}>
                  <Text style={styles.otherAvatarText}>{chatRoom.avatar}</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  item.sender === 'me' ? styles.bubbleMe : styles.bubbleOther,
                ]}>
                <Text
                  style={[
                    styles.bubbleText,
                    item.sender === 'me'
                      ? styles.bubbleTextMe
                      : styles.bubbleTextOther,
                  ]}>
                  {item.text}
                </Text>
              </View>
              <Text style={styles.msgTime}>{item.time}</Text>
            </View>
          )}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: false})
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#bbb"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}>
            <Text style={styles.sendText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  flex: {
    flex: 1,
  },
  msgList: {
    padding: 16,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 6,
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
    backgroundColor: '#E8EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherAvatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: '#2D5BFF',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: '#fff',
  },
  bubbleTextOther: {
    color: '#333',
  },
  msgTime: {
    fontSize: 10,
    color: '#bbb',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
