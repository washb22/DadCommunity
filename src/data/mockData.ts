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
  nickname: '두아이아빠',
  avatar: '🧔',
  bio: '5살, 3살 아빠 | 캠핑 좋아합니다',
  postCount: 23,
  likeCount: 156,
  saveCount: 12,
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
    icon: '📢',
    iconBg: '#F0E0FF',
    name: '공지사항',
    category: '공지',
    desc: '앱 업데이트 및 안내',
    hasNew: false,
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    user: '익명의 아빠',
    avatar: '🧔',
    time: '5분 전',
    timestamp: Date.now() - 5 * 60 * 1000,
    category: '부부관계',
    title: '아내가 힘들어할 때',
    text: '아내가 요즘 너무 힘들어하는데 어떻게 도와줘야 할지 모르겠어요. 비슷한 경험 있으신 분?',
    likes: 12,
    comments: [
      {
        id: 'c1',
        user: '세아이아빠',
        avatar: '👨',
        text: '저도 같은 경험이 있어요. 가장 중요한 건 그냥 옆에서 들어주는 거예요. 해결책을 제시하려 하지 말고요.',
        time: '3분 전',
        timestamp: Date.now() - 3 * 60 * 1000,
        likes: 5,
        liked: false,
        replies: [],
      },
      {
        id: 'c2',
        user: '익명의 아빠',
        avatar: '🧔',
        text: '집안일을 좀 더 분담해보시는 건 어떨까요? 저는 그렇게 하니까 아내 표정이 확 밝아지더라고요.',
        time: '10분 전',
        timestamp: Date.now() - 10 * 60 * 1000,
        likes: 8,
        liked: false,
        replies: [],
      },
      {
        id: 'c3',
        user: '육아전문가아빠',
        avatar: '👴',
        text: '부부 상담도 좋은 방법입니다. 전문가의 도움을 받으면 서로의 마음을 더 잘 이해할 수 있어요.',
        time: '25분 전',
        timestamp: Date.now() - 25 * 60 * 1000,
        likes: 3,
        liked: false,
        replies: [],
      },
    ],
    isAnonymous: true,
    saved: false,
    liked: false,
  },
  {
    id: '2',
    user: '두아이아빠',
    avatar: '👨',
    time: '23분 전',
    timestamp: Date.now() - 23 * 60 * 1000,
    category: '자유',
    title: '재롱잔치 다녀왔어요',
    text: '오늘 아이 재롱잔치 다녀왔는데 눈물이 나더라고요 ㅎㅎ 다들 이런 경험 있으시죠?',
    likes: 34,
    comments: [
      {
        id: 'c4',
        user: '신혼아빠',
        avatar: '👶',
        text: '우리 아이도 곧인데 벌써부터 설레네요!',
        time: '15분 전',
        timestamp: Date.now() - 15 * 60 * 1000,
        likes: 2,
        liked: false,
        replies: [],
      },
    ],
    isAnonymous: false,
    saved: false,
    liked: false,
  },
  {
    id: '3',
    user: '캠핑매니아',
    avatar: '🏕️',
    time: '1시간 전',
    timestamp: Date.now() - 60 * 60 * 1000,
    category: '취미',
    title: '주말 캠핑장 추천',
    text: '이번 주말 아이랑 캠핑 가려는데 추천 캠핑장 있으신가요? 경기도 근처면 좋겠습니다.',
    likes: 8,
    comments: [
      {
        id: 'c5',
        user: '캠핑고수',
        avatar: '⛺',
        text: '가평 자라섬 캠핑장 추천합니다! 아이들 놀거리도 많아요.',
        time: '30분 전',
        timestamp: Date.now() - 30 * 60 * 1000,
        likes: 6,
        liked: false,
        replies: [],
      },
      {
        id: 'c6',
        user: '주말아빠',
        avatar: '🧑',
        text: '포천 쪽에 좋은 곳 많아요. 산정호수 근처 캠핑장도 괜찮습니다.',
        time: '45분 전',
        timestamp: Date.now() - 45 * 60 * 1000,
        likes: 4,
        liked: false,
        replies: [],
      },
    ],
    isAnonymous: false,
    saved: false,
    liked: false,
  },
  {
    id: '4',
    user: '익명의 아빠',
    avatar: '🧔',
    time: '2시간 전',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    category: '부부관계',
    title: '장인어른 간섭',
    text: '장인어른이 자꾸 육아에 간섭하시는데... 아내한테 말하기도 애매하고 어떻게 해야 할까요?',
    likes: 45,
    comments: [],
    isAnonymous: true,
    saved: false,
    liked: false,
  },
  {
    id: '5',
    user: '신혼아빠',
    avatar: '👶',
    time: '3시간 전',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    category: '육아',
    title: '신생아 밤잠',
    text: '첫째가 태어난 지 한 달 됐는데 밤잠을 못 자니까 회사에서 너무 힘드네요. 다들 어떻게 버티셨어요?',
    likes: 67,
    comments: [
      {
        id: 'c7',
        user: '세아이아빠',
        avatar: '👨',
        text: '교대로 돌보는 게 제일 중요해요. 아내와 시간 나눠서 하세요.',
        time: '2시간 전',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        likes: 12,
        liked: false,
        replies: [],
      },
      {
        id: 'c8',
        user: '경력10년아빠',
        avatar: '👨‍🦳',
        text: '3개월 지나면 조금씩 나아집니다. 지금이 가장 힘든 시기예요. 힘내세요!',
        time: '2시간 전',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        likes: 18,
        liked: false,
        replies: [],
      },
    ],
    isAnonymous: false,
    saved: false,
    liked: false,
  },
  {
    id: '6',
    user: '운동아빠',
    avatar: '💪',
    time: '4시간 전',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    category: '취미',
    title: '아침 운동 루틴',
    text: '아이 등원 전에 새벽 5시에 일어나서 운동하는데 확실히 하루가 달라지네요. 아빠들도 건강 챙기세요!',
    likes: 89,
    comments: [],
    isAnonymous: false,
    saved: false,
    liked: false,
  },
  {
    id: '7',
    user: '요리아빠',
    avatar: '👨‍🍳',
    time: '5시간 전',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    category: '자유',
    title: '아이 도시락 만들기',
    text: '오늘 처음으로 아이 유치원 도시락을 만들어봤는데 생각보다 재밌네요! 김밥이랑 과일 도시락으로 했는데 다 먹고 왔대요 ㅎㅎ',
    likes: 52,
    comments: [],
    isAnonymous: false,
    saved: false,
    liked: false,
  },
];

