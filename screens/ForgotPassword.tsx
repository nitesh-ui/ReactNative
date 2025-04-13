import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { MotiView, AnimatePresence, ScrollView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSendCode = () => {
    if (!input.trim()) {
      setError('Please enter your email or phone number.');
      setShake(true); // trigger shake
      setTimeout(() => setShake(false), 500); // stop shaking after animation
    } else {
      setError('');
      console.log('📨 Code sent to:', input);
      navigation.navigate('VerificationCode', { input });
    }
  };

  const inputErrorStyle: TextStyle | ViewStyle = error
    ? {
        borderWidth: 1.5,
        borderColor: colors.error,
        backgroundColor: '#ffe5e5',
      }
    : {};

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
              🔑 Forgot Password?
            </Text>
          </MotiView>

          {/* Animated Input Field with Icon */}
          <AnimatePresence>
            <MotiView
              from={{ translateX: 0 }}
              animate={{ translateX: shake ? [-10, 10, -8, 8, -5, 5, 0] : 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 12,
                paddingHorizontal: 12,
                ...inputErrorStyle,
              }}>
              <Feather name="user" size={20} color="#aaa" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Phone Number or Email"
                placeholderTextColor="#aaa"
                value={input}
                onChangeText={setInput}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 16,
                }}
              />
            </MotiView>
          </AnimatePresence>

          {/* Error Message */}
          {error ? (
            <Text style={{ color: colors.error, fontSize: 13, marginTop: 4 }}>{error}</Text>
          ) : null}

          {/* Send Code Button */}
          <Button
            mode="contained"
            onPress={handleSendCode}
            style={{
              marginTop: 12,
              borderRadius: 12,
              backgroundColor: colors.primary,
            }}
            labelStyle={{ fontWeight: 'bold', color: '#000' }}>
            Send Code
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
