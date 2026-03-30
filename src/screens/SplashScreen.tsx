import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import type {SplashScreenProps} from '../navigation/types';

export default function SplashScreen({navigation}: SplashScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Wait for Firebase auth state to resolve, then navigate
  useEffect(() => {
    if (!state.isFirebaseReady) return;

    const timer = setTimeout(async () => {
      if (state.isLoggedIn && state.uid) {
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(state.uid)
            .get();
          const data = userDoc.data();
          if (data?.onboardingCompleted) {
            navigation.replace('Main');
          } else {
            navigation.replace('Onboarding');
          }
        } catch {
          navigation.replace('Main');
        }
      } else {
        navigation.replace('Login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state.isFirebaseReady, state.isLoggedIn, state.uid, navigation]);

  return (
    <View style={s.container}>
      <Animated.View
        style={[
          s.logoContainer,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <View style={s.logoCircle}>
          <Text style={s.logo}>👨‍👧‍👦</Text>
        </View>
        <Text style={s.title}>아빠의 다락방</Text>
        <Text style={s.subtitle}>아빠들의 솔직한 이야기</Text>
      </Animated.View>
      <Animated.Text style={[s.footer, {opacity: fadeAnim, bottom: Math.max(40, insets.bottom + 16)}]}>
        Dad Community
      </Animated.Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
    },
    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    logo: {
      fontSize: 48,
    },
    title: {
      ...theme.typography.display,
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      letterSpacing: 2,
    },
  });
