import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import {getRelativeTime} from '../data/mockData';
import type {MyCommentsScreenProps} from '../navigation/types';

interface MyComment {
  id: string;
  postId: string;
  postTitle: string;
  commentText: string;
  time: string;
  timestamp: number;
}

export default function MyCommentsScreen({navigation}: MyCommentsScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyComments = useCallback(async () => {
    if (!state.uid) return;
    try {
      const snapshot = await firestore()
        .collectionGroup('comments')
        .where('userId', '==', state.uid)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      const results: MyComment[] = await Promise.all(
        snapshot.docs.map(async doc => {
          const data = doc.data();
          const ts =
            data.timestamp && typeof data.timestamp.toDate === 'function'
              ? data.timestamp.toDate().getTime()
              : typeof data.timestamp === 'number'
              ? data.timestamp
              : Date.now();

          // Get parent post info
          const postRef = doc.ref.parent.parent;
          let postTitle = '';
          if (postRef) {
            try {
              const postDoc = await postRef.get();
              const postData = postDoc.data();
              postTitle = postData?.title || (postData?.text?.substring(0, 30) ?? '');
            } catch {
              postTitle = '삭제된 게시글';
            }
          }

          return {
            id: doc.id,
            postId: postRef?.id || '',
            postTitle,
            commentText: data.text || '',
            time: getRelativeTime(ts),
            timestamp: ts,
          };
        }),
      );

      setComments(results);
    } catch (error) {
      console.error('Failed to fetch my comments:', error);
    }
  }, [state.uid]);

  useEffect(() => {
    loadMyComments().finally(() => setLoading(false));
  }, [loadMyComments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyComments();
    setRefreshing(false);
  }, [loadMyComments]);

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title="내가 쓴 댓글" showBack onBack={() => navigation.goBack()} />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header title="내가 쓴 댓글" showBack onBack={() => navigation.goBack()} />
      {comments.length === 0 ? (
        <EmptyState icon="chatbubble-outline" title="작성한 댓글이 없습니다" subtitle="게시글에 댓글을 달아보세요!" />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={s.item}
              onPress={() => {
                if (item.postId) {
                  navigation.navigate('PostDetail', {postId: item.postId});
                }
              }}
              activeOpacity={0.6}>
              <Text style={s.postTitle} numberOfLines={1}>
                {item.postTitle}
              </Text>
              <Text style={s.commentText} numberOfLines={2}>
                {item.commentText}
              </Text>
              <Text style={s.time}>{item.time}</Text>
            </TouchableOpacity>
          )}
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
    container: {flex: 1, backgroundColor: theme.colors.surface},
    loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    item: {
      padding: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    postTitle: {
      ...theme.typography.captionSmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    commentText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    time: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
    },
  });
