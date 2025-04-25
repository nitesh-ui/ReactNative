import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, Button, Checkbox } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { login as loginAPI, test } from '../api/auth';
import AnimatedSnackbar from 'components/AnimatedSnackbar';

export default function Login() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
      const response = await loginAPI(email, password);
      console.log('✅ Login Success:', response);

      // Show success snackbar
      setSnackbarMsg('Logged in successfully!');
      setSnackbarType('success');
      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.replace('HomeScreen');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err?.response?.data || err.message);
      setSnackbarMsg(
        err?.response?.data?.message || 'Login failed. Please check your credentials.'
      );
      setSnackbarType('error');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            style={{ marginBottom: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>
              🎲 Welcome to Toss
            </Text>
          </MotiView>

          {/* Email */}
          <MotiView
            from={{ translateX: 0 }}
            animate={{ translateX: shakeEmail ? -10 : 0 }}
            transition={{
              type: 'timing',
              duration: 100,
              repeat: shakeEmail ? 3 : 0,
              repeatReverse: true,
            }}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 4,
                borderWidth: errors.email ? 1.5 : 0,
                borderColor: errors.email ? colors.error : 'transparent',
              }}
            />
          </MotiView>
          {errors.email ? (
            <Text style={{ color: colors.error, fontSize: 13, marginBottom: 4 }}>
              {errors.email}
            </Text>
          ) : null}

          {/* Password */}
          <MotiView
            from={{ translateX: 0 }}
            animate={{ translateX: shakePassword ? -10 : 0 }}
            transition={{
              type: 'timing',
              duration: 100,
              repeat: shakePassword ? 3 : 0,
              repeatReverse: true,
            }}>
            <View style={{ position: 'relative', marginTop: 16 }}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  paddingRight: 45,
                  borderWidth: errors.password ? 1.5 : 0,
                  borderColor: errors.password ? colors.error : 'transparent',
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: '30%' }}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#444" />
              </TouchableOpacity>
            </View>
          </MotiView>
          {errors.password ? (
            <Text style={{ color: colors.error, fontSize: 13, marginTop: 4 }}>
              {errors.password}
            </Text>
          ) : null}

          {/* Remember Me + Forgot */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox.Android
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={colors.primary}
              />
              <Text style={{ color: colors.text }}>Remember Me</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={{ color: colors.primary, fontWeight: '500' }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            mode="contained"
            loading={loading}
            disabled={loading}
            onPress={validateAndSubmit}
            style={{ marginTop: 16, borderRadius: 12, backgroundColor: colors.primary }}
            labelStyle={{ fontWeight: 'bold', color: '#000' }}>
            Login
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ color: colors.text }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <AnimatedSnackbar
        visible={snackbarVisible}
        type={snackbarType}
        message={snackbarMsg}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
