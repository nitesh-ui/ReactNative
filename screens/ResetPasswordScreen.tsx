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
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';
import AnimatedSnackbar from '../components/AnimatedSnackbar';

export default function ResetPasswordScreen2() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
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

  const handleReset = () => {
    if (newPwd.length < 6) {
      setError('Password must be at least 6 characters.');
      setShake(true);
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('Passwords do not match.');
      setShake(true);
      return;
    }
    setError('');
    setSnackbar({ visible: true, message: 'Password reset successful!', type: 'success' });

    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }, 800);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 500 }}
              style={{ marginBottom: 24, alignItems: 'center' }}>
              <Text style={[styles.heading, { color: colors.text }]}>🔒 Reset Your Password</Text>
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

            <GradientButton
              onPress={() => {
                setShake(false);
                handleReset();
              }}>
              Submit
            </GradientButton>
          </ScrollView>

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
