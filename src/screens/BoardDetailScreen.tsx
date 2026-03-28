import React from 'react';
import {FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

export default function BoardDetailScreen({route, navigation}: any) {
  const {boardName, category} = route.params;
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  const posts = state.posts.filter(p => p.category === category);

  return (
    <SafeAreaView style={s.container}>
      <Header
        title={boardName}
        showBack
        onBack={() => navigation.goBack()}
      />
      {posts.length === 0 ? (
        <EmptyState
          icon="📭"
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
              onLike={() => dispatch({type: 'TOGGLE_LIKE', postId: item.id})}
              onSave={() => dispatch({type: 'TOGGLE_SAVE', postId: item.id})}
            />
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
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
    listContent: {
      paddingVertical: theme.spacing.sm,
    },
  });
