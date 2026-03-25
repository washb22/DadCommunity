import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import auth from '@react-native-firebase/auth';
import {
  Post,
  Comment,
  ChatRoom,
  UserProfile,
  INITIAL_POSTS,
  INITIAL_CHATROOMS,
  INITIAL_USER,
  getNextPostId,
  getNextCommentId,
  getNextMessageId,
} from '../data/mockData';
import {getUserProfile} from '../services/authService';

// ─── Types ───
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'chat';
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
}

export interface AppState {
  posts: Post[];
  chatRooms: ChatRoom[];
  user: UserProfile;
  isLoggedIn: boolean;
  uid: string | null;
  notifications: Notification[];
  blockedUsers: string[];
  isFirebaseReady: boolean;
}

type Action =
  | {type: 'LOGIN'; uid?: string}
  | {type: 'LOGOUT'}
  | {type: 'SET_USER'; user: UserProfile; uid: string}
  | {type: 'SET_POSTS'; posts: Post[]}
  | {type: 'SET_CHATROOMS'; chatRooms: ChatRoom[]}
  | {type: 'SET_BLOCKED_USERS'; blockedUsers: string[]}
  | {type: 'SET_FIREBASE_READY'; ready: boolean}
  | {type: 'TOGGLE_LIKE'; postId: string}
  | {type: 'TOGGLE_SAVE'; postId: string}
  | {
      type: 'ADD_POST';
      post: Omit<
        Post,
        'id' | 'time' | 'timestamp' | 'likes' | 'comments' | 'saved' | 'liked'
      >;
    }
  | {type: 'UPDATE_POST'; postId: string; updates: {title?: string; text?: string}}
  | {type: 'DELETE_POST'; postId: string}
  | {type: 'ADD_COMMENT'; postId: string; text: string}
  | {type: 'ADD_REPLY'; postId: string; commentId: string; text: string}
  | {type: 'TOGGLE_COMMENT_LIKE'; postId: string; commentId: string}
  | {type: 'SEND_MESSAGE'; chatRoomId: string; text: string}
  | {type: 'MARK_CHAT_READ'; chatRoomId: string}
  | {type: 'UPDATE_PROFILE'; updates: Partial<UserProfile>}
  | {type: 'MARK_NOTIFICATION_READ'; notificationId: string}
  | {type: 'BLOCK_USER'; userId: string}
  | {type: 'UNBLOCK_USER'; userId: string};

