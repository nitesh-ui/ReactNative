// components/FloatingInput.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import type { ViewStyle } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName?: keyof typeof Feather.glyphMap;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  hasError?: boolean;
  shake?: boolean;
}

const FloatingInput = React.memo(function FloatingInput({
  label,
  value,
  onChangeText,
  iconName,
  secure = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  hasError = false,
  shake = false,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secure);

  // Memoize the input style to prevent unnecessary recalculations
  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        color: '#fff',
        fontSize: 16,
        paddingVertical: 8,
        paddingTop: 16,
      },
    ],
    []
  );

  // Memoize the label transform style
  const labelStyle = useMemo(
    () => [
      styles.label,
      {
        transform: [
          {
            translateY: isFocused || value ? -20 : 0,
          },
          {
            scale: isFocused || value ? 0.8 : 1,
          },
        ],
        color: hasError ? '#F44336' : isFocused ? '#BB86FC' : 'rgba(255,255,255,0.7)',
      },
    ],
    [isFocused, value, hasError]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const togglePassword = useCallback(() => setShowPassword((prev) => !prev), []);

  return (
    <MotiView
      style={styles.container}
      animate={{
        translateX: shake ? [-8, 8, -8, 8, -8, 0] : 0,
      }}
      transition={{
        duration: 400,
      }}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: hasError ? '#F44336' : isFocused ? '#BB86FC' : 'rgba(255,255,255,0.4)',
          },
        ]}>
        {iconName && (
          <Feather
            name={iconName}
            size={20}
            color={hasError ? '#F44336' : isFocused ? '#BB86FC' : '#fff'}
            style={styles.icon}
          />
        )}
        <View style={styles.inputWrapper}>
          <Text style={labelStyle}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={!showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        {secure && (
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#fff"
            style={styles.icon}
            onPress={togglePassword}
          />
        )}
      </View>
    </MotiView>
  );
});

export default FloatingInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  inputWrapper: {
    flex: 1,
    paddingVertical: 8,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 20,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingTop: 16,
  },
  icon: {
    paddingHorizontal: 12,
  },
});
