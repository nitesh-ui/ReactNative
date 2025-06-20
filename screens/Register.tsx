// screens/Register.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme, Divider, Menu } from 'react-native-paper';
import { MotiView } from 'moti';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import { signup } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import CoinLoader from '../components/CoinLoader';
import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';

const countryCodes = [
  { label: '🇮🇳 +91', value: '+91' },
  { label: '🇦🇺 +43', value: '+43' },
  { label: '🇨🇦 +1', value: '+1' },
  { label: '🇸🇪 +46', value: '+46' },
  { label: '🇵🇰 +92', value: '+92' },
];

// Define message types
type MessageGroup = 'success' | 'error';
interface SnackbarMessage {
  id: string;
  message: string;
  group: MessageGroup;
  timestamp: number;
}

export default function Register() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    /* no auth needed here */
  } = React.useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referralId, setReferralId] = useState('');

  const [hasError, setHasError] = useState({
    email: false,
    phone: false,
    password: false,
    confirm: false,
    referralId: false,
  });
  const [shake, setShake] = useState({
    email: false,
    phone: false,
    password: false,
    confirm: false,
    referralId: false,
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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

  const validateAndSubmit = async () => {
    const newHasError = {
      email: false,
      phone: false,
      password: false,
      confirm: false,
      referralId: false,
    };
    const newShake = { ...newHasError };
    let hasErrors = false;

    if (!email.includes('@')) {
      newHasError.email = true;
      newShake.email = true;
      showMessage('Invalid email', 'error');
      hasErrors = true;
    }
    if (phone.trim().length < 7) {
      newHasError.phone = true;
      newShake.phone = true;
      showMessage('Invalid phone', 'error');
      hasErrors = true;
    }
    if (password.length < 6) {
      newHasError.password = true;
      newShake.password = true;
      showMessage('Password must be at least 6 characters', 'error');
      hasErrors = true;
    }
    if (confirm !== password) {
      newHasError.confirm = true;
      newShake.confirm = true;
      showMessage("Passwords don't match", 'error');
      hasErrors = true;
    }

    setHasError(newHasError);
    setShake(newShake);
    setTimeout(
      () =>
        setShake({
          email: false,
          phone: false,
          password: false,
          confirm: false,
          referralId: false,
        }),
      500
    );

    if (hasErrors) {
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), countryCode + phone, password, confirm, referralId);
      showMessage('Registered! Please log in.', 'success');
      setTimeout(
        () =>
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          ),
        800
      );
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Title */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 600 }}
              style={styles.header}>
              <Text style={[styles.title, { color: '#fff' }]}>✨ Create an Account</Text>
            </MotiView>

            {/* Form */}
            <View style={{ gap: 16 }}>
              <FloatingInput
                label="Email"
                iconName="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                hasError={hasError.email}
                shake={shake.email}
              />

              {/* Phone */}
              <MotiView
                style={styles.container}
                animate={{
                  translateX: shake.phone ? [-8, 8, -8, 8, -8, 0] : 0,
                }}
                transition={{
                  duration: 400,
                }}>
                <View
                  style={[
                    styles.phoneContainer,
                    {
                      borderColor: hasError.phone ? '#F44336' : 'rgba(255,255,255,0.4)',
                    },
                  ]}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                      <TouchableOpacity onPress={openMenu} style={styles.phonePrefix}>
                        <Text style={styles.phonePrefixText}>
                          {countryCodes.find((c) => c.value === countryCode)?.label}
                        </Text>
                        <Feather name="chevron-down" size={18} color="#fff" />
                      </TouchableOpacity>
                    }>
                    {countryCodes.map((c) => (
                      <Menu.Item
                        key={c.value}
                        onPress={() => {
                          setCountryCode(c.value);
                          closeMenu();
                        }}
                        title={c.label}
                      />
                    ))}
                  </Menu>
                  <TextInput
                    placeholder="Phone Number"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.phoneInput}
                  />
                </View>
              </MotiView>

              <FloatingInput
                label="Password"
                iconName="lock"
                value={password}
                onChangeText={setPassword}
                secure
                hasError={hasError.password}
                shake={shake.password}
              />

              <FloatingInput
                label="Confirm Password"
                iconName="lock"
                value={confirm}
                onChangeText={setConfirm}
                secure
                hasError={hasError.confirm}
                shake={shake.confirm}
              />

              <FloatingInput
                label="Referral ID (Optional)"
                iconName="gift"
                value={referralId}
                onChangeText={setReferralId}
                hasError={hasError.referralId}
                shake={shake.referralId}
              />

              <GradientButton onPress={validateAndSubmit} loading={loading}>
                Sign Up
              </GradientButton>
            </View>
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

          <CoinLoader visible={loading} />
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
    height: 56,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
    height: '100%',
    justifyContent: 'center',
  },
  phonePrefixText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    height: '100%',
  },
  error: {
    marginTop: 6,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
  },
});