const initialState: AppState = {
  posts: INITIAL_POSTS,
  chatRooms: INITIAL_CHATROOMS,
  user: INITIAL_USER,
  isLoggedIn: false,
  uid: null,
  notifications: [
    {
      id: 'n1',
      type: 'like',
      message: '세아이아빠님이 회원님의 글에 좋아요를 눌렀습니다.',
      time: '10분 전',
      timestamp: Date.now() - 10 * 60 * 1000,
      read: false,
    },
    {
      id: 'n2',
      type: 'comment',
      message: '캠핑매니아님이 댓글을 달았습니다: "가평 쪽에 좋은 캠핑장 있어요!"',
      time: '1시간 전',
      timestamp: Date.now() - 60 * 60 * 1000,
      read: false,
    },
    {
      id: 'n3',
      type: 'chat',
      message: '육아전문가아빠님이 메시지를 보냈습니다.',
      time: '3시간 전',
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
      read: true,
    },
  ],
  blockedUsers: [],
  isFirebaseReady: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {...state, isLoggedIn: true, uid: action.uid || null};

    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        uid: null,
        user: INITIAL_USER,
      };

    case 'SET_USER':
      return {...state, user: action.user, uid: action.uid, isLoggedIn: true};

    case 'SET_POSTS':
      return {...state, posts: action.posts};

    case 'SET_CHATROOMS':
      return {...state, chatRooms: action.chatRooms};

    case 'SET_BLOCKED_USERS':
      return {...state, blockedUsers: action.blockedUsers};

    case 'SET_FIREBASE_READY':
      return {...state, isFirebaseReady: action.ready};

    case 'TOGGLE_LIKE': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      });
      return {...state, posts};
    }

    case 'TOGGLE_SAVE': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {...p, saved: !p.saved};
        }
        return p;
      });
      return {...state, posts};
    }

    case 'ADD_POST': {
      const now = Date.now();
      const newPost: Post = {
        ...action.post,
        id: getNextPostId(),
        time: '방금',
        timestamp: now,
        likes: 0,
        comments: [],
        saved: false,
        liked: false,
      };
      return {
        ...state,
        posts: [newPost, ...state.posts],
        user: {...state.user, postCount: state.user.postCount + 1},
      };
    }

    case 'UPDATE_POST': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {...p, ...action.updates};
        }
        return p;
      });
      return {...state, posts};
    }

    case 'DELETE_POST': {
      const posts = state.posts.filter(p => p.id !== action.postId);
      return {
        ...state,
        posts,
        user: {...state.user, postCount: Math.max(0, state.user.postCount - 1)},
      };
    }

    case 'ADD_COMMENT': {
      const now = Date.now();
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: getNextCommentId(),
                user: state.user.nickname,
                avatar: state.user.avatar,
                text: action.text,
                time: '방금',
                timestamp: now,
                likes: 0,
                liked: false,
                replies: [],
              },
            ],
          };
        }
        return p;
      });
      return {...state, posts};
    }

    case 'ADD_REPLY': {
      const now = Date.now();
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === action.commentId) {
                return {
                  ...c,
                  replies: [
                    ...c.replies,
                    {
                      id: getNextCommentId(),
                      user: state.user.nickname,
                      avatar: state.user.avatar,
                      text: action.text,
                      time: '방금',
                      timestamp: now,
                      likes: 0,
                      liked: false,
                    },
                  ],
                };
              }
              return c;
            }),
          };
        }
        return p;
      });
      return {...state, posts};
    }

    case 'TOGGLE_COMMENT_LIKE': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === action.commentId) {
                return {
                  ...c,
                  liked: !c.liked,
                  likes: c.liked ? c.likes - 1 : c.likes + 1,
                };
              }
              return c;
            }),
          };
        }
        return p;
      });
      return {...state, posts};
    }

    case 'SEND_MESSAGE': {
      const now = Date.now();
      const chatRooms = state.chatRooms.map(cr => {
        if (cr.id === action.chatRoomId) {
          return {
            ...cr,
            messages: [
              ...cr.messages,
              {
                id: getNextMessageId(),
                sender: 'me' as const,
                text: action.text,
                time: '방금',
                timestamp: now,
              },
            ],
          };
        }
        return cr;
      });
      return {...state, chatRooms};
    }

    case 'MARK_CHAT_READ': {
      const chatRooms = state.chatRooms.map(cr => {
        if (cr.id === action.chatRoomId) {
          return {...cr, unread: 0};
        }
        return cr;
      });
      return {...state, chatRooms};
    }

    case 'UPDATE_PROFILE':
      return {...state, user: {...state.user, ...action.updates}};

    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n => {
        if (n.id === action.notificationId) {
          return {...n, read: true};
        }
        return n;
      });
      return {...state, notifications};
    }

    case 'BLOCK_USER':
      return {
        ...state,
        blockedUsers: [...state.blockedUsers, action.userId],
      };

    case 'UNBLOCK_USER':
      return {
        ...state,
        blockedUsers: state.blockedUsers.filter(id => id !== action.userId),
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({state: initialState, dispatch: () => {}});

export function AppProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            dispatch({
              type: 'SET_USER',
              user: profile,
              uid: firebaseUser.uid,
            });
          }
        } catch (error) {
          // Firebase not configured yet — use mock data
          console.log('Firebase not ready, using mock data');
        }
      }
      dispatch({type: 'SET_FIREBASE_READY', ready: true});
    });

    return unsubscribe;
  }, []);

  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export type {AppState};
