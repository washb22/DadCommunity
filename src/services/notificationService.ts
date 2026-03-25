import messaging from '@react-native-firebase/messaging';
import {Alert, Platform} from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
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
      console.log('FCM Token:', token);
      // TODO: Send token to your server for push notification targeting
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
