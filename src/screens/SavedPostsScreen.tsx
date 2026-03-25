import React from 'react';
import {FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

export default function SavedPostsScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const savedPosts = state.posts.filter(p => p.saved);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="저장한 글" showBack onBack={() => navigation.goBack()} />
      {savedPosts.length === 0 ? (
        <EmptyState icon="★" title="저장한 글이 없습니다" subtitle="마음에 드는 글을 저장해보세요!" />
      ) : (
        <FlatList
          data={savedPosts}
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
