import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import type {NotificationSettingsScreenProps} from '../navigation/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NotificationSettings {
  pushEnabled: boolean;
  likeEnabled: boolean;
  commentEnabled: boolean;
  followEnabled: boolean;
  chatEnabled: boolean;
  noticeEnabled: boolean;
  popularEnabled: boolean;
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  likeEnabled: true,
  commentEnabled: true,
  followEnabled: true,
  chatEnabled: true,
  noticeEnabled: true,
  popularEnabled: false,
  dndEnabled: false,
  dndStart: '22:00',
  dndEnd: '07:00',
};

export default function NotificationSettingsScreen({
  navigation,
}: NotificationSettingsScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const uid = state.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    firestore()
      .collection('users')
      .doc(uid)
      .collection('settings')
      .doc('notifications')
      .get()
      .then(doc => {
        const data = doc.data();
        if (data) {
          setSettings({...DEFAULT_SETTINGS, ...data});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [state.uid]);

  const saveSettings = useCallback(
    (updated: NotificationSettings) => {
      const uid = state.uid;
      if (!uid) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        firestore()
          .collection('users')
          .doc(uid)
          .collection('settings')
          .doc('notifications')
          .set(updated, {merge: true})
          .catch(() => {});
      }, 300);
    },
    [state.uid],
  );

  const toggle = useCallback(
    (key: keyof NotificationSettings) => {
      setSettings(prev => {
        const updated = {...prev, [key]: !prev[key]};
        if (key === 'dndEnabled') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        saveSettings(updated);
        return updated;
      });
    },
    [saveSettings],
  );

  const pushDisabled = !settings.pushEnabled;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header title="알림 설정" showBack onBack={() => navigation.goBack()} />
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header title="알림 설정" showBack onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 전체 알림 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>전체 알림</Text>
          <SettingRow
            icon="bell-outline"
            label="푸시 알림"
            value={settings.pushEnabled}
            onToggle={() => toggle('pushEnabled')}
            theme={theme}
            s={s}
          />
          <Text style={s.caption}>끄면 모든 푸시 알림이 중지됩니다</Text>
        </View>

        {/* 활동 알림 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>활동 알림</Text>
          <SettingRow
            icon="heart-outline"
            label="좋아요 알림"
            value={settings.likeEnabled}
            onToggle={() => toggle('likeEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
          <View style={s.divider} />
          <SettingRow
            icon="chatbubble-outline"
            label="댓글 알림"
            value={settings.commentEnabled}
            onToggle={() => toggle('commentEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
          <View style={s.divider} />
          <SettingRow
            icon="person-add-outline"
            label="팔로우 알림"
            value={settings.followEnabled}
            onToggle={() => toggle('followEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
        </View>

        {/* 채팅 알림 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>채팅 알림</Text>
          <SettingRow
            icon="mail-outline"
            label="새 메시지 알림"
            value={settings.chatEnabled}
            onToggle={() => toggle('chatEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
        </View>

        {/* 커뮤니티 알림 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>커뮤니티 알림</Text>
          <SettingRow
            icon="megaphone-outline"
            label="공지사항 알림"
            value={settings.noticeEnabled}
            onToggle={() => toggle('noticeEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
          <View style={s.divider} />
          <SettingRow
            icon="trending-up-outline"
            label="인기글 알림"
            value={settings.popularEnabled}
            onToggle={() => toggle('popularEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
        </View>

        {/* 방해금지 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>방해금지</Text>
          <SettingRow
            icon="moon-outline"
            label="방해금지 모드"
            value={settings.dndEnabled}
            onToggle={() => toggle('dndEnabled')}
            disabled={pushDisabled}
            theme={theme}
            s={s}
          />
          <Text style={s.caption}>설정한 시간에는 알림을 받지 않습니다</Text>
          {settings.dndEnabled && !pushDisabled && (
            <View style={s.dndTimeRow}>
              <View style={s.dndTimeBlock}>
                <Text style={s.dndLabel}>시작 시간</Text>
                <Text style={s.dndTime}>{settings.dndStart}</Text>
              </View>
              <View style={s.dndTimeBlock}>
                <Text style={s.dndLabel}>종료 시간</Text>
                <Text style={s.dndTime}>{settings.dndEnd}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onToggle,
  disabled,
  theme,
  s,
}: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  theme: Theme;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={[s.row, disabled && s.rowDisabled]}>
      <Icon
        name={icon}
        size={20}
        color={disabled ? theme.colors.textTertiary : theme.colors.textSecondary}
      />
      <Text style={[s.rowLabel, disabled && s.rowLabelDisabled]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{
          false: '#D4C9B8',
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.onPrimary}
      />
    </View>
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
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      marginHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
    },
    sectionTitle: {
      ...theme.typography.overline,
      fontWeight: '700',
      color: theme.colors.textTertiary,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: theme.spacing.base,
      gap: theme.spacing.md,
    },
    rowDisabled: {
      opacity: 0.5,
    },
    rowLabel: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    rowLabelDisabled: {
      color: theme.colors.textTertiary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: theme.spacing.base,
    },
    caption: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    dndTimeRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.base,
      gap: theme.spacing.md,
    },
    dndTimeBlock: {
      flex: 1,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    dndLabel: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xs,
    },
    dndTime: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    bottomSpacer: {
      height: theme.spacing['3xl'],
    },
  });
