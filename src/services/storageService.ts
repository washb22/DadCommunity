import storage from '@react-native-firebase/storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {Alert, Platform} from 'react-native';

export async function pickImage(): Promise<string | null> {
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
  const urls: string[] = [];
  for (const uri of uris) {
    const url = await uploadImage(uri, `posts/${postId}`);
    urls.push(url);
  }
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
