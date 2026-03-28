import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightIcon2?: string;
  onRightPress2?: () => void;
  backgroundColor?: string;
  light?: boolean;
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
  light,
}: HeaderProps) {
  const theme = useTheme();

  // Default: white background + border (new design)
  const bg = backgroundColor || theme.colors.surface;
  const isLight = light !== false; // default to light style
  const titleColor = isLight ? theme.colors.textPrimary : '#fff';
  const borderStyle = isLight
    ? {borderBottomWidth: 1, borderBottomColor: theme.colors.border}
    : {};

  return (
    <View style={[styles.header, {backgroundColor: bg}, borderStyle]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={[styles.backText, {color: titleColor}]}>{'<'}</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, theme.typography.h2, {color: titleColor}]}>{title}</Text>
      </View>
      <View style={styles.right}>
        {rightIcon2 && (
          <TouchableOpacity onPress={onRightPress2} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.icon}>{rightIcon2}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.icon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    paddingRight: 4,
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
  },
  title: {},
  right: {
    flexDirection: 'row',
    gap: 14,
  },
  icon: {
    fontSize: 20,
  },
});
