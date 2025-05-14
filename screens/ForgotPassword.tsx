// screens/ForgotPasswordScreen2.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import { MotiView } from 'moti';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // auto-hide snackbar
  useEffect(() => {
    if (snackbar.visible) {
      const t = setTimeout(() => setSnackbar((s) => ({ ...s, visible: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar.visible]);

  const handleSendCode = () => {
    if (!input.trim()) {
      setError('Required');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError('');
    setLoading(true);

    // replace with your real API call
    setTimeout(() => {
      setLoading(false);
      setSnackbar({ visible: true, message: 'Code sent!', type: 'success' });
      navigation.dispatch(CommonActions.navigate('VerificationCode', { input: input.trim() }));
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 600 }}>
              <Text style={[styles.title, { color: colors.text }]}>🔑 Forgot Password?</Text>
            </MotiView>

            <FloatingInput
              label="Email or Phone"
              iconName="user"
              value={input}
              onChangeText={setInput}
              error={error}
              shake={shake}
              keyboardType="default"
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
        </KeyboardAvoidingView>
      </ImageBackground>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    padding: 16,
    gap: 16,
  },
});
