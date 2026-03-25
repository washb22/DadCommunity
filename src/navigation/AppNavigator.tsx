import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StyleSheet, BackHandler} from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  const icons: Record<string, string> = {
    홈: '🏠',
    게시판: '📋',
    채팅: '💬',
    마이: '👤',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {icons[label] || '📌'}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({focused}) => (
          <TabIcon label={route.name} focused={focused} />
        ),
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: -2},
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#BBB',
    marginTop: 3,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#2D5BFF',
    fontWeight: '700',
  },
});
