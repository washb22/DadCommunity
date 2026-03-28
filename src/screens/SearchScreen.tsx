import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

const POPULAR_KEYWORDS = ['육아', '캠핑', '부부', '운동', '요리', '재테크'];

export default function SearchScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const results = searched
    ? state.posts.filter(
        p =>
          p.title.includes(query) ||
          p.text.includes(query) ||
          p.user.includes(query),
      )
    : [];

  const handleSearch = () => {
    const q = query.trim();
    if (q) {
      setSearched(true);
      firestore()
        .collection('searchLogs')
        .doc(q)
        .set(
          {keyword: q, count: firestore.FieldValue.increment(1), lastSearched: firestore.FieldValue.serverTimestamp()},
          {merge: true},
        )
        .catch(() => {});
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Search Bar */}
      <View style={s.searchBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={s.back}>{'<'}</Text>
        </TouchableOpacity>
        <TextInput
          style={s.input}
          placeholder="검색어를 입력하세요"
          placeholderTextColor={theme.colors.textTertiary}
          value={query}
          onChangeText={text => {
            setQuery(text);
            if (!text.trim()) setSearched(false);
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setSearched(false);
            }}>
            <Text style={s.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {!searched ? (
        <View style={s.suggestSection}>
          <Text style={s.suggestTitle}>인기 검색어</Text>
          <View style={s.keywords}>
            {POPULAR_KEYWORDS.map(kw => (
              <TouchableOpacity
                key={kw}
                style={s.kwChip}
                onPress={() => {
                  setQuery(kw);
                  setSearched(true);
                }}>
                <Text style={s.kwText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon="🔍"
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
              onLike={() => dispatch({type: 'TOGGLE_LIKE', postId: item.id})}
              onSave={() => dispatch({type: 'TOGGLE_SAVE', postId: item.id})}
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
    back: {
      fontSize: 22,
      color: theme.colors.textPrimary,
      fontWeight: '600',
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
      fontSize: 16,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
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
