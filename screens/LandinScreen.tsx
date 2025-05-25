// screens/LandingScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, Platform, ImageBackground } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import GradientButton from '../components/GradientButton';

export default function LandingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // sizing
  const screenWidth = Dimensions.get('window').width;
  const coinSize = screenWidth * 0.6;
  const smallSize = coinSize * 0.15;
  const smallGap = smallSize * 0.1;

  // coin assets
  const assets = [
    require('../assets/in-head.png'),
    require('../assets/us-head.png'),
    require('../assets/ch-head.png'),
    require('../assets/jp-head.png'),
  ];

  // rotate coins array
  const [coins, setCoins] = useState(assets);
  useEffect(() => {
    const iv = setInterval(() => {
      setCoins((c) => [...c.slice(1), c[0]]);
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // position of the 3 small coins
  const rowWidth = smallSize * 3 + smallGap * 2;
  const offset = coinSize * 0.95;
  const rowLeft = offset - rowWidth / 4.5;
  const rowTop = offset - smallSize;

  return (
    <ImageBackground style={styles.container} source={require('../assets/bg1.jpg')}>
      {/* Title */}
      <View style={styles.centered}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700, easing: Easing.inOut(Easing.ease) }}>
          <Text style={[styles.title, { color: colors.text }]}>Flip To Win</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300, duration: 600, easing: Easing.inOut(Easing.ease) }}
          style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>FLIP</Text>
          <Text style={styles.subtitleDot}>|</Text>
          <Text style={styles.subtitleText}>EARN</Text>
          <Text style={styles.subtitleDot}>|</Text>
          <Text style={styles.subtitleText}>REPEAT</Text>
        </MotiView>
      </View>

      {/* Coin + Loader */}
      <View style={[styles.coinWrapper, { width: coinSize, height: coinSize }]}>
        {/* Big coin */}
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={coins[0].toString()}
            from={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { type: 'timing', duration: 400, easing: Easing.inOut(Easing.ease) },
              scale: {
                type: 'timing',
                duration: 2000,
                loop: true,
                easing: Easing.inOut(Easing.ease),
              },
            }}
            style={StyleSheet.absoluteFill}>
            <Image
              source={coins[0]}
              style={{ width: coinSize, height: coinSize }}
              resizeMode="contain"
            />
          </MotiView>
        </AnimatePresence>

        {/* Three small coins */}
        <View
          style={{
            position: 'absolute',
            left: rowLeft,
            top: rowTop,
            flexDirection: 'row',
          }}>
          {coins.slice(1).map((src, i) => (
            <MotiView
              key={`${src}-${i}`}
              from={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{
                type: 'timing',
                duration: 2000,
                loop: true,
                delay: i * 200,
                easing: Easing.inOut(Easing.ease),
              }}
              style={{
                width: smallSize,
                height: smallSize,
                borderRadius: smallSize / 2,
                overflow: 'hidden',
                marginLeft: i === 0 ? 0 : smallGap,
              }}>
              <Image
                source={src}
                style={{ width: smallSize, height: smallSize }}
                resizeMode="contain"
              />
            </MotiView>
          ))}
        </View>
      </View>

      {/* Action */}
      <GradientButton onPress={() => navigation.navigate('Login')}>
        Let’s get started
      </GradientButton>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  centered: { alignItems: 'center' },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fcd34d33',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  subtitleText: {
    fontWeight: '700',
    color: '#fcd34d',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  subtitleDot: {
    fontWeight: '700',
    color: '#fcd34d',
    marginHorizontal: 6,
    fontSize: 12,
  },
  coinWrapper: {
    alignSelf: 'center',
    position: 'relative',
  },
});
