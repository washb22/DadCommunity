import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StyleSheet} from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import BoardListScreen from '../screens/BoardListScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WritePostScreen from '../screens/WritePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

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
      <Text style={styles.tabEmoji}>{icons[label] || '📌'}</Text>
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
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="WritePost"
          component={WritePostScreen}
          options={{presentation: 'modal'}}
        />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#2D5BFF',
    fontWeight: '700',
  },
});
