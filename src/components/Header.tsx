import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme, Theme} from '../theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightIcon2?: string;
  onRightPress2?: () => void;
  backgroundColor?: string;
}

export default function Header({
  title,
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  rightIcon2,
  onRightPress2,
  backgroundColor,
}: HeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(theme);

  const bg = backgroundColor || theme.colors.surface;

  return (
    <View style={[s.header, {backgroundColor: bg}]}>
      <View style={s.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={s.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={s.title}>{title}</Text>
      </View>
      <View style={s.right}>
        {rightIcon2 && (
          <TouchableOpacity onPress={onRightPress2} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name={rightIcon2} size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name={rightIcon} size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    backBtn: {
      paddingRight: theme.spacing.xs,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.textPrimary,
      letterSpacing: -0.5,
    },
    right: {
      flexDirection: 'row',
      gap: theme.spacing.base,
    },
  });
