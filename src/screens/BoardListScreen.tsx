import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const BOARDS = [
  {
    id: '1',
    icon: '💑',
    iconBg: '#FFE0E0',
    name: '부부관계',
    desc: '아내와의 관계, 소통, 갈등 해결',
    hasNew: true,
    postCount: 128,
  },
  {
    id: '2',
    icon: '📝',
    iconBg: '#E0F0FF',
    name: '자유게시판',
    desc: '자유롭게 이야기 나눠요',
    hasNew: true,
    postCount: 342,
  },
  {
    id: '3',
    icon: '🎮',
    iconBg: '#E8FFE0',
    name: '취미게시판',
    desc: '운동, 게임, 캠핑, 낚시 등',
    hasNew: false,
    postCount: 89,
  },
  {
    id: '4',
    icon: '🔥',
    iconBg: '#FFF3E0',
    name: '인기글',
    desc: '좋아요 많은 인기 게시물',
    hasNew: false,
    postCount: 56,
  },
  {
    id: '5',
    icon: '📢',
    iconBg: '#F0E0FF',
    name: '공지사항',
    desc: '앱 업데이트 및 안내',
    hasNew: false,
    postCount: 12,
  },
];

function BoardItem({board}: {board: any}) {
  return (
    <TouchableOpacity style={styles.boardItem}>
      <View style={[styles.boardIcon, {backgroundColor: board.iconBg}]}>
        <Text style={styles.boardEmoji}>{board.icon}</Text>
      </View>
      <View style={styles.boardInfo}>
        <Text style={styles.boardName}>{board.name}</Text>
        <Text style={styles.boardDesc}>{board.desc}</Text>
      </View>
      <View style={styles.boardRight}>
        {board.hasNew && <View style={styles.newDot} />}
        <Text style={styles.postCount}>{board.postCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BoardListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>게시판</Text>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={BOARDS}
        keyExtractor={item => item.id}
        renderItem={({item}) => <BoardItem board={item} />}
        contentContainerStyle={styles.listContent}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerIcon: {
    fontSize: 20,
  },
  listContent: {
    paddingTop: 8,
  },
  boardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 14,
  },
  boardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardEmoji: {
    fontSize: 20,
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  boardDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  boardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  postCount: {
    fontSize: 12,
    color: '#aaa',
  },
});
