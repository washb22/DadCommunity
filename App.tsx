import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppProvider} from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import {setupNotifications} from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar barStyle="light-content" backgroundColor="#2D5BFF" />
          <AppNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
