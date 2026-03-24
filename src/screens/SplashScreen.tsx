import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function SplashScreen({navigation}: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>👨‍👧‍👦</Text>
      <Text style={styles.title}>아빠의 다락방</Text>
      <Text style={styles.subtitle}>아빠들의 솔직한 이야기</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D5BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});
