// screens/VerificationCodeScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import GradientButton from '../components/GradientButton';

type VerificationCodeRouteProp = RouteProp<RootStackParamList, 'VerificationCode'>;

// Define message types
type MessageGroup = 'success' | 'error';
interface SnackbarMessage {
  id: string;
  message: string;
  group: MessageGroup;
  timestamp: number;
}

export default function VerificationCodeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<VerificationCodeRouteProp>();
  const { email } = route.params;

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(30);
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

  // countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleInput = (val: string, idx: number) => {
    if (!/^\d$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    setError(false); // Clear error when user types
    if (idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleBack = (idx: number) => {
    if (code[idx] === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      return;
    }
    const next = [...code];
    next[idx] = '';
    setCode(next);
  };

  const verify = () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setError(true);
      setShake(true);
      showMessage('Please enter a valid 6-digit code', 'error');
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError(false);
    // Navigate to reset password with email and OTP
    navigation.dispatch(CommonActions.navigate('ResetPassword', { email, otp }));
  };

  const resend = () => {
    setTimer(30);
    showMessage('Code resent!', 'success');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 500 }}>
              <Text style={[styles.title, { color: '#fff' }]}>🔒 Enter Verification Code</Text>
              <Text style={styles.subtitle}>We've sent a verification code to your email</Text>
            </MotiView>

            <MotiView
              animate={{
                translateX: shake ? [-8, 8, -8, 8, -8, 0] : 0,
              }}
              transition={{
                duration: 400,
              }}
              style={styles.otpRow}>
              {code.map((digit, idx) => (
                <View key={idx} style={styles.inputContainer}>
                  <TextInput
                    ref={(ref) => (inputRefs.current[idx] = ref)}
                    style={[
                      styles.otpInput,
                      { borderColor: error ? '#F44336' : 'rgba(255,255,255,0.2)' },
                      digit ? styles.otpInputFilled : null,
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(val) => handleInput(val, idx)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace') handleBack(idx);
                    }}
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    textAlign="center"
                    allowFontScaling={false}
                  />
                </View>
              ))}
            </MotiView>

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in 00:{String(timer).padStart(2, '0')}</Text>
              ) : (
                <TouchableOpacity onPress={resend}>
                  <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <GradientButton onPress={verify} loading={loading} style={styles.verifyButton}>
              Verify
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
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 16,
    height: 60,
  },
  inputContainer: {
    marginHorizontal: 4,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    borderWidth: 1.5,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 50,
    minHeight: 50,
  },
  otpInputFilled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
  },
  resendText: {
    fontWeight: '600',
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
  },
});
