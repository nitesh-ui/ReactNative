// screens/VerificationCodeScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { MotiView, AnimatePresence } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

export default function VerificationCodeScreen() {
  const { colors } = useTheme();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(30);
  const [shaking, setShaking] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Countdown for resend
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInput = (val: string, index: number) => {
    if (!/^\d$/.test(val)) return;

    const updated = [...code];
    updated[index] = val;
    setCode(updated);

    if (index < 3 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    const updated = [...code];
    if (code[index] === '') {
      if (index > 0) {
        updated[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }
    } else {
      updated[index] = '';
    }
    setCode(updated);
  };

  const verifyCode = () => {
    const enteredCode = code.join('');
    if (enteredCode !== '1234') {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } else {
      setError(false);
      console.log('✅ Code Verified!');
      navigation.navigate('ResetPassword');
    }
  };

  const resendCode = () => {
    setTimer(30);
    console.log('📨 New code sent!');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center', // ⬅️ Center everything
          paddingHorizontal: 24,
          backgroundColor: colors.background,
        }}
        keyboardShouldPersistTaps="handled">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={{ marginBottom: 24, alignItems: 'center' }}>
          <Text
            className="text-2xl font-bold text-white"
            style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
            🔒 Enter Verification Code
          </Text>
        </MotiView>

        {/* OTP Inputs - FIXED */}
        <MotiView
          style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}
          from={{ translateX: 0 }}
          animate={{ translateX: shaking ? -10 : 0 }}
          transition={{
            type: 'timing',
            duration: 100,
            repeat: shaking ? 5 : 0,
            repeatReverse: true,
          }}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => (inputRefs.current[idx] = ref)}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(val) => handleInput(val, idx)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(idx);
              }}
              style={{
                width: 60,
                height: 60,
                backgroundColor: 'white',
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 24,
                borderWidth: 2,
                borderColor: error ? colors.error : 'transparent',
              }}
            />
          ))}
        </MotiView>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2">
              <Text
                className="text-center text-sm text-red-400"
                style={{ textAlign: 'center', fontSize: 14, color: colors.error }}>
                Invalid Code. Try Again.
              </Text>
            </MotiView>
          )}
        </AnimatePresence>

        {/* Resend */}
        <View className="mb-6 items-center" style={{ marginBottom: 24, alignItems: 'center' }}>
          {timer > 0 ? (
            <Text className="text-white" style={{ color: colors.text }}>
              Resend in 00:{timer.toString().padStart(2, '0')}
            </Text>
          ) : (
            <TouchableOpacity onPress={resendCode}>
              <Text
                className="font-semibold text-funkyPink"
                style={{ fontWeight: 600, color: colors.funkyPink }}>
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <Button
          mode="contained"
          onPress={verifyCode}
          style={{ borderRadius: 12, backgroundColor: colors.funkyPink }}
          labelStyle={{ fontWeight: 'bold', color: '#000', fontSize: 20 }}>
          Verify
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
