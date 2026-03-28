export interface Post {
  id: string;
  user: string;
  avatar: string;
  time: string;
  timestamp: number;
  category: string;
  title: string;
  text: string;
  likes: number;
  comments: Comment[];
  isAnonymous: boolean;
  saved: boolean;
  liked: boolean;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  timestamp: number;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

export interface Reply {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  timestamp: number;
  likes: number;
  liked: boolean;
}

export interface ChatRoom {
  id: string;
  user: string;
  avatar: string;
  messages: ChatMessage[];
  unread: number;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  timestamp: number;
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
    icon: '🎮',
    iconBg: '#E8FFE0',
    name: '취미게시판',
    category: '취미',
    desc: '운동, 게임, 캠핑, 낚시 등',
    hasNew: false,
  },
  {
    id: '4',
    icon: '👶',
    iconBg: '#FFF3E0',
    name: '육아게시판',
    category: '육아',
    desc: '육아 고민, 팁, 경험 공유',
    hasNew: true,
  },
  {
    id: '5',
    icon: '💼',
    iconBg: '#E0E8FF',
    name: '직장생활',
    category: '직장생활',
    desc: '직장 고민, 커리어, 워라밸',
    hasNew: false,
  },
  {
    id: '6',
    icon: '💰',
    iconBg: '#FFFDE0',
    name: '재테크/부업',
    category: '재테크/부업',
    desc: '재테크, 부업, 투자 정보',
    hasNew: false,
  },
  {
    id: '7',
    icon: '💪',
    iconBg: '#E0FFE8',
    name: '건강/운동',
    category: '건강/운동',
    desc: '운동, 건강관리, 다이어트',
    hasNew: false,
  },
  {
    id: '8',
    icon: '🍳',
    iconBg: '#FFE8E0',
    name: '요리/집안일',
    category: '요리/집안일',
    desc: '요리, 집안일, 살림 팁',
    hasNew: false,
  },
  {
    id: '9',
    icon: '📢',
    iconBg: '#F0E0FF',
    name: '공지사항',
    category: '공지',
    desc: '앱 업데이트 및 안내',
    hasNew: false,
  },
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CHATROOMS: ChatRoom[] = [];

export const CATEGORIES = ['전체', '부부관계', '자유', '취미', '육아', '직장생활', '재테크/부업', '건강/운동', '요리/집안일'];
export const TABS = ['최신', '인기', '팔로잉'];

let nextPostId = 100;
export function getNextPostId() {
  return String(nextPostId++);
}

let nextCommentId = 100;
export function getNextCommentId() {
  return String('c' + nextCommentId++);
}

let nextMessageId = 100;
export function getNextMessageId() {
  return String('m' + nextMessageId++);
}

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
