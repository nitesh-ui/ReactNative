// components/BetControl.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { MotiView } from 'moti';
import { useTheme } from 'react-native-paper';

const { width: screenWidth } = Dimensions.get('window');
const TRACK_WIDTH = screenWidth * 0.75;

interface BetControlProps {
  value: number; // committed value from parent
  onChange(val: number): void; // called once on release
  min: number;
  max: number;
  step: number;
}

export default function BetControl({ value, onChange, min, max, step }: BetControlProps) {
  const { colors } = useTheme();
  const [local, setLocal] = useState(value);
  const [sliding, setSliding] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // resync if parent value changes
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // hide bubble once sliding ends
  useEffect(() => {
    if (!sliding) setShowBubble(false);
  }, [sliding]);

  const clamp = (v: number) => Math.min(Math.max(v, min), max);

  // compute bubble position
  const pct = (local - min) / (max - min);
  const bubbleLeft = pct * (TRACK_WIDTH - 32) + 16; // 32 = bubble width padding, 16 offset

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {/* Decrement */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            const next = clamp(value - step);
            setLocal(next);
            onChange(next);
          }}
          style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnText}>–</Text>
        </TouchableOpacity>

        {/* Slider + Bubble */}
        <View style={styles.sliderWrapper}>
          <Slider
            style={{ width: TRACK_WIDTH, height: 40 }}
            minimumValue={min}
            maximumValue={max}
            step={step}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor={colors.primary}
            // uncontrolled while sliding
            defaultValue={value}
            {...(!sliding ? { value: local } : {})}
            onSlidingStart={() => {
              setSliding(true);
              setShowBubble(true);
            }}
            onValueChange={(v) => {
              setLocal(v);
            }}
            onSlidingComplete={(v) => {
              const snapped = Math.round(v / step) * step;
              setLocal(snapped);
              onChange(snapped);
              setSliding(false);
            }}
          />

          {showBubble && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              style={[styles.bubble, { left: bubbleLeft, backgroundColor: colors.primary }]}>
              <Text style={[styles.bubbleText, { color: '#000' }]}>{local}</Text>
            </MotiView>
          )}
        </View>

        {/* Increment */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            const next = clamp(value + step);
            setLocal(next);
            onChange(next);
          }}
          style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.primary }]}>BET: {value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 8,
    elevation: 5,
  },
  btnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 28,
  },
  sliderWrapper: {
    position: 'relative',
    justifyContent: 'center',
    height: 60,
  },
  bubble: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 4,
  },
  bubbleText: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
