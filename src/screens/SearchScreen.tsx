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
import {useApp} from '../context/AppContext';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

const POPULAR_KEYWORDS = ['육아', '캠핑', '부부', '운동', '요리', '재테크'];

export default function SearchScreen({navigation}: any) {
  const {state, dispatch} = useApp();
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
    if (query.trim()) {
      setSearched(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요"
          placeholderTextColor="#bbb"
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
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {!searched ? (
        <View style={styles.suggestSection}>
          <Text style={styles.suggestTitle}>인기 검색어</Text>
          <View style={styles.keywords}>
            {POPULAR_KEYWORDS.map(kw => (
              <TouchableOpacity
                key={kw}
                style={styles.kwChip}
                onPress={() => {
                  setQuery(kw);
                  setSearched(true);
                }}>
                <Text style={styles.kwText}>{kw}</Text>
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
          contentContainerStyle={styles.resultList}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              검색 결과 {results.length}건
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  back: {
    fontSize: 22,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F6F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
  clear: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  suggestSection: {
    padding: 20,
  },
  suggestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kwChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
  },
  kwText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  resultList: {
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
