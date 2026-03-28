import firestore from '@react-native-firebase/firestore';

const followsRef = firestore().collection('follows');

/**
 * Follow a user.
 * Document ID: `{followerId}_{followingId}`
 */
export async function followUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  const docId = `${followerId}_${followingId}`;
  await followsRef.doc(docId).set({
    followerId,
    followingId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  const docId = `${followerId}_${followingId}`;
  await followsRef.doc(docId).delete();
}

/**
 * Get all followers of a user (people who follow this user).
 */
export async function getFollowers(
  userId: string,
): Promise<string[]> {
  const snapshot = await followsRef
    .where('followingId', '==', userId)
    .get();
  return snapshot.docs.map(doc => doc.data().followerId as string);
}

/**
 * Get all users that a user is following.
 */
export async function getFollowing(
  userId: string,
): Promise<string[]> {
  const snapshot = await followsRef
    .where('followerId', '==', userId)
    .get();
  return snapshot.docs.map(doc => doc.data().followingId as string);
}

/**
 * Check if followerId is following followingId.
 */
export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const docId = `${followerId}_${followingId}`;
  const doc = await followsRef.doc(docId).get();
  return doc.exists as unknown as boolean;
}