export const INITIAL_CHATROOMS: ChatRoom[] = [
  {
    id: '1',
    user: '세아이아빠',
    avatar: '👨',
    unread: 2,
    messages: [
      {
        id: 'm1',
        sender: 'other',
        text: '안녕하세요! 게시글 보고 연락드려요',
        time: '어제',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
      },
      {
        id: 'm2',
        sender: 'me',
        text: '아 네 반갑습니다!',
        time: '어제',
        timestamp: Date.now() - 23 * 60 * 60 * 1000,
      },
      {
        id: 'm3',
        sender: 'other',
        text: '저도 비슷한 상황이라 공감이 많이 됐어요',
        time: '오늘',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        id: 'm4',
        sender: 'other',
        text: '네 맞아요, 저도 그때 많이 힘들었어요',
        time: '방금',
        timestamp: Date.now() - 60 * 1000,
      },
    ],
  },
  {
    id: '2',
    user: '캠핑매니아',
    avatar: '🏕️',
    unread: 0,
    messages: [
      {
        id: 'm5',
        sender: 'me',
        text: '캠핑장 추천 감사합니다!',
        time: '1시간 전',
        timestamp: Date.now() - 60 * 60 * 1000,
      },
      {
        id: 'm6',
        sender: 'other',
        text: '가평 쪽에 좋은 캠핑장 있어요!',
        time: '30분 전',
        timestamp: Date.now() - 30 * 60 * 1000,
      },
    ],
  },
  {
    id: '3',
    user: '육아전문가아빠',
    avatar: '👴',
    unread: 0,
    messages: [
      {
        id: 'm7',
        sender: 'other',
        text: '그 책 정말 추천합니다',
        time: '3시간 전',
        timestamp: Date.now() - 3 * 60 * 60 * 1000,
      },
    ],
  },
];

export const CATEGORIES = ['전체', '부부관계', '자유', '취미', '육아'];
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
