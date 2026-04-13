import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, useDarkMode, Theme} from '../theme';
import Header from '../components/Header';
import AgeBadge from '../components/AgeBadge';
import InterestChips from '../components/InterestChip';
import {signOut, deleteAccount} from '../services/authService';
import {Linking} from 'react-native';
import type {ProfileScreenProps} from '../navigation/types';

const MENU_SECTIONS = [
  {
    title: '나의 활동',
    items: [
      {icon: 'create-outline', label: '내가 쓴 글', screen: 'MyPosts'},
      {icon: 'chatbubble-outline', label: '내가 쓴 댓글', screen: 'MyComments'},
      {icon: 'bookmark-outline', label: '저장한 글', screen: 'SavedPosts'},
    ],
  },
  {
    title: '설정',
    items: [
      {icon: 'notifications-outline', label: '알림 설정', screen: 'NotificationSettings'},
      {icon: 'ban-outline', label: '차단 관리', screen: 'BlockList'},
    ],
  },
  {
    title: '정보',
    items: [
      {icon: 'call-outline', label: '문의하기', screen: 'Contact'},
      {icon: 'document-text-outline', label: '이용약관', screen: 'Terms'},
      {icon: 'lock-closed-outline', label: '개인정보처리방침', screen: 'PrivacyPolicy'},
    ],
  },
];

