import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({icon, title, subtitle}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
