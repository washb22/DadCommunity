import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {BOARDS} from '../data/mockData';
import type {BoardListScreenProps} from '../navigation/types';

export default function BoardListScreen({navigation}: BoardListScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  const boardColors = theme.colors.boardColors;

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="게시판"
        rightIcon="search-outline"
        onRightPress={() => navigation.navigate('Search')}
      />
      <ScrollView
        contentContainerStyle={s.cardList}
        showsVerticalScrollIndicator={false}>
        {BOARDS.filter(b => b.visible).map((board, index) => {
          const postCount = state.posts.filter(
            p => p.category === board.category,
          ).length;
          const cardColor = boardColors[index % boardColors.length];

          return (
            <TouchableOpacity
              key={board.id}
              style={[s.card, {backgroundColor: cardColor}]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('BoardDetail', {
                  boardName: board.name,
                  category: board.category,
                })
              }>
              <View style={s.cardTop}>
                <View style={s.cardIconWrap}>
                  <Icon
                    name={board.ionicon}
                    size={28}
                    color={theme.colors.onPrimary}
                  />
                </View>
                {board.hasNew && (
                  <View style={s.newBadge}>
                    <Text style={s.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <View style={s.cardBottom}>
                <Text style={s.cardName}>{board.name}</Text>
                <Text style={s.cardDesc}>{board.desc}</Text>
                <View style={s.cardFooter}>
                  <Text style={s.cardCount}>게시글 {postCount}개</Text>
                  <Icon
                    name="chevron-forward"
                    size={18}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    cardList: {
      padding: theme.spacing.base,
      gap: theme.spacing.base,
      paddingBottom: theme.spacing['2xl'],
    },
    card: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      minHeight: 150,
      justifyContent: 'space-between',
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    newBadge: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
    },
    newBadgeText: {
      ...theme.typography.overline,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    cardBottom: {
      marginTop: theme.spacing.md,
    },
    cardName: {
      ...theme.typography.h2,
      fontWeight: '800',
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.xs,
    },
    cardDesc: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: theme.spacing.md,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardCount: {
      ...theme.typography.caption,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '600',
    },
  });