export default function ProfileScreen({navigation}: ProfileScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const {forceDarkMode, setForceDarkMode} = useDarkMode();
  const s = makeStyles(theme);
  const {user} = state;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteNicknameInput, setDeleteNicknameInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({postCount: 0, likeCount: 0, saveCount: 0});

  useEffect(() => {
    if (!state.uid) return;
    const fetchStats = async () => {
      try {
        const snapshot = await firestore()
          .collection('posts')
          .where('userId', '==', state.uid)
          .get();
        let totalLikes = 0;
        let totalSaves = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          totalLikes += data.likes || 0;
          totalSaves += Array.isArray(data.savedBy) ? data.savedBy.length : 0;
        });
        setStats({
          postCount: snapshot.size,
          likeCount: totalLikes,
          saveCount: totalSaves,
        });
      } catch (error) {
        console.warn('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [state.uid]);

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '탈퇴하면 작성한 글, 댓글, 프로필이 모두 삭제되며 복구할 수 없습니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: () => {
            setDeleteNicknameInput('');
            setDeleteModalVisible(true);
          },
        },
      ],
    );
  };

  const handleConfirmDelete = async () => {
    if (deleteNicknameInput !== user.nickname) {
      Alert.alert('닉네임 불일치', '닉네임이 일치하지 않습니다.');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      dispatch({type: 'LOGOUT'});
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    } catch (error: any) {
      Alert.alert('탈퇴 실패', error.message || '탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

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
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <Header
        title="마이페이지"
        rightIcon="settings-outline"
        onRightPress={() => navigation.navigate('NotificationSettings')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileTop}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user.avatar}</Text>
            </View>
            <View style={s.profileInfo}>
              <View style={s.userNameRow}>
                <Text style={s.userName}>{user.nickname}</Text>
                {user.childAgeGroup ? <AgeBadge ageGroup={user.childAgeGroup} /> : null}
              </View>
              <Text style={s.userBio}>{user.bio}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={s.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}>
            <Text style={s.editBtnText}>프로필 수정</Text>
          </TouchableOpacity>

          {user.interests && user.interests.length > 0 && (
            <View style={s.interestsSection}>
              <InterestChips interests={user.interests} />
            </View>
          )}

          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.statNum}>{stats.postCount}</Text>
              <Text style={s.statLabel}>게시글</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statNum}>{stats.likeCount}</Text>
              <Text style={s.statLabel}>받은 좋아요</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statNum}>{stats.saveCount}</Text>
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
                <Icon name={item.icon} size={20} color={theme.colors.textSecondary} style={s.menuIcon} />
                <Text style={s.menuLabel}>{item.label}</Text>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Dark Mode Toggle */}
        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>화면</Text>
          <View style={s.menuItem}>
            <Icon name="moon-outline" size={20} color={theme.colors.textSecondary} style={s.menuIcon} />
            <View style={s.darkModeContent}>
              <Text style={s.menuLabel}>다크 모드</Text>
              <Text style={s.darkModeCaption}>
                {forceDarkMode
                  ? '항상 다크 모드를 사용합니다'
                  : '시스템 설정을 따릅니다'}
              </Text>
            </View>
            <Switch
              value={forceDarkMode}
              onValueChange={setForceDarkMode}
              trackColor={{false: theme.colors.secondaryDark, true: theme.colors.primary}}
              thumbColor={theme.colors.onPrimary}
            />
          </View>
        </View>

        {/* 계정 관리 */}
        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>계정</Text>
          <TouchableOpacity
            style={[s.menuItem, {borderBottomWidth: 0}]}
            onPress={handleDeleteAccount}
            activeOpacity={0.6}>
            <Icon name="person-remove-outline" size={20} color={theme.colors.textTertiary} style={s.menuIcon} />
            <Text style={[s.menuLabel, {color: theme.colors.textTertiary}]}>회원 탈퇴</Text>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Contact Info for Reporting */}
        <View style={s.contactInfoSection}>
          <Icon name="mail-outline" size={16} color={theme.colors.textTertiary} />
          <Text style={s.contactInfoText}>
            부적절한 활동 신고: </Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:sbro@sbrother.co.kr')}>
            <Text style={s.contactInfoLink}>sbro@sbrother.co.kr</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={s.version}>버전 1.0.0</Text>

        {/* 사업자 정보 */}
        <View style={s.businessInfo}>
          <Text style={s.businessName}>워시비 주식회사</Text>
          <Text style={s.businessDetail}>
            대표 : 임진혁{'  |  '}사업자등록번호 : 172-88-02728
          </Text>
          <Text style={s.businessDetail}>
            고객센터 : 031-427-3898
          </Text>
          <Text style={s.businessDetail}>
            E-Mail : sbro@sbrother.co.kr
          </Text>
          <Text style={s.businessAddress}>
            경기도 용인시 수지구 포은대로59번길 37 702호
          </Text>
        </View>
      </ScrollView>

      {/* 회원 탈퇴 확인 모달 */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setDeleteModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {deleting ? (
              <View style={s.modalLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={s.modalLoadingText}>탈퇴 처리 중...</Text>
              </View>
            ) : (
              <>
                <Text style={s.modalTitle}>정말 탈퇴하시겠습니까?</Text>
                <Text style={s.modalDesc}>
                  확인을 위해 닉네임을 입력해주세요.
                </Text>
                <Text style={s.modalNickname}>"{user.nickname}"</Text>
                <TextInput
                  style={s.modalInput}
                  placeholder="닉네임 입력"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={deleteNicknameInput}
                  onChangeText={setDeleteNicknameInput}
                  autoFocus
                />
                <View style={s.modalButtons}>
                  <TouchableOpacity
                    style={s.modalCancelBtn}
                    onPress={() => setDeleteModalVisible(false)}>
                    <Text style={s.modalCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.modalDeleteBtn,
                      deleteNicknameInput !== user.nickname && s.modalDeleteBtnDisabled,
                    ]}
                    onPress={handleConfirmDelete}
                    disabled={deleteNicknameInput !== user.nickname}>
                    <Text style={s.modalDeleteText}>탈퇴하기</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.level3,
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
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
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
      backgroundColor: theme.colors.secondary,
      marginBottom: theme.spacing.base,
    },
    interestsSection: {
      marginBottom: theme.spacing.base,
    },
    editBtnText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
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
      paddingBottom: theme.spacing.sm,
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
      marginRight: theme.spacing.md,
    },
    menuLabel: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    darkModeContent: {
      flex: 1,
    },
    darkModeCaption: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    contactInfoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      gap: theme.spacing.xs,
    },
    contactInfoText: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
    },
    contactInfoLink: {
      ...theme.typography.captionSmall,
      color: theme.colors.primary,
      fontWeight: '600',
      textDecorationLine: 'underline',
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
    businessInfo: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing['2xl'],
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    businessName: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    businessDetail: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      lineHeight: 18,
    },
    businessAddress: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      lineHeight: 18,
      marginTop: theme.spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing['2xl'],
    },
    modalContent: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
    },
    modalLoading: {
      alignItems: 'center',
      paddingVertical: theme.spacing['2xl'],
    },
    modalLoadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    },
    modalTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    modalDesc: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    modalNickname: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.base,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.secondary,
    },
    modalCancelText: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    modalDeleteBtn: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.error,
    },
    modalDeleteBtnDisabled: {
      opacity: 0.4,
    },
    modalDeleteText: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });
