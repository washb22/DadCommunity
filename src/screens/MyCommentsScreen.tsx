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
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

export default function MyCommentsScreen({navigation}: any) {
  const {state} = useApp();

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
    <SafeAreaView style={styles.container}>
      <Header title="내가 쓴 댓글" showBack onBack={() => navigation.goBack()} />
      {myComments.length === 0 ? (
        <EmptyState icon="💬" title="작성한 댓글이 없습니다" subtitle="게시글에 댓글을 달아보세요!" />
      ) : (
        <FlatList
          data={myComments}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('PostDetail', {postId: item.postId})}
              activeOpacity={0.6}>
              <Text style={styles.postTitle} numberOfLines={1}>
                {item.postTitle}
              </Text>
              <Text style={styles.commentText} numberOfLines={2}>
                {item.commentText}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  postTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 6,
  },
});
