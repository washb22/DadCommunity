import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import {CATEGORIES, TABS} from '../data/mockData';

export default function HomeFeedScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const [activeTab, setActiveTab] = useState('최신');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [refreshing, setRefreshing] = useState(false);

  const [displayCount, setDisplayCount] = useState(10);

  const filteredPosts = state.posts.filter(p => {
    // Filter out blocked users
    if (state.blockedUsers.includes(p.user)) return false;
    if (activeCategory !== '전체' && p.category !== activeCategory) return false;
    return true;
  });

  const sortedPosts =
    activeTab === '인기'
      ? [...filteredPosts].sort((a, b) => {
          const now = Date.now();
          const scoreA = ((a.likes || 0) + (a.comments?.length || 0) * 2) / Math.pow(((now - (a.timestamp || now)) / 3600000) + 2, 1.5);
          const scoreB = ((b.likes || 0) + (b.comments?.length || 0) * 2) / Math.pow(((now - (b.timestamp || now)) / 3600000) + 2, 1.5);
          return scoreB - scoreA;
        })
      : filteredPosts;

  const displayedPosts = sortedPosts.slice(0, displayCount);
  const hasMore = displayCount < sortedPosts.length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setDisplayCount(10);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => prev + 10);
    }
  }, [hasMore]);

  const unreadNotifs = state.notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="아빠의 다락방"
        rightIcon2={unreadNotifs > 0 ? '🔔' : '🔔'}
        onRightPress2={() => navigation.navigate('Notifications')}
        rightIcon="🔍"
        onRightPress={() => navigation.navigate('Search')}
      />

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
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item}
          renderItem={({item: cat}) => (
            <TouchableOpacity
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
          )}
          contentContainerStyle={styles.catList}
        />
      </View>

      {/* Feed */}
      {sortedPosts.length === 0 ? (
        <EmptyState
          icon="📭"
          title="게시글이 없습니다"
          subtitle="첫 번째 글을 작성해보세요!"
        />
      ) : (
        <FlatList
          data={displayedPosts}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', {postId: item.id})}
              onLike={() => dispatch({type: 'TOGGLE_LIKE', postId: item.id})}
              onSave={() => dispatch({type: 'TOGGLE_SAVE', postId: item.id})}
            />
          )}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2D5BFF']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('WritePost')}
        activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2D5BFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BBB',
  },
  tabTextActive: {
    color: '#2D5BFF',
    fontWeight: '700',
  },
  categoryBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  catList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    marginRight: 0,
  },
  catChipActive: {
    backgroundColor: '#2D5BFF',
  },
  catText: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
  },
  catTextActive: {
    color: '#fff',
  },
  feedContent: {
    paddingVertical: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#2D5BFF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
