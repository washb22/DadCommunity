import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import {CATEGORIES, TABS, Post} from '../data/mockData';
import * as postService from '../services/postService';
import * as followService from '../services/followService';
import type {HomeFeedScreenProps} from '../navigation/types';
import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export default function HomeFeedScreen({navigation}: HomeFeedScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [activeTab, setActiveTab] = useState('인기');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // Enrich raw Firestore posts with user-specific data (liked/saved/time)
  const enrichPosts = useCallback(
    (posts: Partial<Post>[]) =>
      postService.enrichPostsWithUserData(posts, state.uid),
    [state.uid],
  );

  const loadPosts = useCallback(
    async (reset = false) => {
      try {
        const sortBy = activeTab === '인기' ? 'popular' : 'latest';
        const category = activeCategory !== '전체' ? activeCategory : undefined;
        const result = await postService.fetchPosts(
          category,
          sortBy as 'latest' | 'popular',
          reset ? undefined : lastDoc,
          20,
        );

        const enrichedPosts = enrichPosts(result.posts);

        if (reset) {
          dispatch({type: 'SET_POSTS', posts: enrichedPosts});
        } else {
          dispatch({
            type: 'SET_POSTS',
            posts: [...state.posts, ...enrichedPosts],
          });
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    },
    [activeTab, activeCategory, lastDoc, state.uid, state.posts, dispatch, enrichPosts],
  );

  // Fetch following user IDs when "팔로잉" tab is active
  useEffect(() => {
    if (activeTab === '팔로잉' && state.uid) {
      followService.getFollowing(state.uid).then(setFollowingIds).catch(() => setFollowingIds([]));
    }
  }, [activeTab, state.uid]);

  // Load posts on mount and when tab/category changes
  useEffect(() => {
    setLoading(true);
    setLastDoc(null);
    setHasMore(true);
    const load = async () => {
      try {
        const sortBy = activeTab === '인기' ? 'popular' : 'latest';
        const category = activeCategory !== '전체' ? activeCategory : undefined;
        const result = await postService.fetchPosts(
          category,
          sortBy as 'latest' | 'popular',
          undefined,
          20,
        );

        dispatch({type: 'SET_POSTS', posts: enrichPosts(result.posts)});
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, activeCategory, dispatch, state.uid, enrichPosts]);

  const filteredPosts = state.posts.filter(p => {
    if (state.blockedUsers.includes(p.user)) return false;
    if (activeTab === '팔로잉') {
      const authorId = p.userId;
      if (!authorId || !followingIds.includes(authorId)) return false;
    }
    if (activeTab === '또래 아빠') {
      if (!state.user.childAgeGroup || !p.authorAgeGroup) return false;
      if (p.authorAgeGroup !== state.user.childAgeGroup) return false;
    }
    return true;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    try {
      const sortBy = activeTab === '인기' ? 'popular' : 'latest';
      const category = activeCategory !== '전체' ? activeCategory : undefined;
      const result = await postService.fetchPosts(
        category,
        sortBy as 'latest' | 'popular',
        undefined,
        20,
      );

      dispatch({type: 'SET_POSTS', posts: enrichPosts(result.posts)});
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, activeCategory, dispatch, enrichPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || activeTab === '인기') return;
    setLoadingMore(true);
    try {
      const category = activeCategory !== '전체' ? activeCategory : undefined;
      const result = await postService.fetchPosts(
        category,
        'latest',
        lastDoc,
        20,
      );

      dispatch({
        type: 'SET_POSTS',
        posts: [...state.posts, ...enrichPosts(result.posts)],
      });
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, activeTab, activeCategory, lastDoc, state.posts, dispatch, enrichPosts]);

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!state.uid) return;
      dispatch({type: 'TOGGLE_LIKE', postId});
      try {
        await postService.toggleLike(postId, state.uid);
      } catch (error) {
        dispatch({type: 'TOGGLE_LIKE', postId});
        console.error('Failed to toggle like:', error);
      }
    },
    [state.uid, dispatch],
  );

  const handleToggleSave = useCallback(
    async (postId: string) => {
      if (!state.uid) return;
      dispatch({type: 'TOGGLE_SAVE', postId});
      try {
        await postService.toggleSave(postId, state.uid);
      } catch (error) {
        dispatch({type: 'TOGGLE_SAVE', postId});
        console.error('Failed to toggle save:', error);
      }
    },
    [state.uid, dispatch],
  );

    const handleToggleEmpathy = useCallback(
    async (postId: string) => {
      if (!state.uid) return;
      dispatch({type: 'TOGGLE_EMPATHY', postId});
      try {
        await postService.toggleEmpathy(postId, state.uid);
      } catch (error) {
        dispatch({type: 'TOGGLE_EMPATHY', postId});
        console.error('Failed to toggle empathy:', error);
      }
    },
    [state.uid, dispatch],
  );

  const unreadNotifs = state.notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header
          title="아빠의 다락방"
          rightIcon2="notifications-outline"
          onRightPress2={() => navigation.navigate('Notifications')}
          rightIcon="search-outline"
          onRightPress={() => navigation.navigate('Search')}
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
        title="아빠의 다락방"
        rightIcon2="notifications-outline"
        onRightPress2={() => navigation.navigate('Notifications')}
        rightIcon="search-outline"
        onRightPress={() => navigation.navigate('Search')}
      />

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                s.tabText,
                activeTab === tab && s.tabTextActive,
              ]}>
              {tab === '또래 아빠' && (
                <Icon
                  name="people-outline"
                  size={14}
                  color={activeTab === tab ? theme.colors.primary : theme.colors.textTertiary}
                  style={{marginRight: theme.spacing.xs}}
                />
              )}
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <View style={s.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item}
          renderItem={({item: cat}) => (
            <TouchableOpacity
              style={[
                s.catChip,
                activeCategory === cat && s.catChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}>
              <Text
                style={[
                  s.catText,
                  activeCategory === cat && s.catTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={s.catList}
        />
      </View>

      {/* Feed */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          icon="mail-open-outline"
          title="게시글이 없습니다"
          subtitle="첫 번째 글을 작성해보세요!"
        />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', {postId: item.id})}
              onLike={() => handleToggleLike(item.id)}
              onSave={() => handleToggleSave(item.id)}
              onEmpathize={() => handleToggleEmpathy(item.id)}
            />
          )}
          contentContainerStyle={s.feedContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={s.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('WritePost')}
        activeOpacity={0.85}>
        <Icon name="add" size={24} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 2.5,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.bodySmall,
      fontWeight: '600',
      color: theme.colors.textTertiary,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    categoryBar: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    catList: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    catChip: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceElevated,
    },
    catChipActive: {
      backgroundColor: theme.colors.primary,
    },
    catText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    catTextActive: {
      color: theme.colors.onPrimary,
    },
    feedContent: {
      paddingVertical: theme.spacing.sm,
    },
    footerLoader: {
      paddingVertical: theme.spacing.base,
      alignItems: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 28,
      right: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.level4,
    },
  });
