import 'react-native-reanimated';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTheme } from './theme';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import Login from './screens/Login';
import { BalanceProvider } from 'context/BalanceContext';
import RootNavigator from 'navigation/RootNavigator';
import { AuthProvider } from 'context/AuthContext';
import { SoundProvider } from 'context/SoundContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BalanceProvider>
          <PaperProvider theme={AppTheme}>
            <SoundProvider>
              <NavigationContainer>
                {/* <AppNavigator /> */}
                <RootNavigator />
              </NavigationContainer>
            </SoundProvider>
          </PaperProvider>
        </BalanceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
