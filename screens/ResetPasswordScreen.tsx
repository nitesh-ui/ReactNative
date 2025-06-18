// screens/ResetPasswordScreen.tsx

import React, { useState, useEffect } from 'react';
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
import apiClient from '../api/client';

import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';
import AnimatedSnackbar from '../components/AnimatedSnackbar';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { email, otp } = route.params;

  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // auto-clear snackbar
  useEffect(() => {
    if (!snackbar.visible) return;
    const t = setTimeout(() => setSnackbar((s) => ({ ...s, visible: false })), 3000);
    return () => clearTimeout(t);
  }, [snackbar.visible]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    // Add more password validations if needed
    return '';
  };

  const handleReset = async () => {
    // Reset states
    setError('');
    setShake(false);

    // Validate password
    const passwordError = validatePassword(newPwd);
    if (passwordError) {
      setError(passwordError);
      setShake(true);
      return;
    }

    if (newPwd !== confirmPwd) {
      setError('Passwords do not match.');
      setShake(true);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        email,
        otp,
        newPassword: newPwd,
      });

      setSnackbar({
        visible: true,
        message: 'Password reset successful! Please login with your new password.',
        type: 'success',
      });

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
      setSnackbar({
        visible: true,
        message: err?.response?.data?.message || 'Failed to reset password. Please try again.',
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
              onChangeText={setNewPwd}
              secure
              error={error.includes('characters') || error.includes('match') ? error : ''}
              shake={shake}
            />
            <FloatingInput
              label="Confirm Password"
              iconName="lock"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              secure
              error={error.includes('match') ? error : ''}
              shake={shake}
            />

            <AnimatePresence>
              {error ? (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ marginBottom: 8 }}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </MotiView>
              ) : null}
            </AnimatePresence>

            <GradientButton onPress={handleReset} loading={loading} disabled={loading}>
              Reset Password
            </GradientButton>
          </ScrollView>

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
