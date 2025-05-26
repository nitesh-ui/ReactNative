// screens/HomeScreen.tsx

import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
  BackHandler,
  KeyboardAvoidingView,
  ImageBackground,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Button } from 'react-native-paper';
import { MotiView } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import UserDropdown from '../components/UserDropdown';
import { AuthContext } from '../context/AuthContext';
import { SoundContext } from '../context/SoundContext';
import apiClient from '../api/client';
import { LinearGradient } from 'expo-linear-gradient';

const MIN_BET = 10;
const { width: screenWidth } = Dimensions.get('window');
const H_PADDING = screenWidth * 0.05;

const coinImages: Record<string, { head: any; tail: any }> = {
  IN: { head: require('../assets/in-head.png'), tail: require('../assets/in-tail.png') },
  US: { head: require('../assets/us-head.png'), tail: require('../assets/us-tail.png') },
  CH: { head: require('../assets/ch-head.png'), tail: require('../assets/ch-tail.png') },
  JP: { head: require('../assets/jp-head.png'), tail: require('../assets/jp-tail.png') },
};

const countryFlags = [
  { code: 'IN', symbol: '₹', value: 30, flag: require('../assets/in.png') },
  { code: 'US', symbol: '$', value: 30, flag: require('../assets/us.png') },
  { code: 'CH', symbol: '¥', value: 30, flag: require('../assets/cn.png') },
  { code: 'JP', symbol: '¥', value: 30, flag: require('../assets/jp.png') },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, userToken, username } = useContext(AuthContext);
  const { bgSound } = useContext(SoundContext);

  // Mute toggle
  const [muted, setMuted] = useState(false);
  const toggleMute = async () => {
    if (!bgSound) return;
    const next = !muted;
    setMuted(next);
    await bgSound.setIsMutedAsync(next);
  };

  // Flip animation
  const [selectedFace, setSelectedFace] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [flipResult, setFlipResult] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [flipping, setFlipping] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Balances
  const [walletBalance, setWalletBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  // UI state
  const [selectedCountry, setSelectedCountry] = useState(countryFlags[0]);
  const [amount, setAmount] = useState(`${countryFlags[0].value}`);

  // Sound effects
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);
  const [loseSound, setLoseSound] = useState<Audio.Sound | null>(null);

  // Confetti & snackbar
  const [showConfetti, setShowConfetti] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Prevent hardware back during flip/sim
  const [simulating, setSimulating] = useState(false);
  const flippingRef = useRef(flipping);
  useEffect(() => {
    flippingRef.current = flipping;
  }, [flipping]);

  // Countdown (drives simulation)
  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    if (countdown === 0) {
      runSimulation();
      setCountdown(30);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Generate random ID for fake wins
  const genId = () =>
    Array.from({ length: 6 })
      .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 36))
      .join('');

  // Fetch balances once
  const fetchBalance = useCallback(async () => {
    try {
      const resp = await apiClient.post(
        '/balance/get-balance',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWalletBalance(resp.data.walletBalance);
      setCurrentBalance(resp.data.currentBalance);
    } catch {
      setSnackbar({ visible: true, message: 'Could not fetch balance.' });
    }
  }, [userId, userToken]);
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Load SFX
  useEffect(() => {
    let fs: Audio.Sound, ws: Audio.Sound, ls: Audio.Sound;
    (async () => {
      fs = (await Audio.Sound.createAsync(require('../assets/sounds/coin-flip.mp3'))).sound;
      ws = (await Audio.Sound.createAsync(require('../assets/sounds/win-sound.mp3'))).sound;
      ls = (await Audio.Sound.createAsync(require('../assets/sounds/lose-sound.mp3'))).sound;
      setFlipSound(fs);
      setWinSound(ws);
      setLoseSound(ls);
    })();
    return () => {
      fs?.unloadAsync();
      ws?.unloadAsync();
      ls?.unloadAsync();
    };
  }, []);

  // Play effect under bg music
  const playEffect = useCallback(
    async (effect: Audio.Sound | null) => {
      if (!bgSound || !effect) return;
      await bgSound.setVolumeAsync(0.2);
      effect.setOnPlaybackStatusUpdate((st) => st.didJustFinish && bgSound.setVolumeAsync(1.0));
      await effect.replayAsync();
    },
    [bgSound]
  );

  // Block back
  useEffect(() => {
    const onBack = () => {
      if (currentBalance !== 0 || simulating) {
        setSnackbar({
          visible: true,
          message: simulating ? 'Please wait…' : 'Please takeout first.',
        });
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [currentBalance, simulating]);

  // Real BET flip
  const handleFlip = async () => {
    const bet = parseInt(amount, 10) || 0;
    if (bet < MIN_BET) {
      setSnackbar({ visible: true, message: `Min bet is ${selectedCountry.symbol}${MIN_BET}` });
      return;
    }
    // reset countdown
    setCountdown(30);

    await flipSound?.replayAsync();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setFlipping(true);
    setRotation((r) => r + 720);
    setTimeout(async () => {
      try {
        const { data } = await apiClient.post(
          '/play/flip',
          { userId, face: selectedFace.toLowerCase(), amount: bet },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        setFlipResult(data.coinFlip.toUpperCase());
        setCurrentBalance(data.currentBalance);
        setWalletBalance(data.walletBalance);
        const won = data.result === 'win';
        await playEffect(won ? winSound : loseSound);
        if (won) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch {
        setSnackbar({ visible: true, message: 'Could not play flip.' });
      } finally {
        setFlipping(false);
      }
    }, 800);
  };

  // Takeout
  const handleTakeout = async () => {
    if (!currentBalance) return;
    try {
      const { data } = await apiClient.post(
        '/balance/takeout',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWalletBalance(data.walletBalance);
      setCurrentBalance(data.currentBalance);
    } catch {
      setSnackbar({ visible: true, message: 'Could not take out.' });
    }
  };

  // Country change
  const handleCountryChange = (c: (typeof countryFlags)[0]) => {
    setSelectedCountry(c);
    setAmount(`${c.value}`);
  };

  // Fake simulation
  async function runSimulation() {
    if (flippingRef.current) return;
    setSimulating(true);
    await playEffect(flipSound);
    setFlipping(true);
    setRotation((r) => r + 720);
    await new Promise((r) => setTimeout(r, 1000));
    setFlipping(false);
    for (let i = 0; i < 5; i++) {
      setSnackbar({ visible: true, message: `${genId()} won!` });
      await new Promise((r) => setTimeout(r, 1200));
      setSnackbar((s) => ({ ...s, visible: false }));
      await new Promise((r) => setTimeout(r, 200));
    }
    setSimulating(false);
  }

  const { head, tail } = coinImages[selectedCountry.code];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ImageBackground
          source={require('../assets/bg1.jpg')}
          style={{ flex: 1 }}
          resizeMode="cover">
          <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                BALANCE: {selectedCountry.symbol}
                {walletBalance.toFixed(2)}
              </Text>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                  <MaterialIcons name={muted ? 'volume-off' : 'volume-up'} size={24} color="#fff" />
                </TouchableOpacity>
                <UserDropdown username={username || userId} />
              </View>
            </View>

            {/* Main */}
            <View style={styles.content} pointerEvents={simulating ? 'none' : 'auto'}>
              <Text style={[styles.title, { color: colors.text }]}>🪙 Flip To Win</Text>
              {/* Coin */}
              <View style={{ marginVertical: 16 }}>
                <View style={styles.coinStage}>
                  <MotiView
                    from={{ rotateX: '0deg' }}
                    animate={{
                      rotateX: flipResult === 'HEAD' ? `${rotation}deg` : `${rotation + 180}deg`,
                      translateY: flipping ? -80 : 0,
                    }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={styles.coinWrapper}>
                    <Image source={head} style={styles.coinImage} />
                  </MotiView>
                  <MotiView
                    from={{ rotateX: '180deg' }}
                    animate={{
                      rotateX: flipResult === 'TAIL' ? `${rotation}deg` : `${rotation + 180}deg`,
                      translateY: flipping ? -40 : 0,
                    }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={[styles.coinWrapper, styles.backface]}>
                    <Image source={tail} style={styles.coinImage} />
                  </MotiView>
                </View>
                <MotiView
                  from={{ scaleX: 1.4, opacity: 0.6 }}
                  animate={{ scaleX: flipping ? 1 : 1.4, opacity: flipping ? 0.3 : 0.6 }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={styles.shadow}
                />
              </View>

              {/* Pending */}
              {currentBalance !== 0 && (
                <Text style={[styles.pending, { color: currentBalance > 0 ? '#0f0' : '#f55' }]}>
                  {currentBalance > 0 ? '+' : ''}
                  {selectedCountry.symbol}
                  {Math.abs(currentBalance).toFixed(2)} pending
                </Text>
              )}

              {/* Flags */}
              <View style={styles.countryRow}>
                {countryFlags.map((c) => (
                  <TouchableOpacity key={c.code} onPress={() => handleCountryChange(c)}>
                    <Image
                      source={c.flag}
                      style={[
                        styles.flag,
                        c.code === selectedCountry.code && {
                          borderColor: colors.primary,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount */}
              <Text style={[styles.label, { color: colors.text }]}>ENTER AMOUNT</Text>
              <TextInput
                value={amount}
                onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.amountInput}
              />

              {/* HEAD / TAIL */}
              <View style={styles.faceRow}>
                {(['HEAD', 'TAIL'] as const).map((face) => (
                  <MotiView
                    key={face}
                    from={{ scale: 1 }}
                    animate={{ scale: selectedFace === face ? 1.1 : 1 }}
                    transition={{ type: 'spring', damping: 10 }}>
                    <Button
                      mode={selectedFace === face ? 'contained' : 'outlined'}
                      onPress={() => setSelectedFace(face)}
                      style={[
                        styles.faceBtn,
                        selectedFace === face && { backgroundColor: '#FFC107' },
                      ]}
                      labelStyle={{
                        color: selectedFace === face ? '#000' : colors.text,
                        fontWeight: '700',
                      }}>
                      {face}
                    </Button>
                  </MotiView>
                ))}
              </View>

              {/* Actions + Countdown */}
              <View style={styles.actions}>
                <Text style={styles.timerLabel}>
                  Next auto–flip in{' '}
                  <Text style={[styles.timerCount, { color: colors.primary }]}>{countdown}s</Text>
                </Text>

                <MotiView
                  from={{ shadowRadius: 5, shadowOpacity: 0.4 }}
                  animate={{ shadowRadius: [5, 20, 5], shadowOpacity: [0.4, 0.8, 0.4] }}
                  transition={{ loop: true, type: 'timing', duration: 2000 }}
                  style={[styles.flipGlow, { shadowColor: colors.primary }]}>
                  <Button
                    mode="contained"
                    onPress={handleFlip}
                    disabled={flipping || simulating}
                    style={[styles.flipBtn, { backgroundColor: colors.primary }]}
                    labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>
                    BET
                  </Button>
                </MotiView>

                <Button
                  mode="outlined"
                  onPress={handleTakeout}
                  disabled={currentBalance === 0 || simulating}
                  style={styles.takeoutBtn}
                  labelStyle={styles.takeoutLabel}>
                  TAKEOUT
                </Button>
              </View>
            </View>
          </View>

          {/* Snackbar */}
          {snackbar.visible && (
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              style={styles.toastContainer}>
              <LinearGradient
                colors={['#FF6F91', '#FF9671']}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.toastGradient}>
                <Text style={styles.toastText}>{snackbar.message}</Text>
              </LinearGradient>
            </MotiView>
          )}
        </ImageBackground>
      </KeyboardAvoidingView>

      {showConfetti && <ConfettiCannon count={300} origin={{ x: screenWidth / 2, y: 0 }} fadeOut />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: H_PADDING },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingBottom: 8,
  },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginRight: 12 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' },
  title: { fontSize: 24, fontWeight: 'bold' },

  coinStage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    perspective: 1000,
    position: 'relative',
  },
  coinWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  backface: { zIndex: 0 },
  coinImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },

  shadow: {
    position: 'absolute',
    top: '100%',
    width: 140,
    height: 10,
    backgroundColor: '#00000040',
    borderRadius: 10,
    alignSelf: 'center',
  },

  pending: { fontSize: 16, fontWeight: '600' },

  countryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  flag: { width: 60, height: 40, borderWidth: 2, borderColor: 'transparent' },

  label: { marginBottom: 6 },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    width: '50%',
    textAlign: 'center',
    marginBottom: 12,
  },

  faceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
  },
  faceBtn: { width: 120, height: 48, borderRadius: 8, justifyContent: 'center' },

  actions: { width: '100%', alignItems: 'center' },
  timerLabel: { fontSize: 14, color: '#fff', marginBottom: 8, textAlign: 'center' },
  timerCount: { fontWeight: '700' },

  flipGlow: {
    width: '100%',
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 12,
  },
  flipBtn: { height: 48, borderRadius: 8, justifyContent: 'center' },

  takeoutBtn: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    borderColor: '#fff',
  },
  takeoutLabel: { color: '#fff', fontWeight: '600' },

  toastContainer: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  toastGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  toastText: { color: '#000', fontWeight: '700', fontSize: 16, textAlign: 'center' },
});
