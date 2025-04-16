// components/AnimatedSnackbar.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
  onDismiss?: () => void;
};

export default function AnimatedSnackbar({ visible, message, type = 'success', onDismiss }: Props) {
  const backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';

  return (
    <MotiView
      from={{ translateY: 100, opacity: 0 }}
      animate={visible ? { translateY: 0, opacity: 1 } : { translateY: 100, opacity: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      }}>
      <MaterialIcons
        name={type === 'success' ? 'check-circle' : 'error'}
        size={22}
        color="#fff"
        style={{ marginRight: 10 }}
      />
      <Text style={{ color: '#fff', flex: 1 }}>{message}</Text>
    </MotiView>
  );
}
