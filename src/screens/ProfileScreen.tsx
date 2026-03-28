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
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {signOut} from '../services/authService';

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
  const theme = useTheme();
  const s = makeStyles(theme);
  const {user} = state;

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Sign out error:', error);
          }
          dispatch({type: 'LOGOUT'});
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <Header
        title="마이페이지"
        rightIcon="⚙️"
        onRightPress={() => {}}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileTop}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user.avatar}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.userName}>{user.nickname}</Text>
              <Text style={s.userBio}>{user.bio}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={s.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}>
            <Text style={s.editBtnText}>프로필 수정</Text>
          </TouchableOpacity>

          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.statNum}>{user.postCount}</Text>
              <Text style={s.statLabel}>게시글</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statNum}>{user.likeCount}</Text>
              <Text style={s.statLabel}>받은 좋아요</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statNum}>{user.saveCount}</Text>
              <Text style={s.statLabel}>저장</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={s.menuSection}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={s.menuItem}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  }
                }}
                activeOpacity={0.6}>
                <Text style={s.menuIcon}>{item.icon}</Text>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuArrow}>{'>'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={s.version}>버전 1.0.0</Text>
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
    profileCard: {
      backgroundColor: theme.colors.surface,
      margin: theme.spacing.md,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.level2,
    },
    profileTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.base,
    },
    avatarText: {
      fontSize: 30,
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      ...theme.typography.h2,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    userBio: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    editBtn: {
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.base,
    },
    editBtnText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    stat: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    statNum: {
      ...theme.typography.h2,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    statLabel: {
      ...theme.typography.captionSmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
    },
    menuSection: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    sectionTitle: {
      ...theme.typography.captionSmall,
      fontWeight: '700',
      color: theme.colors.textTertiary,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: 6,
      letterSpacing: 0.5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuIcon: {
      fontSize: 18,
      marginRight: theme.spacing.md,
    },
    menuLabel: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    menuArrow: {
      fontSize: 16,
      color: theme.colors.textTertiary,
      fontWeight: '300',
    },
    logoutBtn: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.base,
      alignItems: 'center',
      borderRadius: theme.radius.md,
    },
    logoutText: {
      ...theme.typography.body,
      color: theme.colors.error,
      fontWeight: '600',
    },
    version: {
      textAlign: 'center',
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      paddingVertical: theme.spacing.lg,
    },
  });
