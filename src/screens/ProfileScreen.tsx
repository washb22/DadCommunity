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

const MENU_ITEMS = [
  {icon: '📝', label: '내가 쓴 글'},
  {icon: '💬', label: '내가 쓴 댓글'},
  {icon: '🔖', label: '저장한 글'},
  {icon: '🚫', label: '차단 관리'},
  {icon: '🔔', label: '알림 설정'},
  {icon: '📞', label: '문의하기'},
  {icon: '📄', label: '이용약관'},
  {icon: '🔒', label: '개인정보처리방침'},
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🧔</Text>
          </View>
          <Text style={styles.userName}>두아이아빠</Text>
          <Text style={styles.userBio}>5살, 3살 아빠 | 캠핑 좋아합니다</Text>

          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>프로필 수정</Text>
          </TouchableOpacity>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>23</Text>
              <Text style={styles.statLabel}>게시글</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>156</Text>
              <Text style={styles.statLabel}>받은 좋아요</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>저장</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('로그아웃', '로그아웃 하시겠습니까?')}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 56,
    backgroundColor: '#2D5BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerIcon: {
    fontSize: 20,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  userBio: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  editBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editBtnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 0,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
  menuSection: {
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutBtn: {
    marginTop: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
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
