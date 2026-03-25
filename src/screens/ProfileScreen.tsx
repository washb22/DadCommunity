import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useApp} from '../context/AppContext';
import Header from '../components/Header';

const MENU_SECTIONS = [
  {
    title: '나의 활동',
    items: [
      {icon: '📝', label: '내가 쓴 글', screen: 'MyPosts'},
      {icon: '💬', label: '내가 쓴 댓글', screen: 'MyComments'},
      {icon: '★', label: '저장한 글', screen: 'SavedPosts'},
    ],
  },
  {
    title: '설정',
    items: [
      {icon: '🔔', label: '알림 설정', screen: null},
      {icon: '🚫', label: '차단 관리', screen: 'BlockList'},
    ],
  },
  {
    title: '정보',
    items: [
      {icon: '📞', label: '문의하기', screen: null},
      {icon: '📄', label: '이용약관', screen: null},
      {icon: '🔒', label: '개인정보처리방침', screen: null},
    ],
  },
];

export default function ProfileScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const {user} = state;

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          dispatch({type: 'LOGOUT'});
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="마이페이지"
        rightIcon="⚙️"
        onRightPress={() => {}}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.nickname}</Text>
              <Text style={styles.userBio}>{user.bio}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}>
            <Text style={styles.editBtnText}>프로필 수정</Text>
          </TouchableOpacity>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user.postCount}</Text>
              <Text style={styles.statLabel}>게시글</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user.likeCount}</Text>
              <Text style={styles.statLabel}>받은 좋아요</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user.saveCount}</Text>
              <Text style={styles.statLabel}>저장</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={styles.menuItem}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  }
                }}
                activeOpacity={0.6}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>{'>'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.version}>버전 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  userBio: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  editBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F2F5',
    marginBottom: 16,
  },
  editBtnText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D5BFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F0F0F0',
    alignSelf: 'center',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  menuArrow: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutBtn: {
    marginHorizontal: 12,
    marginTop: 4,
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 15,
    color: '#FF4444',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ccc',
    paddingVertical: 20,
  },
});
