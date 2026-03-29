import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp, Notification} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import firestore from '@react-native-firebase/firestore';
import {getRelativeTime} from '../data/mockData';
import type {NotificationScreenProps} from '../navigation/types';

const ICON_MAP: Record<string, string> = {
  like: 'heart',
  comment: 'chatbubble-outline',
  chat: 'mail-outline',
};

export default function NotificationScreen({navigation}: NotificationScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Firestore
  useEffect(() => {
    if (!state.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('notifications')
      .where('userId', '==', state.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(
        snapshot => {
          const notifications: Notification[] = snapshot.docs.map(doc => {
            const data = doc.data();
            const ts =
              data.timestamp && typeof data.timestamp.toDate === 'function'
                ? data.timestamp.toDate().getTime()
                : typeof data.timestamp === 'number'
                ? data.timestamp
                : Date.now();
            return {
              id: doc.id,
              type: data.type || 'like',
              message: data.message || '',
              time: getRelativeTime(ts),
              timestamp: ts,
              read: data.read || false,
            };
          });
          dispatch({type: 'SET_NOTIFICATIONS', notifications});
          setLoading(false);
        },
        error => {
          console.error('Failed to fetch notifications:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [state.uid, dispatch]);

  const handleNotificationPress = async (item: Notification) => {
    if (!item.read && state.uid) {
      try {
        await firestore()
          .collection('notifications')
          .doc(item.id)
          .update({read: true});
      } catch (error) {
        console.error('Failed to mark notification read:', error);
      }
      dispatch({type: 'MARK_NOTIFICATION_READ', notificationId: item.id});
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title="알림" showBack onBack={() => navigation.goBack()} />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="알림"
        showBack
        onBack={() => navigation.goBack()}
      />

      {state.notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="알림이 없습니다"
          subtitle="새로운 소식이 있으면 알려드릴게요"
        />
      ) : (
        <FlatList
          data={state.notifications}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                s.notifItem,
                !item.read && s.notifUnread,
              ]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}>
              <View style={s.notifIcon}>
                <Icon
                  name={ICON_MAP[item.type] || 'notifications-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
              <View style={s.notifContent}>
                <Text style={s.notifMessage}>{item.message}</Text>
                <Text style={s.notifTime}>{item.time}</Text>
              </View>
              {!item.read && <View style={s.unreadDot} />}
            </TouchableOpacity>
          )}
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
      backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    notifUnread: {
      backgroundColor: theme.colors.secondary,
    },
    notifIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    notifContent: {
      flex: 1,
    },
    notifMessage: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    notifTime: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
  });
