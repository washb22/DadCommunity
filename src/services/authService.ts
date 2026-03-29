import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {UserProfile} from '../data/mockData';

// Google Sign-In 설정 - Firebase Console에서 webClientId를 가져와 설정하세요
GoogleSignin.configure({
  webClientId: '868174848530-b890uhuijabs3oaosnb41r4bkotq92os.apps.googleusercontent.com',
});

const usersRef = firestore().collection('users');

export async function signInWithGoogle() {
  const {data} = await GoogleSignin.signIn();
  if (!data?.idToken) throw new Error('Google Sign-In failed');
  const credential = auth.GoogleAuthProvider.credential(data.idToken);
  const userCredential = await auth().signInWithCredential(credential);
  await ensureUserProfile(userCredential.user);
  return userCredential.user;
}

export async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch {}
  await auth().signOut();
}

async function ensureUserProfile(user: any) {
  const userDoc = await usersRef.doc(user.uid).get();
  if (!userDoc.exists) {
    const defaultProfile: Omit<UserProfile, 'nickname'> & {
      nickname: string;
      uid: string;
      email: string;
      createdAt: any;
    } = {
      uid: user.uid,
      email: user.email || '',
      nickname: user.displayName || `아빠${Math.floor(Math.random() * 10000)}`,
      avatar: '🧔',
      bio: '',
      postCount: 0,
      likeCount: 0,
      saveCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    await usersRef.doc(user.uid).set(defaultProfile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const doc = await usersRef.doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data() as Record<string, any>;
  return {
    nickname: data.nickname || '',
    avatar: data.avatar || '🧔',
    bio: data.bio || '',
    postCount: data.postCount || 0,
    likeCount: data.likeCount || 0,
    saveCount: data.saveCount || 0,
    childAgeGroup: data.childInfo?.ageGroup || data.childAgeGroup,
    interests: data.interests || [],
  };
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>,
) {
  await usersRef.doc(uid).update(updates);
}

export function onAuthStateChanged(callback: (user: any) => void) {
  return auth().onAuthStateChanged(callback);
}
