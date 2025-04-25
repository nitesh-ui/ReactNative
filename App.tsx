import 'react-native-reanimated';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTheme } from './theme';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import Login from './screens/Login';
import { BalanceProvider } from 'context/BalanceContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <BalanceProvider>
        <PaperProvider theme={AppTheme}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </BalanceProvider>
    </SafeAreaProvider>
  );
}
