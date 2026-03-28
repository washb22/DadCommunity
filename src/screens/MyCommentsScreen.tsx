import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

export default function MyCommentsScreen({navigation}: any) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  const myComments: {postId: string; postTitle: string; commentText: string; time: string}[] = [];
  state.posts.forEach(post => {
    post.comments.forEach(comment => {
      if (comment.user === state.user.nickname) {
        myComments.push({
          postId: post.id,
          postTitle: post.title || post.text.substring(0, 30),
          commentText: comment.text,
          time: comment.time,
        });
      }
    });
  });

  return (
    <SafeAreaView style={s.container}>
      <Header title="내가 쓴 댓글" showBack onBack={() => navigation.goBack()} />
      {myComments.length === 0 ? (
        <EmptyState icon="💬" title="작성한 댓글이 없습니다" subtitle="게시글에 댓글을 달아보세요!" />
      ) : (
        <FlatList
          data={myComments}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({item}) => (
            <TouchableOpacity
              style={s.item}
              onPress={() => navigation.navigate('PostDetail', {postId: item.postId})}
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
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.surface},
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
      marginTop: 6,
    },
  });
