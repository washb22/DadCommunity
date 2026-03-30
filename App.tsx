import React, {useEffect} from 'react';
import {LogBox, StatusBar} from 'react-native';

if (!__DEV__) {
  LogBox.ignoreAllLogs();
}
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ThemeProvider, useTheme} from './src/theme';
import {AppProvider} from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import {setupNotifications} from './src/services/notificationService';

function ThemedStatusBar() {
  const theme = useTheme();
  
  return (
    <StatusBar
      barStyle={theme.isDark ? 'light-content' : 'dark-content'}
      backgroundColor="transparent"
      translucent
    />
  );
}

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <ThemedStatusBar />
            <AppNavigator />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
