import firestore from '@react-native-firebase/firestore';
import {ChatRoom, ChatMessage} from '../data/mockData';

const chatRoomsRef = firestore().collection('chatRooms');

export async function fetchChatRooms(userId: string): Promise<ChatRoom[]> {
  const snapshot = await chatRoomsRef
    .where('members', 'array-contains', userId)
    .orderBy('lastMessageAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ChatRoom[];
}

export function subscribeToChatRooms(
  userId: string,
  callback: (rooms: ChatRoom[]) => void,
) {
  return chatRoomsRef
    .where('members', 'array-contains', userId)
    .orderBy('lastMessageAt', 'desc')
    .onSnapshot(snapshot => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatRoom[];
      callback(rooms);
    });
}

export function subscribeToMessages(
  chatRoomId: string,
  callback: (messages: ChatMessage[]) => void,
) {
  return chatRoomsRef
    .doc(chatRoomId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages);
    });
}

export async function sendMessage(
  chatRoomId: string,
  message: {
    sender: string;
    senderId: string;
    text: string;
  },
) {
  const batch = firestore().batch();

  const msgRef = chatRoomsRef.doc(chatRoomId).collection('messages').doc();
  batch.set(msgRef, {
    ...message,
    timestamp: firestore.FieldValue.serverTimestamp(),
  });

  // Update last message on chat room
  batch.update(chatRoomsRef.doc(chatRoomId), {
    lastMessage: message.text,
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
    lastSenderId: message.senderId,
  });

  await batch.commit();
}

export async function createChatRoom(
  currentUserId: string,
  otherUserId: string,
  otherUserName: string,
  otherUserAvatar: string,
) {
  // Check if room already exists
  const existing = await chatRoomsRef
    .where('members', 'array-contains', currentUserId)
    .get();

  for (const doc of existing.docs) {
    const data = doc.data();
    if (data.members.includes(otherUserId)) {
      return doc.id;
    }
  }

  // Create new room
  const newRoom = await chatRoomsRef.add({
    members: [currentUserId, otherUserId],
    memberInfo: {
      [currentUserId]: {},
      [otherUserId]: {name: otherUserName, avatar: otherUserAvatar},
    },
    lastMessage: '',
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return newRoom.id;
}

export async function markChatRead(chatRoomId: string, userId: string) {
  await chatRoomsRef.doc(chatRoomId).update({
    [`unreadCount.${userId}`]: 0,
  });
}
