import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import * as postService from '../services/postService';
import type {SearchScreenProps} from '../navigation/types';
import type {Post} from '../data/mockData';

const FALLBACK_KEYWORDS = ['육아', '캠핑', '부부', '운동', '요리', '재테크'];

export default function SearchScreen({navigation}: SearchScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);
  const [popularKeywords, setPopularKeywords] = useState<string[]>(FALLBACK_KEYWORDS);

  // Load popular keywords from Firestore
  useEffect(() => {
    firestore()
      .collection('searchLogs')
      .orderBy('count', 'desc')
      .limit(8)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          const keywords = snapshot.docs.map(doc => doc.data().keyword as string);
          setPopularKeywords(keywords);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q) return;

      setSearched(true);
      setSearching(true);

      try {
        // Log search keyword
        firestore()
          .collection('searchLogs')
          .doc(q)
          .set(
            {
              keyword: q,
              count: firestore.FieldValue.increment(1),
              lastSearched: firestore.FieldValue.serverTimestamp(),
            },
            {merge: true},
          )
          .catch(() => {});

        // Fetch recent posts from Firestore and filter client-side
        // Firestore doesn't support full-text search, so we fetch a broader set
        const snapshot = await firestore()
          .collection('posts')
          .orderBy('timestamp', 'desc')
          .limit(500)
          .get();

        const allPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lowerQ = q.toLowerCase();
        const filtered = allPosts.filter(
          (p: Partial<Post>) =>
            (p.title && p.title.toLowerCase().includes(lowerQ)) ||
            (p.text && p.text.toLowerCase().includes(lowerQ)) ||
            (p.category && p.category.toLowerCase().includes(lowerQ)),
        );

        setResults(
          postService.enrichPostsWithUserData(filtered, state.uid),
        );
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    },
    [query, state.uid],
  );

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!state.uid) return;
      setResults(prev =>
        prev.map(p =>
          p.id === postId
            ? {...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1}
            : p,
        ),
      );
      try {
        await postService.toggleLike(postId, state.uid, state.user?.nickname || undefined);
      } catch (error) {
        setResults(prev =>
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
      setResults(prev =>
        prev.map(p => (p.id === postId ? {...p, saved: !p.saved} : p)),
      );
      try {
        await postService.toggleSave(postId, state.uid);
      } catch (error) {
        setResults(prev =>
          prev.map(p => (p.id === postId ? {...p, saved: !p.saved} : p)),
        );
        console.error('Failed to toggle save:', error);
      }
    },
    [state.uid],
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Search Bar */}
      <View style={s.searchBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TextInput
          style={s.input}
          placeholder="검색어를 입력하세요"
          placeholderTextColor={theme.colors.textTertiary}
          value={query}
          onChangeText={text => {
            setQuery(text);
            if (!text.trim()) {
              setSearched(false);
              setResults([]);
            }
          }}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setSearched(false);
              setResults([]);
            }}>
            <Icon name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {!searched ? (
        <View style={s.suggestSection}>
          <Text style={s.suggestTitle}>인기 검색어</Text>
          <View style={s.keywords}>
            {popularKeywords.map(kw => (
              <TouchableOpacity
                key={kw}
                style={s.kwChip}
                onPress={() => {
                  setQuery(kw);
                  handleSearch(kw);
                }}>
                <Text style={s.kwText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : searching ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={`'${query}'에 대한 결과가 없습니다`}
          subtitle="다른 검색어로 시도해보세요"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <PostCard
              post={item}
              onPress={() =>
                navigation.navigate('PostDetail', {postId: item.id})
              }
              onLike={() => handleToggleLike(item.id)}
              onSave={() => handleToggleSave(item.id)}
            />
          )}
          contentContainerStyle={s.resultList}
          ListHeaderComponent={
            <Text style={s.resultCount}>
              검색 결과 {results.length}건
            </Text>
          }
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
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    input: {
      flex: 1,
      height: 40,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.base,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    clear: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestSection: {
      padding: theme.spacing.lg,
    },
    suggestTitle: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    keywords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    kwChip: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      ...theme.shadows.level1,
    },
    kwText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    resultList: {
      paddingVertical: theme.spacing.sm,
    },
    resultCount: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.sm,
    },
  });
