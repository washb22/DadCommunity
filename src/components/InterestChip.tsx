import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme, Theme} from '../theme';

interface InterestChipsProps {
  interests: string[];
  maxVisible?: number;
}

export default function InterestChips({interests, maxVisible = 6}: InterestChipsProps) {
  const theme = useTheme();
  const s = makeStyles(theme);

  if (!interests || interests.length === 0) return null;

  const visible = interests.slice(0, maxVisible);
  const remaining = interests.length - maxVisible;

  return (
    <View style={s.container}>
      {visible.map(interest => (
        <View key={interest} style={s.chip}>
          <Text style={s.chipText}>{interest}</Text>
        </View>
      ))}
      {remaining > 0 && (
        <View style={s.chip}>
          <Text style={s.chipText}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
    },
    chipText: {
      ...theme.typography.captionSmall,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });
