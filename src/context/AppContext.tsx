import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  Post,
  Comment,
  ChatRoom,
  UserProfile,
  INITIAL_POSTS,
  INITIAL_CHATROOMS,
  INITIAL_USER,
} from '../data/mockData';
import {getUserProfile} from '../services/authService';
import {getBlockedUsers} from '../services/reportService';

// ─── Types ───
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'chat' | 'follow';
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  targetId?: string;
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

export type Action =
  | {type: 'LOGIN'; uid?: string}
  | {type: 'LOGOUT'}
  | {type: 'SET_USER'; user: UserProfile; uid: string}
  | {type: 'SET_POSTS'; posts: Post[]}
  | {type: 'SET_CHATROOMS'; chatRooms: ChatRoom[]}
  | {type: 'SET_NOTIFICATIONS'; notifications: Notification[]}
  | {type: 'SET_BLOCKED_USERS'; blockedUsers: string[]}
  | {type: 'SET_FIREBASE_READY'; ready: boolean}
  | {type: 'TOGGLE_LIKE'; postId: string}
  | {type: 'TOGGLE_SAVE'; postId: string}
  | {type: 'ADD_POST'; post: Post}
  | {type: 'UPDATE_POST'; postId: string; updates: {title?: string; text?: string}}
  | {type: 'DELETE_POST'; postId: string}
  | {type: 'SET_COMMENTS'; postId: string; comments: Comment[]}
  | {type: 'ADD_COMMENT'; postId: string; comment: Comment}
  | {type: 'ADD_REPLY'; postId: string; commentId: string; reply: Comment}
  | {type: 'TOGGLE_COMMENT_LIKE'; postId: string; commentId: string}
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
  notifications: [],
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
        posts: [],
        chatRooms: [],
        notifications: [],
      };

    case 'SET_USER':
      return {...state, user: action.user, uid: action.uid, isLoggedIn: true};

    case 'SET_POSTS':
      return {...state, posts: action.posts};

    case 'SET_CHATROOMS':
      return {...state, chatRooms: action.chatRooms};

    case 'SET_NOTIFICATIONS':
      return {...state, notifications: action.notifications};

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
      return {
        ...state,
        posts: [action.post, ...state.posts],
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
      return {...state, posts};
    }

    case 'SET_COMMENTS': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {...p, comments: action.comments};
        }
        return p;
      });
      return {...state, posts};
    }

    case 'ADD_COMMENT': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {
            ...p,
            comments: [...p.comments, action.comment],
            commentCount: (p.commentCount || p.comments.length) + 1,
          };
        }
        return p;
      });
      return {...state, posts};
    }

    case 'ADD_REPLY': {
      const posts = state.posts.map(p => {
        if (p.id === action.postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === action.commentId) {
                return {
                  ...c,
                  replies: [...c.replies, action.reply],
                };
              }
              return c;
            }),
            commentCount: (p.commentCount || p.comments.length) + 1,
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
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        // Reject anonymous users - force them to sign in with Google
        if (firebaseUser.isAnonymous) {
          try {
            await auth().signOut();
          } catch {}
          dispatch({type: 'SET_FIREBASE_READY', ready: true});
          return;
        }
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            dispatch({
              type: 'SET_USER',
              user: profile,
              uid: firebaseUser.uid,
            });
            // Load blocked users list
            getBlockedUsers(firebaseUser.uid)
              .then(blockedUsers => dispatch({type: 'SET_BLOCKED_USERS', blockedUsers}))
              .catch(() => {});
          } else {
            // User authenticated but no profile yet (first time)
            dispatch({type: 'LOGIN', uid: firebaseUser.uid});
          }
        } catch (error) {
          console.log('Firebase profile fetch error:', error);
          dispatch({type: 'LOGIN', uid: firebaseUser.uid});
        }
      } else {
        // No user signed in
        dispatch({type: 'SET_FIREBASE_READY', ready: true});
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
