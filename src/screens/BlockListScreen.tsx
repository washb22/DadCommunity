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
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

export default function BlockListScreen({navigation}: any) {
  const {state, dispatch} = useApp();

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
    <SafeAreaView style={styles.container}>
      <Header
        title="차단 관리"
        showBack
        onBack={() => navigation.goBack()}
        backgroundColor="#fff"
        light
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
            <View style={styles.item}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>🧔</Text>
                </View>
                <Text style={styles.userName}>{item}</Text>
              </View>
              <TouchableOpacity
                style={styles.unblockBtn}
                onPress={() => handleUnblock(item)}>
                <Text style={styles.unblockText}>차단 해제</Text>
              </TouchableOpacity>
            </View>
          )}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  unblockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
  },
  unblockText: {
    fontSize: 13,
    color: '#FF4444',
    fontWeight: '600',
  },
});
