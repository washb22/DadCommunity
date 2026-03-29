import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import * as reportService from '../services/reportService';
import type {BlockListScreenProps} from '../navigation/types';

export default function BlockListScreen({navigation}: BlockListScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [loading, setLoading] = useState(true);

  // Load blocked users from Firestore on mount
  useEffect(() => {
    if (!state.uid) {
      setLoading(false);
      return;
    }
    reportService
      .getBlockedUsers(state.uid)
      .then(blockedIds => {
        dispatch({type: 'SET_BLOCKED_USERS', blockedUsers: blockedIds});
      })
      .catch(error => {
        console.error('Failed to fetch blocked users:', error);
      })
      .finally(() => setLoading(false));
  }, [state.uid, dispatch]);

  const handleUnblock = (userId: string) => {
    Alert.alert('차단 해제', `이 사용자의 차단을 해제하시겠습니까?`, [
      {text: '취소', style: 'cancel'},
      {
        text: '해제',
        onPress: async () => {
          if (!state.uid) return;
          dispatch({type: 'UNBLOCK_USER', userId});
          try {
            await reportService.unblockUser(state.uid, userId);
          } catch (error) {
            // Revert on failure
            dispatch({type: 'BLOCK_USER', userId});
            console.error('Failed to unblock user:', error);
            Alert.alert('오류', '차단 해제에 실패했습니다. 다시 시도해주세요.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title="차단 관리" showBack onBack={() => navigation.goBack()} />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="차단 관리"
        showBack
        onBack={() => navigation.goBack()}
      />

      {state.blockedUsers.length === 0 ? (
        <EmptyState
          icon="ban-outline"
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
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.sm,
    },
    unblockText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '600',
    },
  });
