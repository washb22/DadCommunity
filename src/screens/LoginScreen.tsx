import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {
  signInWithGoogle,
  signInAnonymously,
} from '../services/authService';

export default function LoginScreen({navigation}: any) {
  const {dispatch} = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      dispatch({type: 'LOGIN', uid: user.uid});
      navigation.replace('Main');
    } catch (error: any) {
      // Firebase 미설정 시 mock 로그인으로 fallback
      console.log('Google login failed, using mock:', error.message);
      dispatch({type: 'LOGIN'});
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // 카카오 로그인은 백엔드 Custom Token 방식으로 구현 예정
    // 현재는 mock 로그인
    Alert.alert(
      '카카오 로그인',
      '카카오 로그인은 서버 연동 후 사용 가능합니다.\n둘러보기로 이동합니다.',
      [
        {
          text: '확인',
          onPress: () => {
            dispatch({type: 'LOGIN'});
            navigation.replace('Main');
          },
        },
      ],
    );
  };

  const handleNaverLogin = () => {
    // 네이버 로그인도 카카오와 동일하게 Custom Token
    Alert.alert(
      '네이버 로그인',
      '네이버 로그인은 서버 연동 후 사용 가능합니다.\n둘러보기로 이동합니다.',
      [
        {
          text: '확인',
          onPress: () => {
            dispatch({type: 'LOGIN'});
            navigation.replace('Main');
          },
        },
      ],
    );
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const user = await signInAnonymously();
      dispatch({type: 'LOGIN', uid: user.uid});
      navigation.replace('Main');
    } catch {
      // Fallback to mock
      dispatch({type: 'LOGIN'});
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2D5BFF" />
        <Text style={styles.loadingText}>로그인 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>👨‍👧‍👦</Text>
        </View>
        <Text style={styles.title}>아빠의 다락방</Text>
        <Text style={styles.subtitle}>아빠들의 솔직한 이야기 공간</Text>
      </View>

      <Animated.View
        style={[
          styles.buttonSection,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        <TouchableOpacity
          style={[styles.loginBtn, styles.kakao]}
          onPress={handleKakaoLogin}
          activeOpacity={0.8}>
          <Text style={styles.kakaoText}>💬  카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, styles.naver]}
          onPress={handleNaverLogin}
          activeOpacity={0.8}>
          <Text style={styles.naverText}>N  네이버로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, styles.google]}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}>
          <Text style={styles.googleText}>G  구글로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGuestLogin}>
          <Text style={styles.skipText}>둘러보기</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    letterSpacing: -0.5,
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
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  kakaoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C1E1E',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  naverText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  google: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '700',
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
