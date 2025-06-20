// screens/ResetPasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { MotiView, AnimatePresence } from 'moti';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { email, otp } = route.params;

  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [hasError, setHasError] = useState({
    newPwd: false,
    confirmPwd: false,
  });
  const [shake, setShake] = useState({
    newPwd: false,
    confirmPwd: false,
  });
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

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    // Add more password validations if needed
    return '';
  };

  const handleReset = async () => {
    // Reset states
    setHasError({ newPwd: false, confirmPwd: false });
    setShake({ newPwd: false, confirmPwd: false });

    let hasErrors = false;

    // Validate password
    const passwordError = validatePassword(newPwd);
    if (passwordError) {
      setHasError((prev) => ({ ...prev, newPwd: true }));
      setShake((prev) => ({ ...prev, newPwd: true }));
      showMessage(passwordError, 'error');
      hasErrors = true;
    }

    // Only validate confirm password if new password is valid
    if (!hasErrors && newPwd !== confirmPwd) {
      setHasError((prev) => ({ ...prev, confirmPwd: true }));
      setShake((prev) => ({ ...prev, confirmPwd: true }));
      showMessage('Passwords do not match.', 'error');
      hasErrors = true;
    }

    if (hasErrors) {
      setTimeout(() => {
        setShake({ newPwd: false, confirmPwd: false });
      }, 500);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        email,
        otp,
        newPassword: newPwd,
      });

      showMessage('Password reset successful! Please login with your new password.', 'success');

      // Navigate to login after success
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }, 1500);
    } catch (err: any) {
      showMessage(
        err?.response?.data?.message || 'Failed to reset password. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 500 }}
              style={{ marginBottom: 24, alignItems: 'center' }}>
              <Text style={[styles.heading, { color: '#fff' }]}>🔒 Reset Your Password</Text>
            </MotiView>

            <FloatingInput
              label="New Password"
              iconName="lock"
              value={newPwd}
              onChangeText={(text) => {
                setNewPwd(text);
                // Clear errors when user types
                setHasError((prev) => ({ ...prev, newPwd: false }));
                setShake((prev) => ({ ...prev, newPwd: false }));
              }}
              secure
              hasError={hasError.newPwd}
              shake={shake.newPwd}
            />
            <FloatingInput
              label="Confirm Password"
              iconName="lock"
              value={confirmPwd}
              onChangeText={(text) => {
                setConfirmPwd(text);
                // Clear errors when user types
                setHasError((prev) => ({ ...prev, confirmPwd: false }));
                setShake((prev) => ({ ...prev, confirmPwd: false }));
              }}
              secure
              hasError={hasError.confirmPwd}
              shake={shake.confirmPwd}
            />

            <GradientButton onPress={handleReset} loading={loading} disabled={loading}>
              Reset Password
            </GradientButton>
          </ScrollView>

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
  safe: { flex: 1 },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
