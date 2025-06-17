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

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import { signup } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import CoinLoader from '../components/CoinLoader';
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';

const countryCodes = [
  { label: '🇮🇳 +91', value: '+91' },
  { label: '🇦🇺 +43', value: '+43' },
  { label: '🇨🇦 +1', value: '+1' },
  { label: '🇸🇪 +46', value: '+46' },
  { label: '🇵🇰 +92', value: '+92' },
];

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

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    confirm: '',
    referralId: '',
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
  const [snackbar, setSnackbar] = useState({
    show: false,
    msg: '',
    type: 'success' as 'success' | 'error',
  });

  // auto‐hide snackbar
  useEffect(() => {
    if (snackbar.show) {
      const t = setTimeout(() => setSnackbar((s) => ({ ...s, show: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar.show]);

  const validateAndSubmit = async () => {
    const e = { email: '', phone: '', password: '', confirm: '', referralId: '' };
    const s = { email: false, phone: false, password: false, confirm: false, referralId: false };
    let ok = true;

    if (!email.includes('@')) {
      e.email = 'Invalid email';
      s.email = true;
      ok = false;
    }
    if (phone.trim().length < 7) {
      e.phone = 'Invalid phone';
      s.phone = true;
      ok = false;
    }
    if (password.length < 6) {
      e.password = 'Min 6 characters';
      s.password = true;
      ok = false;
    }
    if (confirm !== password) {
      e.confirm = 'Doesn’t match';
      s.confirm = true;
      ok = false;
    }

    setErrors(e);
    setShake(s);
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

    if (!ok) return;

    setLoading(true);
    try {
      await signup(email.trim(), countryCode + phone, password, confirm, referralId);
      setSnackbar({ show: true, msg: 'Registered! Please log in.', type: 'success' });
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
      setSnackbar({
        show: true,
        msg: err?.response?.data?.message || 'Signup failed',
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
              <Text style={[styles.title, { color: colors.text }]}>✨ Create an Account</Text>
            </MotiView>

            {/* Form */}
            <View style={{ gap: 16 }}>
              <FloatingInput
                label="Email"
                iconName="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
                shake={shake.email}
              />

              {/* Phone */}
              <View>
                <MotiView
                  from={{ translateX: 0 }}
                  animate={{ translateX: shake.phone ? -8 : 0 }}
                  transition={{
                    type: 'timing',
                    duration: 80,
                    repeat: shake.phone ? 3 : 0,
                    repeatReverse: true,
                  }}>
                  <View
                    style={[
                      styles.phoneContainer,
                      {
                        borderColor: errors.phone ? colors.error : 'rgba(255,255,255,0.4)',
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
                {errors.phone ? (
                  <Text style={[styles.error, { color: colors.error }]}>{errors.phone}</Text>
                ) : null}
              </View>

              <FloatingInput
                label="Password"
                iconName="lock"
                value={password}
                onChangeText={setPassword}
                secure
                error={errors.password}
                shake={shake.password}
              />

              <FloatingInput
                label="Confirm Password"
                iconName="lock"
                value={confirm}
                onChangeText={setConfirm}
                secure
                error={errors.confirm}
                shake={shake.confirm}
              />

              <FloatingInput
                label="Referral ID (Optional)"
                iconName="gift"
                value={referralId}
                onChangeText={setReferralId}
                error={errors.referralId}
                shake={shake.referralId}
              />

              <GradientButton onPress={validateAndSubmit} loading={loading}>
                Sign Up
              </GradientButton>
            </View>
          </ScrollView>

          <AnimatedSnackbar
            visible={snackbar.show}
            type={snackbar.type}
            message={snackbar.msg}
            onDismiss={() => setSnackbar((s) => ({ ...s, show: false }))}
          />

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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  phonePrefixText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: {
    marginTop: 6,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
  },
});
