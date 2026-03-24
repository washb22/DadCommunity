import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const CATEGORIES = ['전체', '부부관계', '자유', '취미'];
const TABS = ['최신', '인기', '팔로잉'];

const DUMMY_POSTS = [
  {
    id: '1',
    user: '익명의 아빠',
    avatar: '🧔',
    time: '5분 전',
    category: '부부관계',
    text: '아내가 요즘 너무 힘들어하는데 어떻게 도와줘야 할지 모르겠어요. 비슷한 경험 있으신 분?',
    likes: 12,
    comments: 8,
    isAnonymous: true,
  },
  {
    id: '2',
    user: '두아이아빠',
    avatar: '👨',
    time: '23분 전',
    category: '자유',
    text: '오늘 아이 재롱잔치 다녀왔는데 눈물이 나더라고요 ㅎㅎ 다들 이런 경험 있으시죠?',
    likes: 34,
    comments: 15,
    isAnonymous: false,
  },
  {
    id: '3',
    user: '캠핑매니아',
    avatar: '🏕️',
    time: '1시간 전',
    category: '취미',
    text: '이번 주말 아이랑 캠핑 가려는데 추천 캠핑장 있으신가요? 경기도 근처면 좋겠습니다.',
    likes: 8,
    comments: 22,
    isAnonymous: false,
  },
  {
    id: '4',
    user: '익명의 아빠',
    avatar: '🧔',
    time: '2시간 전',
    category: '부부관계',
    text: '장인어른이 자꾸 육아에 간섭하시는데... 아내한테 말하기도 애매하고 어떻게 해야 할까요?',
    likes: 45,
    comments: 31,
    isAnonymous: true,
  },
  {
    id: '5',
    user: '신혼아빠',
    avatar: '👶',
    time: '3시간 전',
    category: '자유',
    text: '첫째가 태어난 지 한 달 됐는데 밤잠을 못 자니까 회사에서 너무 힘드네요. 다들 어떻게 버티셨어요?',
    likes: 67,
    comments: 42,
    isAnonymous: false,
  },
];

function PostCard({post, onPress}: {post: any; onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.avatar}</Text>
        </View>
        <View>
          <Text style={styles.postUser}>{post.user}</Text>
          <Text style={styles.postTime}>
            {post.time} · {post.category}
          </Text>
        </View>
      </View>
      <Text style={styles.postText} numberOfLines={3}>
        {post.text}
      </Text>
      <View style={styles.postActions}>
        <Text style={styles.actionText}>❤️ {post.likes}</Text>
        <Text style={styles.actionText}>💬 {post.comments}</Text>
        <Text style={styles.actionText}>🔖</Text>
        <Text style={styles.actionText}>↗️</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeFeedScreen({navigation}: any) {
  const [activeTab, setActiveTab] = useState('최신');
  const [activeCategory, setActiveCategory] = useState('전체');

  const filteredPosts =
    activeCategory === '전체'
      ? DUMMY_POSTS
      : DUMMY_POSTS.filter(p => p.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>아빠의 다락방</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.categoryBar}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catChip,
              activeCategory === cat && styles.catChipActive,
            ]}
            onPress={() => setActiveCategory(cat)}>
            <Text
              style={[
                styles.catText,
                activeCategory === cat && styles.catTextActive,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetail', {post: item})}
          />
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('WritePost')}>
        <Text style={styles.fabText}>✏️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2D5BFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#2D5BFF',
  },
  categoryBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  catChipActive: {
    backgroundColor: '#2D5BFF',
  },
  catText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  catTextActive: {
    color: '#fff',
  },
  feedContent: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  postUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  postTime: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 1,
  },
  postText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    fontSize: 13,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2D5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D5BFF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
  },
});
