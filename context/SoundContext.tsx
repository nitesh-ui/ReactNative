// context/SoundContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface SoundContextValue {
  bgSound: Audio.Sound | null;
}
export const SoundContext = createContext<SoundContextValue>({ bgSound: null });

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bgSound, setBgSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let sound: Audio.Sound;
    (async () => {
      const { sound: s } = await Audio.Sound.createAsync(require('../assets/sounds/bg-music.mp3'), {
        isLooping: true,
        volume: 1.0,
      });
      sound = s;
      setBgSound(s);
      await s.playAsync();
    })();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  return <SoundContext.Provider value={{ bgSound }}>{children}</SoundContext.Provider>;
};
