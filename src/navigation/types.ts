import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps, NavigatorScreenParams} from '@react-navigation/native';

export type MainTabParamList = {
  '홈': undefined;
  '게시판': undefined;
  '채팅': undefined;
  '마이': undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  WritePost: {
    editMode?: boolean;
    postId?: string;
    initialTitle?: string;
    initialContent?: string;
    initialCategory?: string;
  } | undefined;
  PostDetail: {postId: string};
  BoardDetail: {boardName: string; category: string};
  ChatDetail: {chatRoomId: string};
  Search: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  MyPosts: undefined;
  MyComments: undefined;
  SavedPosts: undefined;
  BlockList: undefined;
  NotificationSettings: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  Contact: undefined;
};

// Stack screen props
export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type WritePostScreenProps = NativeStackScreenProps<RootStackParamList, 'WritePost'>;
export type PostDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;
export type BoardDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'BoardDetail'>;
export type ChatDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
export type NotificationScreenProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;
export type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
export type MyPostsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyPosts'>;
export type MyCommentsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyComments'>;
export type SavedPostsScreenProps = NativeStackScreenProps<RootStackParamList, 'SavedPosts'>;
export type BlockListScreenProps = NativeStackScreenProps<RootStackParamList, 'BlockList'>;
export type NotificationSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'NotificationSettings'>;
export type TermsScreenProps = NativeStackScreenProps<RootStackParamList, 'Terms'>;
export type PrivacyPolicyScreenProps = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;
export type ContactScreenProps = NativeStackScreenProps<RootStackParamList, 'Contact'>;

// Tab screen props (composite with stack)
export type HomeFeedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, '홈'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type BoardListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, '게시판'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type ChatListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, '채팅'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, '마이'>,
  NativeStackScreenProps<RootStackParamList>
>;
