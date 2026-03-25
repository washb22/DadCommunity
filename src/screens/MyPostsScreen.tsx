import React from 'react';
import {FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

export default function MyPostsScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const myPosts = state.posts.filter(
    p => p.user === state.user.nickname && !p.isAnonymous,
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내가 쓴 글" showBack onBack={() => navigation.goBack()} />
      {myPosts.length === 0 ? (
        <EmptyState icon="📝" title="작성한 글이 없습니다" subtitle="첫 글을 작성해보세요!" />
      ) : (
        <FlatList
          data={myPosts}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', {postId: item.id})}
              onLike={() => dispatch({type: 'TOGGLE_LIKE', postId: item.id})}
              onSave={() => dispatch({type: 'TOGGLE_SAVE', postId: item.id})}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F6F8'},
  list: {paddingVertical: 10},
});
