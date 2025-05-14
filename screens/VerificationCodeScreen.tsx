// screens/VerificationCodeScreen2.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import GradientButton from '../components/GradientButton';
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import { MotiView, AnimatePresence } from 'moti';

export default function VerificationCodeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(30);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'error' });

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
    if (idx < 3) inputRefs.current[idx + 1]?.focus();
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
    const entered = code.join('');
    if (entered !== '1234') {
      setError(true);
      setShake(true);
      setSnackbar({ visible: true, message: 'Invalid code!', type: 'error' });
      setTimeout(() => setShake(false), 500);
    } else {
      setError(false);
      setSnackbar({ visible: true, message: 'Verified!', type: 'success' });
      setTimeout(() => {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'ResetPassword' }] }));
      }, 800);
    }
  };

  const resend = () => {
    setTimer(30);
    setSnackbar({ visible: true, message: 'Code resent!', type: 'success' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 500 }}>
            <Text style={[styles.title, { color: colors.text }]}>🔒 Enter Verification Code</Text>
          </MotiView>

          <MotiView
            from={{ translateX: 0 }}
            animate={{ translateX: shake ? [-8, 8, -6, 6, -4, 4, 0] : 0 }}
            transition={{ type: 'timing', duration: 100, repeat: shake ? 3 : 0 }}
            style={styles.otpRow}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputRefs.current[idx] = ref)}
                style={[styles.otpInput, { borderColor: error ? colors.error : 'transparent' }]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(val) => handleInput(val, idx)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBack(idx);
                }}
              />
            ))}
          </MotiView>

          <AnimatePresence>
            {error && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginBottom: 16 }}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  Invalid code. Please try again.
                </Text>
              </MotiView>
            )}
          </AnimatePresence>

          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={{ color: colors.text }}>
                Resend in 00:{String(timer).padStart(2, '0')}
              </Text>
            ) : (
              <TouchableOpacity onPress={resend}>
                <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <GradientButton onPress={verify} loading={false}>
            Verify
          </GradientButton>
        </View>

        <AnimatedSnackbar
          visible={snackbar.visible}
          type={snackbar.type}
          message={snackbar.message}
          onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    padding: 16,
    gap: 16,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontSize: 24,
    borderWidth: 2,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  resendText: {
    fontWeight: '600',
  },
});
