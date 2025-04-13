import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, useTheme, Menu, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';

const countryCodes = [
  { label: '🇮🇳 +91', value: '+91' },
  { label: '🇦🇺 +43', value: '+43' },
  { label: '🇨🇦 +1', value: '+1' },
  { label: '🇸🇪 +46', value: '+46' },
  { label: '🇵🇰 +92', value: '+92' },
];

export default function Register() {
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const validateAndSubmit = () => {
    const newErrors = { email: '', phone: '', password: '', confirmPassword: '' };
    let valid = true;

    if (!email.includes('@')) {
      newErrors.email = 'Invalid email';
      valid = false;
    }
    if (!phone || phone.length < 7) {
      newErrors.phone = 'Invalid phone number';
      valid = false;
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    if (valid) {
      console.log('🎉 Registered:', { email, phone: `${countryCode} ${phone}`, password });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          backgroundColor: colors.background,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled">
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={{ marginBottom: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>
            ✨ Create an Account
          </Text>
        </MotiView>

        <View style={{ gap: 16 }}>
          {/* Email */}
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
            }}
          />
          {errors.email ? (
            <Text style={{ color: colors.error, fontSize: 13 }}>{errors.email}</Text>
          ) : null}

          {/* Phone Number */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
              <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                  <TouchableOpacity
                    onPress={openMenu}
                    style={{ width: 100, height: 50, justifyContent: 'center', paddingLeft: 12 }}>
                    <Text style={{ fontSize: 16 }}>
                      {countryCodes.find((c) => c.value === countryCode)?.label}
                    </Text>
                  </TouchableOpacity>
                }>
                {countryCodes.map((c, idx) => (
                  <React.Fragment key={c.value}>
                    <Menu.Item
                      onPress={() => {
                        setCountryCode(c.value);
                        closeMenu();
                      }}
                      title={c.label}
                    />
                    {idx < countryCodes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Menu>

              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              />
            </View>
          </View>
          {errors.phone ? (
            <Text style={{ color: colors.error, fontSize: 13 }}>{errors.phone}</Text>
          ) : null}

          {/* Password */}
          <View style={{ position: 'relative' }}>
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
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 16, top: '30%' }}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#444" />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={{ color: colors.error, fontSize: 13 }}>{errors.password}</Text>
          ) : null}

          {/* Confirm Password */}
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          />
          {errors.confirmPassword ? (
            <Text style={{ color: colors.error, fontSize: 13 }}>{errors.confirmPassword}</Text>
          ) : null}

          {/* Sign Up Button */}
          <Button
            mode="contained"
            onPress={validateAndSubmit}
            style={{ marginTop: 8, borderRadius: 12, backgroundColor: colors.primary }}
            labelStyle={{ fontWeight: 'bold', color: '#000' }}>
            Sign Up
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
