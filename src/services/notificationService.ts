import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert, PermissionsAndroid, Platform} from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  // Android 13+ (API 33+) 는 POST_NOTIFICATIONS 런타임 권한이 필요하다.
  // messaging().requestPermission() 만으로는 네이티브 권한 모달이
  // 안 뜰 수 있으므로 PermissionsAndroid 로 명시 요청.
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    } catch (e) {
      console.warn('POST_NOTIFICATIONS request failed:', e);
      // 권한 요청 자체가 실패한 경우에도 FCM 권한 체크는 계속 시도
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.warn('FCM token error:', error);
    return null;
  }
}

export function onForegroundMessage(
  callback: (title: string, body: string, data: any) => void,
) {
  return messaging().onMessage(async remoteMessage => {
    const title = remoteMessage.notification?.title || '';
    const body = remoteMessage.notification?.body || '';
    callback(title, body, remoteMessage.data);
  });
}

export function onBackgroundMessage() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
  });
}

export async function setupNotifications() {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission denied');
      return;
    }

    const token = await getFCMToken();
    if (token) {
      const user = auth().currentUser;
      if (user) {
        await firestore().collection('users').doc(user.uid).set(
          {fcmToken: token, fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp()},
          {merge: true},
        );
      }
    }

    // Subscribe to 'all' topic so this device can receive broadcast pushes.
    // functions/index.js sends pushes to topic:"all"; without this call the
    // device stays unsubscribed and pushes never arrive.
    try {
      await messaging().subscribeToTopic('all');
    } catch (e) {
      console.warn('subscribeToTopic failed:', e);
    }

    // Handle foreground messages
    onForegroundMessage((title, body) => {
      Alert.alert(title, body);
    });

    // Handle background messages
    onBackgroundMessage();
  } catch (error) {
    // Firebase not configured yet
    console.log('FCM setup skipped:', error);
  }
}
