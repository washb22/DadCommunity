import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated, Modal, TouchableOpacity, Linking, Platform, BackHandler} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import type {SplashScreenProps} from '../navigation/types';

const APP_VERSION = '1.0.0';

function compareVersions(current: string, minimum: string): boolean {
  const c = current.split('.').map(Number);
  const m = minimum.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((c[i] || 0) < (m[i] || 0)) return true;
    if ((c[i] || 0) > (m[i] || 0)) return false;
  }
  return false;
}

export default function SplashScreen({navigation}: SplashScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [storeUrl, setStoreUrl] = useState('');

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
      // Check force update
      try {
        const versionDoc = await firestore().collection('appConfig').doc('appVersion').get();
        if ((versionDoc as any).exists) {
          const v = versionDoc.data();
          if (v?.forceUpdateEnabled) {
            const minVersion = Platform.OS === 'ios' ? v.minVersionIos : v.minVersionAndroid;
            if (minVersion && compareVersions(APP_VERSION, minVersion)) {
              setUpdateMessage(v.updateMessage || '새로운 버전이 출시되었습니다.\n원활한 이용을 위해 업데이트해주세요.');
              setStoreUrl(Platform.OS === 'ios' ? (v.appStoreUrl || '') : (v.playStoreUrl || ''));
              setUpdateRequired(true);
              return;
            }
          }
        }
      } catch (e) {
        console.log('Version check failed:', e);
      }

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

  // Block back button when update required
  useEffect(() => {
    if (!updateRequired) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });
    return () => handler.remove();
  }, [updateRequired]);

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

      <Modal visible={updateRequired} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalIcon}>🔄</Text>
            <Text style={s.modalTitle}>업데이트 필요</Text>
            <Text style={s.modalMessage}>{updateMessage}</Text>
            <Text style={s.modalVersion}>현재 버전: {APP_VERSION}</Text>
            <TouchableOpacity
              style={s.modalButton}
              onPress={() => {
                if (storeUrl) {
                  Linking.openURL(storeUrl);
                }
              }}>
              <Text style={s.modalButtonText}>업데이트 하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBox: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 32,
      width: '85%',
      alignItems: 'center',
    },
    modalIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center' as const,
      lineHeight: 22,
      marginBottom: 8,
    },
    modalVersion: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginBottom: 24,
    },
    modalButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 48,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center' as const,
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600' as const,
    },
  });
