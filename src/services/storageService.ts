import storage from '@react-native-firebase/storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {Alert, Platform, PermissionsAndroid} from 'react-native';

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '카메라 권한',
        message: '사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
        buttonPositive: '허용',
        buttonNegative: '거부',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

async function requestGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const sdkInt = Platform.Version as number;
    if (sdkInt >= 33) {
      const granted = await PermissionsAndroid.request(
        'android.permission.READ_MEDIA_IMAGES' as any,
        {
          title: '사진 접근 권한',
          message: '갤러리에서 사진을 선택하기 위해 권한이 필요합니다.',
          buttonPositive: '허용',
          buttonNegative: '거부',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: '저장소 접근 권한',
          message: '갤러리에서 사진을 선택하기 위해 권한이 필요합니다.',
          buttonPositive: '허용',
          buttonNegative: '거부',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch {
    return false;
  }
}

export async function pickImage(): Promise<string | null> {
  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) {
    Alert.alert('권한 필요', '설정에서 사진 접근 권한을 허용해주세요.');
    return null;
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
  });

  if (result.didCancel || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    Alert.alert('권한 필요', '설정에서 카메라 권한을 허용해주세요.');
    return null;
  }

  const result = await launchCamera({
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
  });

  if (result.didCancel || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function uploadImage(
  uri: string,
  path: string,
): Promise<string> {
  const filename = `${path}/${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const ref = storage().ref(filename);

  // Platform-specific URI handling
  const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

  await ref.putFile(uploadUri);
  const downloadUrl = await ref.getDownloadURL();
  return downloadUrl;
}

export async function uploadPostImages(
  postId: string,
  uris: string[],
): Promise<string[]> {
  // 기존: 한 장씩 순서대로 (느림)
  // 변경: 동시에 병렬 업로드 (빠름)
  const urls = await Promise.all(
    uris.map(uri => uploadImage(uri, `posts/${postId}`)),
  );
  return urls;
}

export async function uploadProfileImage(
  userId: string,
  uri: string,
): Promise<string> {
  return uploadImage(uri, `profiles/${userId}`);
}

export async function deleteImage(url: string) {
  try {
    const ref = storage().refFromURL(url);
    await ref.delete();
  } catch (error) {
    console.warn('Failed to delete image:', error);
  }
}
