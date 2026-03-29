export interface FirestoreTimestamp {
  toDate: () => Date;
}

export interface Post {
  id: string;
  user: string;
  avatar: string;
  time: string;
  timestamp: number | FirestoreTimestamp;
  category: string;
  title: string;
  text: string;
  likes: number;
  comments: Comment[];
  isAnonymous: boolean;
  saved: boolean;
  liked: boolean;
  likedBy?: string[];
  savedBy?: string[];
  userId?: string;
  commentCount?: number;
  images?: string[];
  tags?: string[];
  shareCount?: number;
  authorAgeGroup?: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  timestamp: number | FirestoreTimestamp;
  likes: number;
  liked: boolean;
  likedBy: string[];
  userId: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  timestamp: number | FirestoreTimestamp;
  likes: number;
  liked: boolean;
  likedBy: string[];
  userId: string;
}

export interface ChatRoom {
  id: string;
  user: string;
  avatar: string;
  messages: ChatMessage[];
  unread: number;
  // Firestore fields
  members: string[];
  memberInfo: Record<string, {nickname: string; avatar: string}>;
  lastMessage: string;
  lastMessageAt: FirestoreTimestamp | number;
  unreadCount: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  timestamp: number | FirestoreTimestamp;
  // Firestore fields
  senderId: string;
  createdAt: FirestoreTimestamp | number;
  read: boolean;
}

export interface Board {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  category: string;
  desc: string;
  hasNew: boolean;
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  bio: string;
  postCount: number;
  likeCount: number;
  saveCount: number;
  childAgeGroup?: string;
  interests?: string[];
}

export const INITIAL_USER: UserProfile = {
  nickname: '',
  avatar: '🧔',
  bio: '',
  postCount: 0,
  likeCount: 0,
  saveCount: 0,
};

export const BOARDS: Board[] = [
  {
    id: '1',
    icon: '💑',
    iconBg: '#FFE0E0',
    name: '부부관계',
    category: '부부관계',
    desc: '아내와의 관계, 소통, 갈등 해결',
    hasNew: true,
  },
  {
    id: '2',
    icon: '📝',
    iconBg: '#E0F0FF',
    name: '자유게시판',
    category: '자유',
    desc: '자유롭게 이야기 나눠요',
    hasNew: true,
  },
  {
    id: '3',
    icon: '👶',
    iconBg: '#FFF3E0',
    name: '육아게시판',
    category: '육아',
    desc: '육아 고민, 팁, 경험 공유',
    hasNew: true,
  },
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CHATROOMS: ChatRoom[] = [];

export const CATEGORIES = ['전체', '부부관계', '자유', '육아'];
export const TABS = ['인기', '최신', '팔로잉'];

export function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
