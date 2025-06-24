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
import CoinLoader from '../components/CoinLoader';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function Login() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, getStoredCredentials } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState({ email: false, password: false });
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbarMessages, setSnackbarMessages] = useState<SnackbarMessage[]>([]);

  // Load stored credentials on mount
  useEffect(() => {
    const loadStoredCredentials = async () => {
      const credentials = await getStoredCredentials();
      if (credentials) {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setRememberMe(true); // If we have stored credentials, set remember me to true
      }
    };
    loadStoredCredentials();
  }, [getStoredCredentials]);

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

  const validateAndSubmit = async () => {
    const newHasError = { email: false, password: false };
    let hasErrors = false;

    // Validate email
    if (!email.trim()) {
      newHasError.email = true;
      setShakeEmail(true);
      showMessage('Email is required', 'error');
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newHasError.email = true;
      setShakeEmail(true);
      showMessage('Please enter a valid email', 'error');
      hasErrors = true;
    }

    // Validate password
    if (!password) {
      newHasError.password = true;
      setShakePassword(true);
      showMessage('Password is required', 'error');
      hasErrors = true;
    }

    setHasError(newHasError);
    setTimeout(() => {
      setShakeEmail(false);
      setShakePassword(false);
    }, 500);

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password, rememberMe);
      showMessage('Logged in successfully!', 'success');
      setTimeout(() => {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'HomeScreen' }] }));
      }, 800);
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage =
        // err?.response?.data?.message ||
        // err?.response?.data?.error ||
        // err?.message ||
        'Login failed. Please try again.';
      showMessage(errorMessage, 'error');
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
                  🪙 Welcome to Flip
                </Text>
              </MotiView>

              <FloatingInput
                label="Email"
                iconName="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                hasError={hasError.email}
                shake={shakeEmail}
              />
              <FloatingInput
                label="Password"
                iconName="lock"
                value={password}
                onChangeText={setPassword}
                hasError={hasError.password}
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
                <Text style={{ color: '#fff' }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </MotiView>

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

        <CoinLoader visible={loading} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
