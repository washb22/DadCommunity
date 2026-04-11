import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Post, Comment, Reply, getRelativeTime} from '../data/mockData';

const postsRef = firestore().collection('posts');
const notificationsRef = firestore().collection('notifications');

// ─── popular 피드 클라이언트 메모리 캐시 (5분 TTL) ───
// fetchPosts('popular')은 호출마다 limit(100) 풀 스캔이므로 캐시 없이는
// Firestore Spark 무료 한도(50k reads/day)를 쉽게 넘김. 카테고리별 키 분리.
const POPULAR_CACHE_TTL_MS = 5 * 60 * 1000;
const popularCache = new Map<string, {ts: number; posts: Post[]}>();

export function invalidatePopularCache(category?: string) {
  if (category === undefined) {
    popularCache.clear();
  } else {
    popularCache.delete(category || '전체');
  }
}

/**
 * 알림 문서 생성 (notifications 컬렉션)
 * - 자기 자신에게는 알림을 보내지 않음
 */
async function createNotification(params: {
  userId: string;       // 알림 받을 사람
  senderId: string;     // 알림 보낸 사람
  senderName: string;
  type: 'like' | 'comment' | 'reply' | 'empathy';
  targetId: string;     // postId
  message: string;
}) {
  if (params.userId === params.senderId) return; // 자기 자신 제외
  try {
    await notificationsRef.add({
      userId: params.userId,
      senderId: params.senderId,
      senderName: params.senderName,
      type: params.type,
      targetId: params.targetId,
      message: params.message,
      read: false,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.warn('Failed to create notification:', error);
  }
}

/**
 * Firestore에서 가져온 Post 배열에 유저별 liked/saved 상태와 상대시간을 부여.
 * HomeFeedScreen 등에서 중복되던 enrich 로직을 한 곳으로 통합.
 */
export function enrichPostsWithUserData(
  posts: Partial<Post>[],
  currentUid: string | null,
): Post[] {
  return posts.map(p => {
    const ts =
      p.timestamp && typeof p.timestamp.toDate === 'function'
        ? p.timestamp.toDate().getTime()
        : typeof p.timestamp === 'number'
        ? p.timestamp
        : Date.now();
    return {
      ...p,
      time: getRelativeTime(ts),
      timestamp: ts,
      liked: Array.isArray(p.likedBy)
        ? p.likedBy.includes(currentUid || '')
        : false,
      saved: Array.isArray(p.savedBy)
        ? p.savedBy.includes(currentUid || '')
        : false,
      comments: p.comments || [],
    };
  });
}

export async function fetchPosts(
  category?: string,
  sortBy: 'latest' | 'popular' = 'latest',
  lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
  limit = 20,
) {
  let query = postsRef as FirebaseFirestoreTypes.Query;

  if (category && category !== '전체') {
    query = query.where('category', '==', category);
  }

  if (sortBy === 'popular') {
    // 5분 메모리 캐시 확인 (첫 페이지만 — popular는 페이지네이션 없음)
    const cacheKey = category || '전체';
    const cached = popularCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < POPULAR_CACHE_TTL_MS) {
      return {
        posts: cached.posts.slice(0, limit),
        lastDoc: null,
        hasMore: false,
      };
    }

    // 인기글: 최근 글을 충분히 가져온 뒤 점수 기반 정렬
    query = query.orderBy('timestamp', 'desc').limit(100);
    const snapshot = await query.get();
    const now = Date.now();
    const scored = snapshot.docs.map(doc => {
      const data = doc.data();
      const likes = data.likes || 0;
      const comments = data.commentCount || 0;
      const saves = Array.isArray(data.savedBy) ? data.savedBy.length : 0;
      const ts = data.timestamp?.toDate
        ? data.timestamp.toDate().getTime()
        : 0;
      if (!ts) return {id: doc.id, ...data, _score: 0, _doc: doc};
      const hoursAgo = Math.max(0, (now - ts) / (1000 * 60 * 60));
      const empathy = data.empathyCount || 0;
      const score = (likes + comments * 2 + saves + empathy * 1.5) / Math.pow(hoursAgo + 2, 1.5);
      return {id: doc.id, ...data, _score: score, _doc: doc};
    });
    scored.sort((a, b) => b._score - a._score);
    const sliced = scored.slice(0, limit);
    const posts = sliced.map(({_score, _doc, ...rest}) => rest) as Post[];

    // 캐시에 저장 (다음 5분간 재호출 시 Firestore 접근 없음)
    popularCache.set(cacheKey, {ts: Date.now(), posts});

    return {
      posts,
      lastDoc: null,
      hasMore: false,
    };
  }

  query = query.orderBy('timestamp', 'desc');

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  query = query.limit(limit);

  const snapshot = await query.get();
  const posts: Post[] = [];
  snapshot.forEach(doc => {
    posts.push({id: doc.id, ...doc.data()} as Post);
  });

  return {
    posts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === limit,
  };
}

export async function incrementViewCount(postId: string) {
  await postsRef.doc(postId).update({
    viewCount: firestore.FieldValue.increment(1),
  });
}

export async function fetchPostById(postId: string): Promise<Post | null> {
  const doc = await postsRef.doc(postId).get();
  if (!doc.exists) return null;
  return {id: doc.id, ...doc.data()} as Post;
}

export async function createPost(post: {
  user: string;
  userId: string;
  avatar: string;
  category: string;
  title: string;
  text: string;
  isAnonymous: boolean;
  images?: string[];
  authorAgeGroup?: string;
  poll?: {
    options: string[];
    votes: Record<string, number>;
    votedBy: Record<string, number>;
    totalVotes: number;
  };
}) {
  const newPost: Record<string, any> = {
    ...post,
    timestamp: firestore.FieldValue.serverTimestamp(),
    likes: 0,
    likedBy: [],
    savedBy: [],
    commentCount: 0,
    images: post.images || [],
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  // ✅ undefined 값 제거 (Firestore는 undefined 저장 불가)
  Object.keys(newPost).forEach(key => {
    if (newPost[key] === undefined) {
      delete newPost[key];
    }
  });

  const docRef = await postsRef.add(newPost);
  // 새 글이 올라오면 popular 캐시 무효화 (전체 카테고리)
  invalidatePopularCache();
  return docRef.id;
}

export async function updatePost(
  postId: string,
  updates: {title?: string; text?: string; images?: string[]},
) {
  await postsRef.doc(postId).update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
  invalidatePopularCache();
}

export async function deletePost(postId: string) {
  await postsRef.doc(postId).delete();
  invalidatePopularCache();
}

export async function toggleLike(
  postId: string,
  userId: string,
  senderName?: string,
) {
  const postRef = postsRef.doc(postId);

  const liked = await firestore().runTransaction(async transaction => {
    const doc = await transaction.get(postRef);
    if (!doc.exists) return false;

    const data = doc.data()!;
    const likedBy: string[] = data.likedBy || [];
    const isLiked = likedBy.includes(userId);

    transaction.update(postRef, {
      likedBy: isLiked
        ? firestore.FieldValue.arrayRemove(userId)
        : firestore.FieldValue.arrayUnion(userId),
      likes: isLiked
        ? firestore.FieldValue.increment(-1)
        : firestore.FieldValue.increment(1),
    });

    // 좋아요 시 알림 생성 (좋아요 취소 시에는 안 보냄)
    if (!isLiked && data.userId) {
      createNotification({
        userId: data.userId,
        senderId: userId,
        senderName: senderName || '누군가',
        type: 'like',
        targetId: postId,
        message: `${senderName || '누군가'}님이 게시글을 좋아합니다.`,
      });
    }

    return !isLiked;
  });

  return liked;
}

export async function toggleSave(postId: string, userId: string) {
  const postRef = postsRef.doc(postId);

  return firestore().runTransaction(async transaction => {
    const doc = await transaction.get(postRef);
    if (!doc.exists) return;

    const data = doc.data()!;
    const savedBy: string[] = data.savedBy || [];
    const isSaved = savedBy.includes(userId);

    transaction.update(postRef, {
      savedBy: isSaved
        ? firestore.FieldValue.arrayRemove(userId)
        : firestore.FieldValue.arrayUnion(userId),
    });

    return !isSaved;
  });
}

export async function fetchPostsByAgeGroup(
  ageGroup: string,
  category?: string,
  lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
  limit = 20,
) {
  let query = postsRef.where('authorAgeGroup', '==', ageGroup) as FirebaseFirestoreTypes.Query;

  if (category && category !== '전체') {
    query = query.where('category', '==', category);
  }

  query = query.orderBy('timestamp', 'desc');

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  query = query.limit(limit);

  const snapshot = await query.get();
  const posts: Post[] = [];
  snapshot.forEach(doc => {
    posts.push({id: doc.id, ...doc.data()} as Post);
  });

  return {
    posts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === limit,
  };
}

export async function votePoll(postId: string, userId: string, optionIndex: number) {
  const postRef = postsRef.doc(postId);

  return firestore().runTransaction(async transaction => {
    const doc = await transaction.get(postRef);
    if (!doc.exists) return null;

    const data = doc.data()!;
    const poll = data.poll;
    if (!poll) return null;

    const votedBy: Record<string, number> = poll.votedBy || {};
    const votes: Record<string, number> = poll.votes || {};

    // 이미 투표한 경우
    if (votedBy[userId] !== undefined) return null;

    votedBy[userId] = optionIndex;
    votes[String(optionIndex)] = (votes[String(optionIndex)] || 0) + 1;

    transaction.update(postRef, {
      'poll.votedBy': votedBy,
      'poll.votes': votes,
      'poll.totalVotes': (poll.totalVotes || 0) + 1,
    });

    return optionIndex;
  });
}

// Comments are subcollection of posts
const commentsRef = (postId: string) =>
  postsRef.doc(postId).collection('comments');

export async function fetchComments(postId: string): Promise<Comment[]> {
  const snapshot = await commentsRef(postId)
    .orderBy('timestamp', 'asc')
    .get();

  // Fetch all replies subcollections in parallel instead of sequentially (N+1 fix)
  const comments = await Promise.all(
    snapshot.docs.map(async doc => {
      const data = doc.data();
      const repliesSnap = await doc.ref
        .collection('replies')
        .orderBy('timestamp', 'asc')
        .get();
      const replies: Reply[] = repliesSnap.docs.map(r => ({
        id: r.id,
        ...r.data(),
      })) as Reply[];

      return {
        id: doc.id,
        ...data,
        replies,
      } as Comment;
    }),
  );

  return comments;
}

export async function addComment(
  postId: string,
  comment: {
    user: string;
    userId: string;
    avatar: string;
    text: string;
    isAnonymous?: boolean;
    authorAgeGroup?: string;
  },
) {
  const batch = firestore().batch();

  const displayName = comment.isAnonymous ? '익명의 아빠' : comment.user;
  const displayAvatar = comment.isAnonymous ? '🧔' : comment.avatar;

  const data: Record<string, any> = {
    ...comment,
    user: displayName,
    avatar: displayAvatar,
    isAnonymous: comment.isAnonymous || false,
    timestamp: firestore.FieldValue.serverTimestamp(),
    likes: 0,
    likedBy: [],
  };
  // Firestore cannot store undefined values
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });

  const commentRef = commentsRef(postId).doc();
  batch.set(commentRef, data);

  // Increment comment count on post
  batch.update(postsRef.doc(postId), {
    commentCount: firestore.FieldValue.increment(1),
  });

  await batch.commit();

  // 게시글 작성자에게 알림
  try {
    const postDoc = await postsRef.doc(postId).get();
    const postData = postDoc.data();
    if (postData?.userId) {
      await createNotification({
        userId: postData.userId,
        senderId: comment.userId,
        senderName: displayName,
        type: 'comment',
        targetId: postId,
        message: `${displayName}님이 댓글을 남겼습니다: "${comment.text.slice(0, 30)}${comment.text.length > 30 ? '...' : ''}"`,
      });
    }
  } catch (error) {
    console.warn('Failed to send comment notification:', error);
  }

  return commentRef.id;
}

