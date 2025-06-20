// screens/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import apiClient from '../api/client';

import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';

// Define message types
type MessageGroup = 'success' | 'error';
interface SnackbarMessage {
  id: string;
  message: string;
  group: MessageGroup;
  timestamp: number;
}

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarMessages, setSnackbarMessages] = useState<SnackbarMessage[]>([]);

  // Generate random ID for messages
  const genId = () =>
    Array.from({ length: 6 })
      .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 36))
      .join('');

  // Helper to get group color
  const getGroupColor = (group: MessageGroup): [string, string] => {
    switch (group) {
      case 'success':
        return ['#4CAF50', '#81C784']; // Green for success
      case 'error':
        return ['#F44336', '#E57373']; // Red for errors
      default:
        return ['#FF6F91', '#FF9671'];
    }
  };

  const showMessage = (message: string, group: MessageGroup = 'success') => {
    const newMessage: SnackbarMessage = {
      id: genId(),
      message,
      group,
      timestamp: Date.now(),
    };

    setSnackbarMessages((prev) => [...prev, newMessage]);

    // Remove message after timeout
    setTimeout(() => {
      setSnackbarMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    }, 3000);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    // Reset states
    setHasError(false);
    setShake(false);

    let hasErrors = false;

    // Validate email
    if (!email.trim()) {
      setHasError(true);
      setShake(true);
      showMessage('Email is required', 'error');
      hasErrors = true;
    } else if (!validateEmail(email.trim())) {
      setHasError(true);
      setShake(true);
      showMessage('Please enter a valid email address', 'error');
      hasErrors = true;
    }

    if (hasErrors) {
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim(),
      });

      showMessage('OTP sent successfully! Please check your email.', 'success');

      // Navigate to verification screen with email
      navigation.navigate('VerificationCode', { email: email.trim() });
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Failed to send OTP. Please try again.', 'error');
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
              hasError={hasError}
              shake={shake}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <GradientButton onPress={handleSendCode} loading={loading} disabled={loading}>
              Send Code
            </GradientButton>
          </View>

          {/* Stacked Snackbars */}
          <View
            style={{
              position: 'absolute',
              top: 32,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 10,
              gap: 8,
            }}>
            {snackbarMessages.map((msg) => (
              <MotiView
                key={msg.id}
                from={{ scale: 0.8, opacity: 0, translateY: -20 }}
                animate={{ scale: 1, opacity: 1, translateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, translateY: -20 }}
                transition={{
                  duration: 400,
                }}
                style={{
                  width: '90%',
                  maxWidth: 400,
                }}>
                <LinearGradient
                  colors={getGroupColor(msg.group)}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 6,
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontWeight: '700',
                      fontSize: 16,
                      textAlign: 'center',
                    }}>
                    {msg.message}
                  </Text>
                </LinearGradient>
              </MotiView>
            ))}
          </View>
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
