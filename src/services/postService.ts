import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Post, Comment, Reply, getRelativeTime} from '../data/mockData';

const postsRef = firestore().collection('posts');

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
      const score = (likes + comments * 2 + saves) / Math.pow(hoursAgo + 2, 1.5);
      return {id: doc.id, ...data, _score: score, _doc: doc};
    });
    scored.sort((a, b) => b._score - a._score);
    const sliced = scored.slice(0, limit);
    return {
      posts: sliced.map(({_score, _doc, ...rest}) => rest) as Post[],
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
}) {
  const newPost = {
    ...post,
    timestamp: firestore.FieldValue.serverTimestamp(),
    likes: 0,
    likedBy: [],
    savedBy: [],
    commentCount: 0,
    images: post.images || [],
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await postsRef.add(newPost);
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
}

export async function deletePost(postId: string) {
  await postsRef.doc(postId).delete();
}

export async function toggleLike(postId: string, userId: string) {
  const postRef = postsRef.doc(postId);

  return firestore().runTransaction(async transaction => {
    const doc = await transaction.get(postRef);
    if (!doc.exists) return;

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

    return !isLiked;
  });
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
  },
) {
  const batch = firestore().batch();

  const commentRef = commentsRef(postId).doc();
  batch.set(commentRef, {
    ...comment,
    timestamp: firestore.FieldValue.serverTimestamp(),
    likes: 0,
    likedBy: [],
  });

  // Increment comment count on post
  batch.update(postsRef.doc(postId), {
    commentCount: firestore.FieldValue.increment(1),
  });

  await batch.commit();
  return commentRef.id;
}

export async function addReply(
  postId: string,
  commentId: string,
  reply: {
    user: string;
    userId: string;
    avatar: string;
    text: string;
  },
) {
  await commentsRef(postId).doc(commentId).collection('replies').add({
    ...reply,
    timestamp: firestore.FieldValue.serverTimestamp(),
    likes: 0,
    likedBy: [],
  });

  // Increment comment count
  await postsRef.doc(postId).update({
    commentCount: firestore.FieldValue.increment(1),
  });
}

