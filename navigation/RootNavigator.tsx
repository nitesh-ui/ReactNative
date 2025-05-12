// navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './AppNavigator';
import LandingScreen from 'screens/LandinScreen';

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          await AsyncStorage.setItem('hasLaunched', 'true');
          setFirstLaunch(true);
        } else {
          setFirstLaunch(false);
        }
      } catch (err) {
        console.error('Error checking app launch status:', err);
        setFirstLaunch(false);
      } finally {
        setLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // return <AppNavigator initialRouteName={firstLaunch ? 'Landing' : 'Login'} />;
  return <AppNavigator initialRouteName="Landing" />;
}
