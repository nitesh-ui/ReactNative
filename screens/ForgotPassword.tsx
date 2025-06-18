// screens/ForgotPasswordScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import apiClient from '../api/client';

import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import { MotiView } from 'moti';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // auto-hide
  useEffect(() => {
    if (snackbar.visible) {
      const t = setTimeout(() => setSnackbar((s) => ({ ...s, visible: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar.visible]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    // Reset states
    setError('');
    setShake(false);

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim(),
      });

      setSnackbar({
        visible: true,
        message: 'OTP sent successfully! Please check your email.',
        type: 'success',
      });

      // Navigate to verification screen with email
      navigation.navigate('VerificationCode', { email: email.trim() });
    } catch (err: any) {
      setSnackbar({
        visible: true,
        message: err?.response?.data?.message || 'Failed to send OTP. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          {/* Top bar with back button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 600 }}>
              <Text style={[styles.title, { color: '#fff' }]}>🔑 Forgot Password?</Text>
            </MotiView>

            <FloatingInput
              label="Email"
              iconName="mail"
              value={email}
              onChangeText={setEmail}
              error={error}
              shake={shake}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <GradientButton onPress={handleSendCode} loading={loading} disabled={loading}>
              Send Code
            </GradientButton>
          </View>

          <AnimatedSnackbar
            visible={snackbar.visible}
            type={snackbar.type}
            message={snackbar.message}
            onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
          />
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
});
