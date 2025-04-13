import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
    } else if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      setError('');
      console.log('🔐 Password reset successful!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={{ marginBottom: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>
            🔒 Reset Your Password
          </Text>
        </MotiView>

        {/* New Password */}
        <View style={{ position: 'relative', marginBottom: 16 }}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              paddingRight: 45,
              borderWidth: error ? 2 : 0,
              borderColor: error ? colors.error : 'transparent',
            }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 16, top: '30%' }}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#444" />
          </TouchableOpacity>
        </View>

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
            borderWidth: error ? 2 : 0,
            borderColor: error ? colors.error : 'transparent',
          }}
        />

        <AnimatePresence>
          {error ? (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 8 }}>
              <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
            </MotiView>
          ) : null}
        </AnimatePresence>

        <Button
          mode="contained"
          onPress={handleReset}
          style={{ marginTop: 24, borderRadius: 12, backgroundColor: colors.primary }}
          labelStyle={{ fontWeight: 'bold', color: '#000' }}>
          Submit
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
