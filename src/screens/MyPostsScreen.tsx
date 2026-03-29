import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import * as postService from '../services/postService';
import type {MyPostsScreenProps} from '../navigation/types';
import type {Post} from '../data/mockData';

export default function MyPostsScreen({navigation}: MyPostsScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyPosts = useCallback(async () => {
    if (!state.uid) return;
    try {
      const snapshot = await firestore()
        .collection('posts')
        .where('userId', '==', state.uid)
        .orderBy('timestamp', 'desc')
        .get();

      const rawPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postService.enrichPostsWithUserData(rawPosts, state.uid));
    } catch (error) {
      console.error('Failed to fetch my posts:', error);
    }
  }, [state.uid]);

  useEffect(() => {
    loadMyPosts().finally(() => setLoading(false));
  }, [loadMyPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyPosts();
    setRefreshing(false);
  }, [loadMyPosts]);

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
        prev.map(p => (p.id === postId ? {...p, saved: !p.saved} : p)),
      );
      try {
        await postService.toggleSave(postId, state.uid);
      } catch (error) {
        setPosts(prev =>
          prev.map(p => (p.id === postId ? {...p, saved: !p.saved} : p)),
        );
        console.error('Failed to toggle save:', error);
      }
    },
    [state.uid],
  );

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title="내가 쓴 글" showBack onBack={() => navigation.goBack()} />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header title="내가 쓴 글" showBack onBack={() => navigation.goBack()} />
      {posts.length === 0 ? (
        <EmptyState icon="create-outline" title="작성한 글이 없습니다" subtitle="첫 글을 작성해보세요!" />
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
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background},
    loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    list: {paddingVertical: theme.spacing.sm},
  });