export async function deleteComment(postId: string, commentId: string) {
  const commentRef = commentsRef(postId).doc(commentId);

  // Delete replies subcollection first and count them for commentCount adjustment
  const repliesSnap = await commentRef.collection('replies').get();
  const replyCount = repliesSnap.size;

  const batch = firestore().batch();
  repliesSnap.docs.forEach(r => batch.delete(r.ref));
  batch.delete(commentRef);
  batch.update(postsRef.doc(postId), {
    commentCount: firestore.FieldValue.increment(-(1 + replyCount)),
  });
  await batch.commit();
}

export async function deleteReply(
  postId: string,
  commentId: string,
  replyId: string,
) {
  const batch = firestore().batch();
  batch.delete(
    commentsRef(postId).doc(commentId).collection('replies').doc(replyId),
  );
  batch.update(postsRef.doc(postId), {
    commentCount: firestore.FieldValue.increment(-1),
  });
  await batch.commit();
}

export async function addReply(
  postId: string,
  commentId: string,
  reply: {
    user: string;
    userId: string;
    avatar: string;
    text: string;
    isAnonymous?: boolean;
    authorAgeGroup?: string;
  },
) {
  const displayName = reply.isAnonymous ? '익명의 아빠' : reply.user;
  const displayAvatar = reply.isAnonymous ? '🧔' : reply.avatar;

  const data: Record<string, any> = {
    ...reply,
    user: displayName,
    avatar: displayAvatar,
    isAnonymous: reply.isAnonymous || false,
    timestamp: firestore.FieldValue.serverTimestamp(),
    likes: 0,
    likedBy: [],
  };
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) delete data[key];
  });

  await commentsRef(postId).doc(commentId).collection('replies').add(data);

  // Increment comment count
  await postsRef.doc(postId).update({
    commentCount: firestore.FieldValue.increment(1),
  });

  // 원댓글 작성자에게 알림
  try {
    const commentDoc = await commentsRef(postId).doc(commentId).get();
    const commentData = commentDoc.data();
    if (commentData?.userId) {
      await createNotification({
        userId: commentData.userId,
        senderId: reply.userId,
        senderName: displayName,
        type: 'reply',
        targetId: postId,
        message: `${displayName}님이 답글을 남겼습니다: "${reply.text.slice(0, 30)}${reply.text.length > 30 ? '...' : ''}"`,
      });
    }
  } catch (error) {
    console.warn('Failed to send reply notification:', error);
  }
}