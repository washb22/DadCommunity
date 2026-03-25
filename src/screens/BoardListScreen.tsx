import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';
import {BOARDS} from '../data/mockData';

function BoardItem({board, postCount, onPress}: {board: any; postCount: number; onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.boardItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.boardIcon, {backgroundColor: board.iconBg}]}>
        <Text style={styles.boardEmoji}>{board.icon}</Text>
      </View>
      <View style={styles.boardInfo}>
        <Text style={styles.boardName}>{board.name}</Text>
        <Text style={styles.boardDesc}>{board.desc}</Text>
      </View>
      <View style={styles.boardRight}>
        {board.hasNew && <View style={styles.newDot} />}
        <Text style={styles.postCount}>{postCount}개</Text>
        <Text style={styles.arrow}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BoardListScreen({navigation}: any) {
  const {state} = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="게시판"
        rightIcon="🔍"
        onRightPress={() => navigation.navigate('Search')}
      />
      <FlatList
        data={BOARDS}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          const postCount = state.posts.filter(
            p => item.category === '공지' ? false : p.category === item.category,
          ).length;
          return (
            <BoardItem
              board={item}
              postCount={postCount}
              onPress={() => {
                if (item.category === '공지') return;
                navigation.navigate('BoardDetail', {
                  boardName: item.name,
                  category: item.category,
                });
              }}
            />
          );
        }}
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
  listContent: {
    paddingTop: 4,
  },
  boardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  boardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  boardEmoji: {
    fontSize: 22,
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
    marginTop: 3,
  },
  boardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  arrow: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '300',
  },
});
