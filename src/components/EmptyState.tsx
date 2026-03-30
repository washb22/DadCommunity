import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme, Theme} from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EmptyState({icon, title, subtitle, onAction, actionLabel}: EmptyStateProps) {
  const theme = useTheme();
  const s = makeStyles(theme);

  return (
    <View style={s.container}>
      <View style={[s.iconCircle, {backgroundColor: theme.colors.primary + '33'}]}>
        <Icon name={icon} size={64} color={theme.colors.primary} />
      </View>
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      {onAction && actionLabel && (
        <TouchableOpacity style={s.ctaButton} onPress={onAction} activeOpacity={0.8}>
          <Text style={s.ctaText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['3xl'],
      paddingVertical: theme.spacing['4xl'],
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.base,
    },
    title: {
      ...theme.typography.bodyLarge,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    ctaButton: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
    ctaText: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
  });
