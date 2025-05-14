// screens/Login.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Checkbox } from 'react-native-paper';
import { MotiView } from 'moti';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { AuthContext } from '../context/AuthContext';
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import CoinLoader from '../components/CoinLoader';

import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';

export default function Login() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (snackbarVisible) {
      const t = setTimeout(() => setSnackbarVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbarVisible]);

  const validateAndSubmit = async () => {
    const newErrors = { email: '', password: '' };
    let valid = true;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      setShakeEmail(true);
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      setShakePassword(true);
      valid = false;
    }
    setErrors(newErrors);
    setTimeout(() => {
      setShakeEmail(false);
      setShakePassword(false);
    }, 500);
    if (!valid) return;

    try {
      setLoading(true);
      await login(email.trim(), password, rememberMe);
      setSnackbarMsg('Logged in successfully!');
      setSnackbarType('success');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'HomeScreen2' }] }));
      }, 800);
    } catch (err: any) {
      setSnackbarMsg(err?.response?.data?.message || 'Login failed');
      setSnackbarType('error');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../assets/bg1.jpg')} resizeMode="cover" style={{ flex: 1 }}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 800 }}
          style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
              <MotiView
                from={{ translateY: -20, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 600 }}
                style={{ alignItems: 'center', marginBottom: 32 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>
                  🎲 Welcome to Toss
                </Text>
              </MotiView>

              <FloatingInput
                label="Email"
                iconName="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
                shake={shakeEmail}
              />
              <FloatingInput
                label="Password"
                iconName="lock"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secure
                shake={shakePassword}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Checkbox.Android
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    color={colors.primary}
                  />
                  <Text style={{ color: '#fff' }}>Remember Me</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={{ color: colors.primary, fontWeight: '500' }}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <GradientButton onPress={validateAndSubmit} loading={loading}>
                Login
              </GradientButton>

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                <Text style={{ color: '#fff' }}>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </MotiView>

        <AnimatedSnackbar
          visible={snackbarVisible}
          type={snackbarType}
          message={snackbarMsg}
          onDismiss={() => setSnackbarVisible(false)}
        />
        <CoinLoader visible={loading} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
