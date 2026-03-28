import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {BOARDS, Board} from '../data/mockData';
import type {BoardListScreenProps} from '../navigation/types';

const BOARD_ICON_MAP: Record<string, string> = {
  '💑': 'heart-outline',
  '📝': 'chatbubbles-outline',
  '🎮': 'game-controller-outline',
  '👶': 'people-outline',
  '💼': 'briefcase-outline',
  '💰': 'trending-up-outline',
  '💪': 'fitness-outline',
  '🍳': 'restaurant-outline',
  '📢': 'megaphone-outline',
};

function BoardItem({board, postCount, onPress, theme}: {board: Board; postCount: number; onPress: () => void; theme: Theme}) {
  const s = makeStyles(theme);
  return (
    <TouchableOpacity style={s.boardItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.boardIcon, {backgroundColor: board.iconBg}]}>
        <Icon name={BOARD_ICON_MAP[board.icon] || 'ellipse-outline'} size={22} color={theme.colors.onPrimary} />
      </View>
      <View style={s.boardInfo}>
        <Text style={s.boardName}>{board.name}</Text>
        <Text style={s.boardDesc}>{board.desc}</Text>
      </View>
      <View style={s.boardRight}>
        {board.hasNew && <View style={s.newDot} />}
        <Text style={s.postCount}>{postCount}개</Text>
        <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function BoardListScreen({navigation}: BoardListScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="게시판"
        rightIcon="search-outline"
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
      marginTop: theme.spacing.xs,
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
