import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {BOARDS} from '../data/mockData';
import type {BoardListScreenProps} from '../navigation/types';

const {width} = Dimensions.get('window');

const BOARD_ICON_MAP: Record<string, string> = {
  '💑': 'heart',
  '📝': 'chatbubbles',
  '👶': 'people',
};

const CARD_COLORS = ['#3D5A80', '#4A7C59', '#C97B3D'];

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
      <View style={s.cardList}>
        {BOARDS.map((board, index) => {
          const postCount = state.posts.filter(
            p => p.category === board.category,
          ).length;
          const cardColor = CARD_COLORS[index % CARD_COLORS.length];

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
                    name={BOARD_ICON_MAP[board.icon] || 'ellipse-outline'}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                {board.hasNew && <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>}
              </View>
              <View style={s.cardBottom}>
                <Text style={s.cardName}>{board.name}</Text>
                <Text style={s.cardDesc}>{board.desc}</Text>
                <View style={s.cardFooter}>
                  <Text style={s.cardCount}>게시글 {postCount}개</Text>
                  <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    },
    card: {
      width: width - theme.spacing.base * 2,
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
      backgroundColor: '#FF6B6B',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    newBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    cardBottom: {
      marginTop: theme.spacing.md,
    },
    cardName: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: theme.spacing.md,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardCount: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '600',
    },
  });
