// components/GlassCard.tsx
import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

interface GlassCardProps {
  children: ReactNode;
}

export default function GlassCard({ children }: GlassCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 400 }}
      style={styles.containerOuter}>
      <BlurView intensity={60} tint="light" style={styles.containerInner}>
        {children}
      </BlurView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  containerOuter: {
    margin: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  containerInner: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
