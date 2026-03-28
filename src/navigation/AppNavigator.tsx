import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StyleSheet, BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme, Theme} from '../theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import BoardListScreen from '../screens/BoardListScreen';
import BoardDetailScreen from '../screens/BoardDetailScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WritePostScreen from '../screens/WritePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyPostsScreen from '../screens/MyPostsScreen';
import MyCommentsScreen from '../screens/MyCommentsScreen';
import SavedPostsScreen from '../screens/SavedPostsScreen';
import BlockListScreen from '../screens/BlockListScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactScreen from '../screens/ContactScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, {focused: string; unfocused: string}> = {
  '\uD648': {focused: 'home', unfocused: 'home-outline'},
  '\uAC8C\uC2DC\uD310': {focused: 'clipboard', unfocused: 'clipboard-outline'},
  '\uCC44\uD305': {focused: 'chatbubbles', unfocused: 'chatbubbles-outline'},
  '\uB9C8\uC774': {focused: 'person', unfocused: 'person-outline'},
};

function MainTabs() {
  const theme = useTheme();
  const s = makeStyles(theme);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: s.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: s.tabLabel,
        tabBarIcon: ({focused, color, size}) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons?.focused : icons?.unfocused;
          return <Icon name={iconName || 'ellipse-outline'} size={24} color={color} />;
        },
      })}>
      <Tab.Screen name="홈" component={HomeFeedScreen} />
      <Tab.Screen name="게시판" component={BoardListScreen} />
      <Tab.Screen name="채팅" component={ChatListScreen} />
      <Tab.Screen name="마이" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="WritePost"
          component={WritePostScreen}
          options={{animation: 'slide_from_bottom'}}
        />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{animation: 'slide_from_bottom'}}
        />
        <Stack.Screen name="MyPosts" component={MyPostsScreen} />
        <Stack.Screen name="MyComments" component={MyCommentsScreen} />
        <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
        <Stack.Screen name="BlockList" component={BlockListScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    tabBar: {
      height: 68,
      paddingBottom: 10,
      paddingTop: 10,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      ...theme.shadows.level2,
    },
    tabLabel: {
      ...theme.typography.overline,
      marginTop: theme.spacing.xs,
    },
  });
