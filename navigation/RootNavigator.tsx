// navigation/RootNavigator.tsx
import React, { useContext } from 'react';
import AppNavigator from './AppNavigator';
import LandingScreen from 'screens/LandinScreen';
import { AuthContext } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function RootNavigator() {
  const { loading, userToken, firstLaunch } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, go to HomeScreen, otherwise show Landing or Login
  return (
    <AppNavigator initialRouteName={userToken ? 'HomeScreen' : firstLaunch ? 'Landing' : 'Login'} />
  );
}
