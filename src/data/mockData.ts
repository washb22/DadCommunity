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
  empathized: boolean;
  empathyCount: number;
  empathizedBy?: string[];
  authorAgeGroup?: string;
  poll?: {
    options: string[];
    votes: Record<string, number>;   // {optionIndex: voteCount}
    votedBy: Record<string, number>; // {userId: optionIndex}
    totalVotes: number;
  };
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
  ionicon: string;
  iconBg: string;
  name: string;
  category: string;
  desc: string;
  hasNew: boolean;
  visible: boolean;
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
    ionicon: 'heart-outline',
    iconBg: '#FFE0E0',
    name: '부부관계',
    category: '부부관계',
    desc: '아내와의 관계, 소통, 갈등 해결',
    hasNew: true,
    visible: true,
  },
  {
    id: '2',
    icon: '📝',
    ionicon: 'chatbubbles-outline',
    iconBg: '#E0F0FF',
    name: '자유게시판',
    category: '자유',
    desc: '자유롭게 이야기 나눠요',
    hasNew: true,
    visible: true,
  },
  {
    id: '3',
    icon: '👶',
    ionicon: 'people-outline',
    iconBg: '#FFF3E0',
    name: '육아게시판',
    category: '육아',
    desc: '육아 고민, 팁, 경험 공유',
    hasNew: true,
    visible: true,
  },
  {
    id: '4',
    icon: '💼',
    ionicon: 'briefcase-outline',
    iconBg: '#E8E0F0',
    name: '직장생활',
    category: '직장생활',
    desc: '직장인 아빠들의 이야기',
    hasNew: false,
    visible: false,
  },
  {
    id: '5',
    icon: '📈',
    ionicon: 'trending-up-outline',
    iconBg: '#E0F0F0',
    name: '재테크/부업',
    category: '재테크/부업',
    desc: '투자, 저축, 부업 정보 공유',
    hasNew: true,
    visible: false,
  },
  {
    id: '6',
    icon: '💪',
    ionicon: 'fitness-outline',
    iconBg: '#F0E8E0',
    name: '건강/운동',
    category: '건강/운동',
    desc: '운동 루틴, 건강 관리 팁',
    hasNew: false,
    visible: false,
  },
  {
    id: '7',
    icon: '🍳',
    ionicon: 'restaurant-outline',
    iconBg: '#E0E8F0',
    name: '요리/집안일',
    category: '요리/집안일',
    desc: '요리 레시피, 집안일 팁',
    hasNew: false,
    visible: false,
  },
  {
    id: '8',
    icon: '🎮',
    ionicon: 'game-controller-outline',
    iconBg: '#F0F0E0',
    name: '취미게시판',
    category: '취미',
    desc: '캠핑, 게임, 독서, 음악 등',
    hasNew: false,
    visible: false,
  },
  {
    id: '9',
    icon: '📢',
    ionicon: 'megaphone-outline',
    iconBg: '#F0E0E0',
    name: '공지사항',
    category: 'notice',
    desc: '서비스 소식과 업데이트',
    hasNew: true,
    visible: false,
  },
  {
    id: 'counseling',
    icon: '💬',
    ionicon: 'chatbubble-ellipses-outline',
    iconBg: '#E0E0F0',
    name: '고민상담',
    category: '고민상담',
    desc: '아빠들의 솔직한 고민을 나누는 공간',
    hasNew: true,
    visible: false,
  },
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CHATROOMS: ChatRoom[] = [];

export const ALL_CATEGORIES = ['전체', '부부관계', '자유', '육아', '직장생활', '재테크/부업', '건강/운동', '요리/집안일', '취미', '고민상담'];
export const CATEGORIES = ['전체', '부부관계', '자유', '육아'];
export const TABS = ['인기', '최신', '팔로잉', '또래 아빠'];
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
