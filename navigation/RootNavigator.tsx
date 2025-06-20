// navigation/RootNavigator.tsx
import React, { useContext, useEffect } from 'react';
import AppNavigator from './AppNavigator';
import LandingScreen from 'screens/LandinScreen';
import { AuthContext } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import type { RootStackParamList } from './AppNavigator';

export default function RootNavigator() {
  const { loading, userToken, firstLaunch } = useContext(AuthContext);

  // Debug log the state
  useEffect(() => {
    console.log('Auth State:', { loading, userToken, firstLaunch });
  }, [loading, userToken, firstLaunch]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Determine initial route:
  // - If loading: show loading screen
  // - If has token: go to HomeScreen
  // - If first launch or no token: show Landing
  let initialRoute: keyof RootStackParamList = 'Login';
  if (userToken) {
    initialRoute = 'HomeScreen';
  } else if (firstLaunch) {
    initialRoute = 'Landing';
  }

  console.log('Selected initial route:', initialRoute);

  return <AppNavigator initialRouteName={initialRoute} />;
}
