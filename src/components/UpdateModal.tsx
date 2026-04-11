import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme, Theme} from '../theme';

export type UpdateModalMode = 'force' | 'recommended' | 'welcome';

interface UpdateModalProps {
  visible: boolean;
  mode: UpdateModalMode;
  version: string;
  releaseNotes: string;
  onUpdate: () => void;
  onDismiss?: () => void;
}

const MODE_CONFIG: Record<
  UpdateModalMode,
  {
    icon: string;
    title: string;
    subtitle: string;
    primaryLabel: string;
    secondaryLabel?: string;
  }
> = {
  force: {
    icon: 'alert-circle',
    title: '업데이트가 필요해요',
    subtitle: '안정적인 사용을 위해 최신 버전으로 업데이트해주세요.',
    primaryLabel: '지금 업데이트',
  },
  recommended: {
    icon: 'refresh-circle',
    title: '새로운 버전이 나왔어요',
    subtitle: '더 나은 경험을 위해 업데이트를 추천드려요.',
    primaryLabel: '업데이트',
    secondaryLabel: '나중에',
  },
  welcome: {
    icon: 'checkmark-circle',
    title: '업데이트 완료!',
    subtitle: '이번 버전에서 달라진 점을 확인해보세요.',
    primaryLabel: '확인',
  },
};

export default function UpdateModal({
  visible,
  mode,
  version,
  releaseNotes,
  onUpdate,
  onDismiss,
}: UpdateModalProps) {
  const theme = useTheme();
  const s = makeStyles(theme);
  const config = MODE_CONFIG[mode];

  // force 모드에서는 Android 뒤로가기 버튼 완전 차단
  React.useEffect(() => {
    if (!visible || mode !== 'force') return;
    const handler = () => true; // 뒤로가기 무효
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [visible, mode]);

  // welcome 모드는 onUpdate 누르면 Play Store 이동이 아닌 단순 닫기
  const handlePrimary = mode === 'welcome' ? onDismiss : onUpdate;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // force 모드에서는 onRequestClose 무효 처리 (빈 함수)
      onRequestClose={mode === 'force' ? () => {} : onDismiss}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.iconCircle}>
            <Icon name={config.icon} size={48} color={theme.colors.primary} />
          </View>

          <Text style={s.title}>{config.title}</Text>
          {!!version && (
            <Text style={s.versionBadge}>버전 {version}</Text>
          )}
          <Text style={s.subtitle}>{config.subtitle}</Text>

          {!!releaseNotes && (
            <ScrollView
              style={s.notesBox}
              contentContainerStyle={s.notesContent}
              showsVerticalScrollIndicator>
              <Text style={s.notesText}>{releaseNotes}</Text>
            </ScrollView>
          )}

          <View style={s.buttonRow}>
            {mode === 'recommended' && config.secondaryLabel && onDismiss && (
              <TouchableOpacity
                style={[s.button, s.secondaryButton]}
                onPress={onDismiss}
                activeOpacity={0.8}>
                <Text style={s.secondaryButtonText}>
                  {config.secondaryLabel}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.button, s.primaryButton]}
              onPress={handlePrimary}
              activeOpacity={0.8}>
              <Text style={s.primaryButtonText}>{config.primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h2,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    versionBadge: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    notesBox: {
      maxHeight: 200,
      width: '100%',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
    },
    notesContent: {
      padding: theme.spacing.base,
    },
    notesText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      lineHeight: 22,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      width: '100%',
    },
    button: {
      flex: 1,
      height: 52,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      ...theme.typography.bodyLarge,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background,
    },
    secondaryButtonText: {
      ...theme.typography.bodyLarge,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
  });
