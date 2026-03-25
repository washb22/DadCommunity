import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

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
  backgroundColor = '#2D5BFF',
  light = false,
}: HeaderProps) {
  const titleColor = light ? '#333' : '#fff';
  const borderStyle = light
    ? {borderBottomWidth: 1, borderBottomColor: '#eee'}
    : {};

  return (
    <View style={[styles.header, {backgroundColor}, borderStyle]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={[styles.backText, {color: titleColor}]}>{'<'}</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, {color: titleColor}]}>{title}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  right: {
    flexDirection: 'row',
    gap: 14,
  },
  icon: {
    fontSize: 20,
  },
});
