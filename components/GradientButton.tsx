// components/GradientButton.tsx
import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  children: ReactNode;
  onPress(): void;
  loading?: boolean;
}

export default function GradientButton({ children, onPress, loading }: GradientButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={loading}>
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: loading ? 1 : 0.98 }}
        transition={{ type: 'timing', duration: 100 }}
        style={styles.outer}>
        <LinearGradient
          colors={['#FF6F91', '#FF9671']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.gradient}>
          <Text style={styles.text}>{loading ? 'Loading...' : children}</Text>
        </LinearGradient>
      </MotiView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: 12 },
  gradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  text: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});
