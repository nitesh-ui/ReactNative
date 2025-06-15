// components/BetSlider.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from 'react-native-paper';

const { width: screenWidth } = Dimensions.get('window');
const TRACK_WIDTH = screenWidth * 0.8;

interface BetSliderProps {
  value: number;
  onChange(val: number): void;
  min: number;
  max: number;
  step: number;
}

export default function BetSlider({ value, onChange, min, max, step }: BetSliderProps) {
  const { colors } = useTheme();
  const [showBubble, setShowBubble] = useState(false);

  // calculate bubble position
  const pct = (value - min) / (max - min);
  const bubbleLeft = pct * (TRACK_WIDTH - 24) + 12;

  // pop animation trigger when value changes
  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    if (showBubble) {
      // bump the key so inner text re-animates
      setPopKey((k) => k + 1);
    }
  }, [value, showBubble]);

  return (
    <View style={styles.container}>
      <View style={styles.sliderWrapper}>
        <Slider
          style={{ width: TRACK_WIDTH, height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor={colors.primary}
          value={value}
          onValueChange={onChange}
          onSlidingStart={() => setShowBubble(true)}
          onSlidingComplete={() => setTimeout(() => setShowBubble(false), 300)}
        />

        <AnimatePresence>
          {showBubble && (
            <MotiView
              from={{ scale: 0, left: bubbleLeft }}
              animate={{ scale: 1, left: bubbleLeft }}
              exit={{ scale: 0, left: bubbleLeft }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 120,
                mass: 0.5,
              }}
              style={[styles.bubble, { backgroundColor: colors.primary }]}
              key="bubble">
              {/* pop animation on the number */}
              <MotiView
                from={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 200,
                }}
                key={popKey}>
                <Text style={[styles.bubbleText, { color: '#000' }]}>{value}</Text>
              </MotiView>
            </MotiView>
          )}
        </AnimatePresence>
      </View>

      {/* funky, animated Bet label */}
      <MotiView
        from={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        key={value}>
        <Text
          style={[
            styles.betLabel,
            {
              color: colors.primary,
            },
          ]}>
          BET: {value}
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  sliderWrapper: {
    position: 'relative',
    height: 60,
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 4,
  },
  bubbleText: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  betLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
