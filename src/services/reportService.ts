import firestore from '@react-native-firebase/firestore';

const reportsRef = firestore().collection('reports');
const blocksRef = firestore().collection('blocks');

export type ReportReason =
  | '욕설/비방'
  | '음란물'
  | '광고/스팸'
  | '개인정보 노출'
  | '기타';

export async function reportContent(report: {
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: ReportReason;
  detail?: string;
}) {
  await reportsRef.add({
    ...report,
    status: 'pending',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function blockUser(currentUserId: string, blockedUserId: string) {
  await blocksRef.doc(`${currentUserId}_${blockedUserId}`).set({
    blocker: currentUserId,
    blocked: blockedUserId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function unblockUser(
  currentUserId: string,
  blockedUserId: string,
) {
  await blocksRef.doc(`${currentUserId}_${blockedUserId}`).delete();
}

export interface BlockedUserInfo {
  userId: string;
  nickname: string;
  avatar: string;
}

export async function getBlockedUsers(userId: string): Promise<string[]> {
  const snapshot = await blocksRef
    .where('blocker', '==', userId)
    .get();

  return snapshot.docs.map(doc => doc.data().blocked);
}

export async function getBlockedUsersWithInfo(userId: string): Promise<BlockedUserInfo[]> {
  const snapshot = await blocksRef
    .where('blocker', '==', userId)
    .get();

  const blockedIds = snapshot.docs.map(doc => doc.data().blocked);
  if (blockedIds.length === 0) return [];

  const usersRef = firestore().collection('users');
  const results: BlockedUserInfo[] = [];
  for (const uid of blockedIds) {
    try {
      const userDoc = await usersRef.doc(uid).get();
      const data = userDoc.data();
      results.push({
        userId: uid,
        nickname: data?.nickname || '알 수 없는 사용자',
        avatar: data?.avatar || '🧔',
      });
    } catch {
      results.push({userId: uid, nickname: '알 수 없는 사용자', avatar: '🧔'});
    }
  }
  return results;
}

export async function isBlocked(
  currentUserId: string,
  targetUserId: string,
): Promise<boolean> {
  const doc = await blocksRef
    .doc(`${currentUserId}_${targetUserId}`)
    .get();
  return doc.exists as unknown as boolean;
}
