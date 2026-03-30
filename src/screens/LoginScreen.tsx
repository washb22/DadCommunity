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
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import {signInWithGoogle} from '../services/authService';
import type {LoginScreenProps} from '../navigation/types';

export default function LoginScreen({navigation}: LoginScreenProps) {
  const {dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
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

  const navigateAfterLogin = async (uid: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      const data = userDoc.data();
      if (data?.onboardingCompleted) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    } catch {
      // If we can't check, go to onboarding to be safe
      navigation.replace('Onboarding');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      dispatch({type: 'LOGIN', uid: user.uid});
      await navigateAfterLogin(user.uid);
    } catch (error: any) {
      console.error('Google login failed:', error.message);
      Alert.alert('로그인 실패', '구글 로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.container, s.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={s.loadingText}>로그인 중...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.topSection}>
        <View style={s.logoCircle}>
          <Text style={s.logo}>👨‍👧‍👦</Text>
        </View>
        <Text style={s.title}>아빠의 다락방</Text>
        <Text style={s.subtitle}>아빠들의 솔직한 이야기 공간</Text>

        <View style={s.valueProps}>
          <View style={s.valueChip}>
            <Icon name="chatbubbles-outline" size={16} color={theme.colors.primary} />
            <Text style={s.valueChipText}>육아 고민 나누기</Text>
          </View>
          <View style={s.valueChip}>
            <Icon name="people-outline" size={16} color={theme.colors.primary} />
            <Text style={s.valueChipText}>또래 아빠 만나기</Text>
          </View>
          <View style={s.valueChip}>
            <Icon name="heart-outline" size={16} color={theme.colors.primary} />
            <Text style={s.valueChipText}>솔직한 대화</Text>
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          s.buttonSection,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        <TouchableOpacity
          style={s.googleBtn}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}>
          <Text style={s.googleG}>G</Text>
          <Text style={s.googleBtnText}>Google로 시작하기</Text>
        </TouchableOpacity>

        <Text style={s.footerText}>
          3초만에 가입하고 아빠들의 이야기에 참여하세요
        </Text>
      </Animated.View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing['2xl'],
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.base,
    },
    logo: {
      fontSize: 44,
    },
    title: {
      ...theme.typography.h1,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    valueProps: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    valueChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
    },
    valueChipText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
    },
    buttonSection: {
      paddingBottom: 60,
      gap: theme.spacing.md,
    },
    googleBtn: {
      height: 52,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
      ...theme.shadows.level2,
    },
    googleG: {
      fontSize: 20,
      fontWeight: '700',
      color: '#4285F4',
    },
    googleBtnText: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    footerText: {
      textAlign: 'center',
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
  });
