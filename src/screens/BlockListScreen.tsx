import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

export default function BlockListScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  const handleUnblock = (userId: string) => {
    Alert.alert('차단 해제', `${userId}님의 차단을 해제하시겠습니까?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '해제',
        onPress: () => dispatch({type: 'UNBLOCK_USER', userId}),
      },
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="차단 관리"
        showBack
        onBack={() => navigation.goBack()}
      />

      {state.blockedUsers.length === 0 ? (
        <EmptyState
          icon="🚫"
          title="차단한 사용자가 없습니다"
          subtitle="차단한 사용자는 여기에 표시됩니다"
        />
      ) : (
        <FlatList
          data={state.blockedUsers}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <View style={s.item}>
              <View style={s.userInfo}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>🧔</Text>
                </View>
                <Text style={s.userName}>{item}</Text>
              </View>
              <TouchableOpacity
                style={s.unblockBtn}
                onPress={() => handleUnblock(item)}>
                <Text style={s.unblockText}>차단 해제</Text>
              </TouchableOpacity>
            </View>
          )}
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
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      fontSize: 18,
    },
    userName: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    unblockBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 7,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.sm,
    },
    unblockText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '600',
    },
  });
