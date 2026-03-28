import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import * as postService from '../services/postService';
import type {BoardDetailScreenProps} from '../navigation/types';
import type {Post} from '../data/mockData';
import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export default function BoardDetailScreen({route, navigation}: BoardDetailScreenProps) {
  const {boardName, category} = route.params;
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const enrichPosts = useCallback(
    (rawPosts: Partial<Post>[]) =>
      postService.enrichPostsWithUserData(rawPosts, state.uid),
    [state.uid],
  );

  const loadPosts = useCallback(
    async (reset = false) => {
      try {
        const result = await postService.fetchPosts(
          category,
          'latest',
          reset ? undefined : lastDoc,
          20,
        );
        const enriched = enrichPosts(result.posts);

        if (reset) {
          setPosts(enriched);
        } else {
          setPosts(prev => [...prev, ...enriched]);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to fetch board posts:', error);
      }
    },
    [category, lastDoc, enrichPosts],
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        const result = await postService.fetchPosts(category, 'latest', undefined, 20);
        setPosts(enrichPosts(result.posts));
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Failed to fetch board posts:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, enrichPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await postService.fetchPosts(category, 'latest', undefined, 20);
      setPosts(enrichPosts(result.posts));
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to refresh board posts:', error);
    } finally {
      setRefreshing(false);
    }
  }, [category, enrichPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await postService.fetchPosts(category, 'latest', lastDoc, 20);
      setPosts(prev => [...prev, ...enrichPosts(result.posts)]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more board posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, category, lastDoc, enrichPosts]);

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!state.uid) return;
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1}
            : p,
        ),
      );
      try {
        await postService.toggleLike(postId, state.uid);
      } catch (error) {
        // Revert on failure
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? {...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1}
              : p,
          ),
        );
        console.error('Failed to toggle like:', error);
      }
    },
    [state.uid],
  );

  const handleToggleSave = useCallback(
    async (postId: string) => {
      if (!state.uid) return;
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? {...p, saved: !p.saved} : p,
        ),
      );
      try {
        await postService.toggleSave(postId, state.uid);
      } catch (error) {
        // Revert on failure
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? {...p, saved: !p.saved} : p,
          ),
        );
        console.error('Failed to toggle save:', error);
      }
    },
    [state.uid],
  );

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title={boardName} showBack onBack={() => navigation.goBack()} />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header
        title={boardName}
        showBack
        onBack={() => navigation.goBack()}
      />
      {posts.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title="아직 게시글이 없습니다"
          subtitle="첫 번째 글을 작성해보세요!"
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', {postId: item.id})}
              onLike={() => handleToggleLike(item.id)}
              onSave={() => handleToggleSave(item.id)}
            />
          )}
          contentContainerStyle={s.listContent}
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
    listContent: {
      paddingVertical: theme.spacing.sm,
    },
    footerLoader: {
      paddingVertical: theme.spacing.base,
      alignItems: 'center',
    },
  });
