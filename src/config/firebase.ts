import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// Firebase는 google-services.json (Android) / GoogleService-Info.plist (iOS) 로 자동 초기화됩니다.
// Firebase Console에서 프로젝트 생성 후 해당 파일을 다운로드하여 배치하세요:
// - Android: android/app/google-services.json
// - iOS: ios/DadCommunity/GoogleService-Info.plist

export { firebase, auth, firestore, storage, messaging };
