import React from 'react';
import { View, StyleSheet, Image, Dimensions, Text } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';

const { width, height } = Dimensions.get('window');

export interface CoinLoaderProps {
  visible: boolean;
}

export default function CoinLoader({ visible }: CoinLoaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <View style={styles.overlay} pointerEvents="auto">
          <MotiView
            from={{ scale: 0.8, rotate: '0deg', opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: ['360deg', '360deg', '360deg'],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1000,
              loop: true,
              repeatReverse: false,
              type: 'timing',
              delay: 0,
            }}
            style={styles.coinContainer}>
            <Image
              source={require('../assets/head.png')}
              style={styles.coin}
              resizeMode="contain"
            />
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  coinContainer: {
    width: 100,
    height: 100,
    borderRadius: 60,
    // backgroundColor: '#FFD700',
    borderColor: 'rgba(255,215,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    marginBottom: 16,
  },
  coin: {
    width: 300,
    height: 300,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
