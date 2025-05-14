// components/FloatingInput.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';

interface FloatingInputProps extends TextInputProps {
  label: string;
  iconName: React.ComponentProps<typeof Feather>['name'];
  value: string;
  onChangeText(text: string): void;
  secure?: boolean;
  error?: string;
  shake?: boolean;
}

export default function FloatingInput({
  label,
  iconName,
  value,
  onChangeText,
  secure = false,
  error,
  shake,
  ...props
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  // local toggle for secure entry
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={{ marginBottom: shake ? 20 : 12 }}>
      <MotiView
        from={{ translateX: 0 }}
        animate={{ translateX: shake ? -8 : 0 }}
        transition={{
          type: 'timing',
          duration: 100,
          repeat: shake ? 3 : 0,
          repeatReverse: true,
        }}>
        <View
          style={[
            styles.container,
            {
              borderColor: error
                ? 'rgba(255,80,80,0.9)'
                : focused
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(255,255,255,0.4)',
            },
          ]}>
          <Feather
            name={iconName}
            size={20}
            color={focused ? '#fff' : 'rgba(255,255,255,0.7)'}
            style={styles.icon}
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secure && hidden}
            placeholder={label}
            placeholderTextColor="rgba(255,255,255,0.7)"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={styles.input}
            {...props}
          />

          {secure && (
            <TouchableOpacity onPress={() => setHidden((h) => !h)} style={styles.eyeButton}>
              <Feather
                name={hidden ? 'eye' : 'eye-off'}
                size={20}
                color={focused ? '#fff' : 'rgba(255,255,255,0.7)'}
              />
            </TouchableOpacity>
          )}
        </View>
      </MotiView>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  eyeButton: {
    marginLeft: 12,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 16,
    color: '#FF5050',
    fontSize: 13,
    fontWeight: '600',
  },
});
