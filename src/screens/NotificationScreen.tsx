import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

const ICON_MAP: Record<string, string> = {
  like: '♥',
  comment: '💬',
  chat: '✉️',
};

export default function NotificationScreen({navigation}: any) {
  const {state} = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="알림"
        showBack
        onBack={() => navigation.goBack()}
      />

      {state.notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="알림이 없습니다"
          subtitle="새로운 소식이 있으면 알려드릴게요"
        />
      ) : (
        <FlatList
          data={state.notifications}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View
              style={[
                styles.notifItem,
                !item.read && styles.notifUnread,
              ]}>
              <View style={styles.notifIcon}>
                <Text style={styles.notifIconText}>
                  {ICON_MAP[item.type] || '🔔'}
                </Text>
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifMessage}>{item.message}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  notifUnread: {
    backgroundColor: '#F8FAFF',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notifIconText: {
    fontSize: 18,
  },
  notifContent: {
    flex: 1,
  },
  notifMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D5BFF',
    marginLeft: 8,
  },
});
