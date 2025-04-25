import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

export default function LandingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatePresence>
        <MotiView
          key="title"
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -50 }}
          transition={{ type: 'timing', duration: 700 }}
          style={styles.centered}>
          <Text style={[styles.title, { color: colors.text }]}>Flip To Win</Text>

          <MotiView
            key="subtitle"
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

        <MotiView
          key="coin"
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 500, damping: 10 }}
          style={styles.coinContainer}>
          <Image
            source={require('../assets/head.png')}
            style={{ width: screenWidth * 0.5, height: screenWidth * 0.5 }}
            resizeMode="contain"
          />
        </MotiView>

        <MotiView
          key="buttons"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 900, duration: 600 }}
          style={{ width: '100%' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={[styles.signupBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={{ color: '#fff', opacity: 0.8 }}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Log In</Text>
            </Text>
          </TouchableOpacity>
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
  },
  signupBtn: {
    marginHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  signupText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 12,
  },
});
