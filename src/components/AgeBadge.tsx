import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme, Theme} from '../theme';

const AGE_GROUP_LABELS: Record<string, string> = {
  expecting: '임신중',
  infant: '영아 아빠',
  toddler: '유아 아빠',
  elementary: '초등 아빠',
  teenager: '중고등 아빠',
};

interface AgeBadgeProps {
  ageGroup: string;
}

export default function AgeBadge({ageGroup}: AgeBadgeProps) {
  const theme = useTheme();
  const s = makeStyles(theme);
  const label = AGE_GROUP_LABELS[ageGroup] || ageGroup;

  return (
    <View style={s.badge}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    text: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.accent,
    },
  });
