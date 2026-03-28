import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme, Theme} from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({icon, title, subtitle}: EmptyStateProps) {
  const theme = useTheme();
  const s = makeStyles(theme);

  return (
    <View style={s.container}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
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
      paddingVertical: 60,
    },
    icon: {
      fontSize: 48,
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
  });
