import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Post} from '../data/mockData';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onSave: () => void;
}

export default function PostCard({post, onPress, onLike, onSave}: PostCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.avatar}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.user}>{post.user}</Text>
          <Text style={styles.meta}>
            {post.time} · {post.category}
          </Text>
        </View>
        {post.isAnonymous && (
          <View style={styles.anonBadge}>
            <Text style={styles.anonText}>익명</Text>
          </View>
        )}
      </View>

      {post.title ? (
        <Text style={styles.title} numberOfLines={1}>
          {post.title}
        </Text>
      ) : null}
      <Text style={styles.text} numberOfLines={3}>
        {post.text}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onLike}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.actionText, post.liked && styles.actionActive]}>
            {post.liked ? '♥' : '♡'} {post.likes}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Text style={styles.actionText}>
            💬 {post.comments.length}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onSave}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={[styles.actionText, post.saved && styles.actionActive]}>
            {post.saved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  headerInfo: {
    flex: 1,
  },
  user: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  meta: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  anonBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  anonText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  actionActive: {
    color: '#FF4466',
  },
});
