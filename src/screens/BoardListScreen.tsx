import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {BOARDS} from '../data/mockData';

function BoardItem({board, postCount, onPress, theme}: {board: any; postCount: number; onPress: () => void; theme: any}) {
  const s = makeStyles(theme);
  return (
    <TouchableOpacity style={s.boardItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.boardIcon, {backgroundColor: board.iconBg}]}>
        <Text style={s.boardEmoji}>{board.icon}</Text>
      </View>
      <View style={s.boardInfo}>
        <Text style={s.boardName}>{board.name}</Text>
        <Text style={s.boardDesc}>{board.desc}</Text>
      </View>
      <View style={s.boardRight}>
        {board.hasNew && <View style={s.newDot} />}
        <Text style={s.postCount}>{postCount}개</Text>
        <Text style={s.arrow}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BoardListScreen({navigation}: any) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="게시판"
        rightIcon="🔍"
        onRightPress={() => navigation.navigate('Search')}
      />
      <FlatList
        data={BOARDS}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          const postCount = state.posts.filter(
            p => item.category === '공지' ? false : p.category === item.category,
          ).length;
          return (
            <BoardItem
              board={item}
              postCount={postCount}
              theme={theme}
              onPress={() => {
                if (item.category === '공지') return;
                navigation.navigate('BoardDetail', {
                  boardName: item.name,
                  category: item.category,
                });
              }}
            />
          );
        }}
        contentContainerStyle={s.listContent}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    listContent: {
      paddingTop: theme.spacing.xs,
    },
    boardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    boardIcon: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    boardEmoji: {
      fontSize: 22,
    },
    boardInfo: {
      flex: 1,
    },
    boardName: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    boardDesc: {
      ...theme.typography.captionSmall,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    boardRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    newDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.error,
    },
    postCount: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
    },
    arrow: {
      fontSize: 16,
      color: theme.colors.textTertiary,
      fontWeight: '300',
    },
  });
