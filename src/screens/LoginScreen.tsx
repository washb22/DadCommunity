import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export default function LoginScreen({navigation}: any) {
  const handleLogin = () => {
    // TODO: 실제 소셜 로그인 연동
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.logo}>👨‍👧‍👦</Text>
        <Text style={styles.title}>아빠의 다락방</Text>
        <Text style={styles.subtitle}>아빠들의 솔직한 이야기 공간</Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.loginBtn, styles.kakao]}
          onPress={handleLogin}>
          <Text style={styles.kakaoText}>💬 카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, styles.naver]}
          onPress={handleLogin}>
          <Text style={styles.naverText}>N  네이버로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, styles.google]}
          onPress={handleLogin}>
          <Text style={styles.googleText}>G  구글로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.skipText}>둘러보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  buttonSection: {
    paddingBottom: 60,
    gap: 12,
  },
  loginBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  kakaoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C1E1E',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  naverText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  google: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  skipText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});
