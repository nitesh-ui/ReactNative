// screens/LandingScreen2.tsx
import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import GradientButton from '../components/GradientButton';

export default function LandingScreen2() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  const coinSize = screenWidth * 0.6; // 60% width

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatePresence>
        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700 }}
          style={styles.centered}>
          <Text style={[styles.title, { color: colors.text }]}>Flip To Win</Text>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 300, duration: 600 }}
            style={styles.subtitleContainer}>
            <Text style={styles.subtitleText}>FLIP</Text>
            <Text style={styles.subtitleDot}>|</Text>
            <Text style={styles.subtitleText}>EARN</Text>
            <Text style={styles.subtitleDot}>|</Text>
            <Text style={styles.subtitleText}>REPEAT</Text>
          </MotiView>
        </MotiView>

        {/* 3D Pulsating Coin */}
        <MotiView
          from={{ scale: 1, rotateX: '0deg', rotateY: '0deg', opacity: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            rotateX: ['0deg', '15deg', '0deg'],
            rotateY: ['0deg', '15deg', '0deg'],
            opacity: 1,
          }}
          transition={{
            repeat: Infinity,
            type: 'timing',
            duration: 2000,
            loop: true,
          }}
          style={[styles.coinContainer, { width: coinSize, height: coinSize }]}>
          <Image
            source={require('../assets/head.png')}
            style={{ width: coinSize, height: coinSize }}
            resizeMode="contain"
          />
        </MotiView>

        {/* Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 1000, duration: 600 }}
          style={styles.buttonsContainer}>
          <GradientButton onPress={() => navigation.navigate('Register')}>Sign Up</GradientButton>

          <View style={styles.loginLink}>
            <Text style={{ color: '#fff', opacity: 0.8 }}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Log In</Text>
            </Text>
          </View>
        </MotiView>
      </AnimatePresence>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitleContainer: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#fcd34d33',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  subtitleText: {
    fontWeight: '700',
    color: '#fcd34d',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  subtitleDot: {
    fontWeight: 'bold',
    color: '#fcd34d',
    marginHorizontal: 2,
    fontSize: 12,
  },
  coinContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
});
