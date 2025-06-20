import React from 'react';
import { View, ImageBackground } from 'react-native';
import CoinLoader from './CoinLoader';

export default function LoadingScreen() {
  return (
    <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CoinLoader visible={true} />
      </View>
    </ImageBackground>
  );
}
