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
import { MotiView, MotiTransition } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio, AVPlaybackStatus } from 'expo-av';
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
import { useCurrency } from '../context/CurrencyContext';

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

// Define message types and interfaces
type MessageGroup = 'bet_result' | 'simulation' | 'takeout' | 'error' | 'info';
interface SnackbarMessage {
  id: string;
  message: string;
  group: MessageGroup;
  timestamp: number;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, userToken, username } = useContext(AuthContext);
  const { bgSound } = useContext(SoundContext);
  const { convertAmount, loading: currencyLoading, getDefaultAmount } = useCurrency();

  // Play effect under bg music with fixed type
  const playEffect = useCallback(
    async (effect: Audio.Sound | null) => {
      if (!bgSound || !effect) return;
      await bgSound.setVolumeAsync(0.2);
      effect.setOnPlaybackStatusUpdate((st: AVPlaybackStatus) => {
        if (!('error' in st) && st.isLoaded && st.didJustFinish) {
          bgSound.setVolumeAsync(1.0);
        }
      });
      await effect.replayAsync();
    },
    [bgSound]
  );

  // Add queued bet state at the top with other states
  const [queuedBet, setQueuedBet] = useState<{
    amount: number;
    face: 'HEAD' | 'TAIL';
    countryCode: string;
  } | null>(null);

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
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  // Sound effects
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);
  const [loseSound, setLoseSound] = useState<Audio.Sound | null>(null);

  // Confetti & snackbar
  const [showConfetti, setShowConfetti] = useState(false);
  const [snackbarMessages, setSnackbarMessages] = useState<SnackbarMessage[]>([]);

  // Prevent hardware back during flip/sim
  const [simulating, setSimulating] = useState(false);
  const flippingRef = useRef(flipping);
  useEffect(() => {
    flippingRef.current = flipping;
  }, [flipping]);

  // Countdown (drives simulation)
  const [countdown, setCountdown] = useState(10);

  // Generate random ID for fake wins
  const genId = () =>
    Array.from({ length: 6 })
      .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 36))
      .join('');

  // Generate multiple random IDs at once
  const genMultipleIds = (count: number) => {
    return Array.from({ length: count }, () => genId()).join(', ');
  };

  // Updated showSnackbar function to handle groups
  const showSnackbar = (message: string, group: MessageGroup = 'info') => {
    const newMessage: SnackbarMessage = {
      id: genId(),
      message,
      group,
      timestamp: Date.now(),
    };

    setSnackbarMessages((prev) => [...prev, newMessage]);

    // Remove message after timeout
    setTimeout(() => {
      setSnackbarMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    }, 3000);
  };

  // Helper to get group color
  const getGroupColor = (group: MessageGroup): [string, string] => {
    switch (group) {
      case 'bet_result':
        return ['#4CAF50', '#81C784']; // Green for user's bet results
      case 'simulation':
        return ['#2196F3', '#64B5F6']; // Blue for simulation results
      case 'takeout':
        return ['#9C27B0', '#BA68C8'];
      case 'error':
        return ['#F44336', '#E57373'];
      default:
        return ['#FF6F91', '#FF9671'];
    }
  };

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
      showSnackbar('Could not fetch balance.', 'error');
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

  // Animation configurations
  const timingConfig = {
    type: 'timing',
    duration: 1000,
    delay: 0,
  } as const;

  const springConfig = {
    type: 'spring',
    damping: 10,
    mass: 1,
    stiffness: 100,
  } as const;

  // Update displayed balances when currency changes
  const [displayBalance, setDisplayBalance] = useState(0);
  const [displayCurrentBalance, setDisplayCurrentBalance] = useState(0);

  useEffect(() => {
    const updateBalances = async () => {
      try {
        // Convert from INR to selected currency
        const convertedWallet = await convertAmount(walletBalance, 'IN', selectedCountry.code);
        const convertedCurrent = await convertAmount(currentBalance, 'IN', selectedCountry.code);
        setDisplayBalance(convertedWallet);
        setDisplayCurrentBalance(convertedCurrent);
      } catch (err) {
        console.error('Balance conversion error:', err);
        // Fallback to original values
        setDisplayBalance(walletBalance);
        setDisplayCurrentBalance(currentBalance);
      }
    };
    updateBalances();
  }, [walletBalance, currentBalance, selectedCountry.code, convertAmount]);

  // Country change handler with amount conversion
  const handleCountryChange = async (c: (typeof countryFlags)[0]) => {
    // Prevent country change if there's pending amount, active multiplier, or queued bet
    if (currentBalance !== 0 || multiplier > 1 || queuedBet) {
      showSnackbar('Cannot change currency while bet is in progress', 'error');
      return;
    }

    try {
      if (selectedCountry.code !== c.code && amount) {
        const convertedAmount = await convertAmount(
          parseInt(amount, 10),
          selectedCountry.code,
          c.code
        );
        setAmount(Math.round(convertedAmount).toString());
      }
      setSelectedCountry(c);
    } catch (err) {
      console.error('Amount conversion error:', err);
      setAmount(getDefaultAmount(c.code).toString());
      showSnackbar('Failed to convert amount. Using default value.', 'error');
    }
  };

  // Update handleFlip to use bet_result group for queued bet message
  const handleFlip = async () => {
    const localBet = parseInt(amount, 10) || 0;
    const multipliedBet = localBet * multiplier;

    if (localBet < MIN_BET) {
      showSnackbar(`Min bet is ${selectedCountry.symbol}${MIN_BET}`, 'error');
      return;
    }

    const availableBalance = walletBalance - Math.abs(currentBalance);
    if (multipliedBet > availableBalance) {
      showSnackbar(
        `Insufficient balance. Available: ${selectedCountry.symbol}${availableBalance}`,
        'error'
      );
      return;
    }

    if (queuedBet) {
      showSnackbar('A bet is already queued', 'error');
      return;
    }

    setQueuedBet({
      amount: multipliedBet,
      face: selectedFace,
      countryCode: selectedCountry.code,
    });

    showSnackbar(
      `Bet queued! ${selectedCountry.symbol}${localBet}${multiplier > 1 ? ` (X${multiplier} = ${selectedCountry.symbol}${multipliedBet})` : ''} will execute in ${countdown} seconds`,
      'bet_result'
    );
  };

  // Update simulation messages
  const showSimulationWin = (id: string) => {
    showSnackbar(`${id} won!`, 'simulation');
  };

  // Add loading state for takeout
  const [takeoutLoading, setTakeoutLoading] = useState(false);

  // Modify takeout handler
  const handleTakeout = async () => {
    if (!currentBalance) return;
    setTakeoutLoading(true);
    try {
      const { data } = await apiClient.post(
        '/balance/takeout',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWalletBalance(data.walletBalance);
      setCurrentBalance(data.currentBalance);

      setMultiplier(1);
      setConsecutiveWins(0);

      showSnackbar('Successfully claimed your winnings!', 'takeout');
    } catch {
      showSnackbar('Failed to claim winnings. Please try again.', 'error');
    } finally {
      setTakeoutLoading(false);
    }
  };

  const { head, tail } = coinImages[selectedCountry.code];

  // Update countdown effect to handle simulation results better
  useEffect(() => {
    if (countdown === 0) {
      const executeSimulation = async () => {
        if (!queuedBet) {
          // No bet queued - just do animation and simulation
          await flipSound?.replayAsync();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setFlipping(true);
          setRotation((r) => r + 720);

          // Random result for animation
          setFlipResult(Math.random() > 0.5 ? 'HEAD' : 'TAIL');

          // Wait for flip animation
          await new Promise((resolve) => setTimeout(resolve, 800));
          setFlipping(false);

          // Run fake wins simulation with single message
          setSimulating(true);
          showSnackbar(`Recent Winners: ${genMultipleIds(5)}`, 'simulation');
          await new Promise((r) => setTimeout(r, 3000));
          setSimulating(false);
        } else {
          // Execute real bet
          try {
            // Convert multiplied bet to INR for server
            const inrBet = await convertAmount(queuedBet.amount, queuedBet.countryCode, 'IN');

            // Start animation
            await flipSound?.replayAsync();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setFlipping(true);
            setRotation((r) => r + 720);

            try {
              // Make API call while animation is running
              const { data } = await apiClient.post(
                '/play/flip',
                {
                  userId,
                  face: queuedBet.face.toLowerCase(),
                  amount: Math.round(inrBet),
                },
                { headers: { Authorization: `Bearer ${userToken}` } }
              );

              // Wait for flip animation to complete
              await new Promise((resolve) => setTimeout(resolve, 800));

              // Update game state
              setFlipResult(data.coinFlip.toUpperCase());
              setCurrentBalance(data.currentBalance);
              setWalletBalance(data.walletBalance);

              // Complete animation
              setFlipping(false);

              const won = data.result === 'win';
              if (won) {
                setConsecutiveWins((prev) => {
                  const newWins = prev + 1;
                  // Update multiplier based on consecutive wins
                  if (newWins === 1) setMultiplier(2);
                  else if (newWins === 2) setMultiplier(5);
                  else if (newWins >= 3) setMultiplier(10);
                  return newWins;
                });
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);

                // Show user's bet result
                showSnackbar(
                  `You won! ${selectedCountry.symbol}${queuedBet.amount} on ${queuedBet.face}`,
                  'bet_result'
                );
              } else {
                // Reset on loss
                setConsecutiveWins(0);
                setMultiplier(1);

                // Show user's bet result
                showSnackbar(
                  `You lost ${selectedCountry.symbol}${queuedBet.amount} on ${queuedBet.face}`,
                  'bet_result'
                );
              }
              await playEffect(won ? winSound : loseSound);

              // Run fake wins simulation after real bet with single message
              setSimulating(true);
              showSnackbar(`Recent Winners: ${genMultipleIds(5)}`, 'simulation');
              await new Promise((r) => setTimeout(r, 3000));
              setSimulating(false);
            } catch (error) {
              // Ensure animation completes even on error
              await new Promise((resolve) => setTimeout(resolve, 800));
              setFlipping(false);
              showSnackbar('Could not play flip.', 'error');
            } finally {
              setQueuedBet(null); // Clear the queued bet
            }
          } catch (err) {
            console.error('Bet conversion error:', err);
            showSnackbar('Currency conversion failed.', 'error');
            setQueuedBet(null); // Clear the queued bet on error
            // Ensure animation completes on conversion error
            await new Promise((resolve) => setTimeout(resolve, 800));
            setFlipping(false);
          }
        }

        setCountdown(10); // Reset timer after execution
      };

      executeSimulation();
    } else {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [
    countdown,
    queuedBet,
    convertAmount,
    flipSound,
    playEffect,
    winSound,
    loseSound,
    userToken,
    userId,
    selectedCountry.symbol,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                BALANCE: {selectedCountry.symbol}
                {displayBalance.toFixed(2)}
                {currencyLoading && ' (updating...)'}
              </Text>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                  <MaterialIcons name={muted ? 'volume-off' : 'volume-up'} size={24} color="#fff" />
                </TouchableOpacity>
                <UserDropdown username={username || userId || 'USER'} />
              </View>
            </View>

            {/* Main */}
            <View style={styles.content} pointerEvents={simulating ? 'none' : 'auto'}>
              <Text style={[styles.title, { color: '#fff' }]}>🪙 Flip To Win</Text>
              {/* Coin */}
              <View style={{ marginVertical: 16 }}>
                <View style={styles.coinStage}>
                  <MotiView
                    from={{ rotateX: '0deg' }}
                    animate={{
                      rotateX: flipResult === 'HEAD' ? `${rotation}deg` : `${rotation + 180}deg`,
                      translateY: flipping ? -80 : 0,
                    }}
                    transition={timingConfig}
                    style={styles.coinWrapper}>
                    <Image source={head} style={styles.coinImage} />
                  </MotiView>
                  <MotiView
                    from={{ rotateX: '180deg' }}
                    animate={{
                      rotateX: flipResult === 'TAIL' ? `${rotation}deg` : `${rotation + 180}deg`,
                      translateY: flipping ? -40 : 0,
                    }}
                    transition={timingConfig}
                    style={[styles.coinWrapper, styles.backface]}>
                    <Image source={tail} style={styles.coinImage} />
                  </MotiView>
                </View>
                <MotiView
                  from={{ scaleX: 1.4, opacity: 0.6 }}
                  animate={{ scaleX: flipping ? 1 : 1.4, opacity: flipping ? 0.3 : 0.6 }}
                  transition={timingConfig}
                  style={styles.shadow}
                />
              </View>

              {/* Pending */}
              {currentBalance !== 0 && (
                <Text style={[styles.pending, { color: currentBalance > 0 ? '#0f0' : '#f55' }]}>
                  {currentBalance > 0 ? '+' : ''}
                  {selectedCountry.symbol}
                  {Math.abs(displayCurrentBalance).toFixed(2)} pending
                </Text>
              )}

              {/* Add queued bet indicator with multiplied amount */}
              {queuedBet && (
                <Text style={[styles.pending, { color: '#FFC107' }]}>
                  Queued bet: {selectedCountry.symbol}
                  {parseInt(amount, 10)}
                  {multiplier > 1
                    ? ` (X${multiplier} = ${selectedCountry.symbol}${queuedBet.amount})`
                    : ''}{' '}
                  on {queuedBet.face}
                </Text>
              )}

              {/* Flags */}
              <View style={styles.countryRow}>
                {countryFlags.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => handleCountryChange(c)}
                    disabled={Boolean(currentBalance !== 0 || multiplier > 1 || queuedBet)}
                    style={{
                      opacity: currentBalance !== 0 || multiplier > 1 || queuedBet ? 0.5 : 1,
                    }}>
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
              <Text style={[styles.label, { color: '#fff' }]}>ENTER AMOUNT</Text>
              <View style={[styles.amountContainer, { justifyContent: 'center' }]}>
                <TextInput
                  value={amount}
                  onChangeText={(t) =>
                    !queuedBet && multiplier === 1 ? setAmount(t.replace(/[^0-9]/g, '')) : null
                  }
                  keyboardType="numeric"
                  style={[
                    styles.amountInput,
                    (queuedBet || multiplier > 1) && styles.disabledInput,
                  ]}
                  editable={!queuedBet && multiplier === 1}
                />
                {multiplier > 1 && (
                  <MotiView
                    from={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    style={styles.multiplierContainer}>
                    <Text style={styles.multiplierText}>X {multiplier}</Text>
                  </MotiView>
                )}
              </View>

              {/* HEAD / TAIL */}
              <View style={styles.faceRow}>
                {(['HEAD', 'TAIL'] as const).map((face) => (
                  <MotiView
                    key={face}
                    from={{ scale: 1 }}
                    animate={{ scale: selectedFace === face ? 1.1 : 1 }}
                    transition={springConfig}>
                    <Button
                      mode={selectedFace === face ? 'contained' : 'outlined'}
                      onPress={() => setSelectedFace(face)}
                      disabled={queuedBet !== null || simulating || flipping}
                      style={[
                        styles.faceBtn,
                        selectedFace === face && { backgroundColor: '#FFC107' },
                        (queuedBet !== null || simulating || flipping) && styles.disabledButton,
                      ]}
                      labelStyle={{
                        color: selectedFace === face ? '#000' : '#fff',
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
                  {queuedBet ? `Executing bet in ${countdown}s` : `Next auto-flip in ${countdown}s`}
                </Text>

                <MotiView
                  from={{ shadowRadius: 5, shadowOpacity: 0.4 }}
                  animate={{ shadowRadius: [5, 20, 5], shadowOpacity: [0.4, 0.8, 0.4] }}
                  transition={{ ...timingConfig, loop: true, duration: 2000 }}
                  style={[styles.flipGlow, { shadowColor: colors.primary }]}>
                  <Button
                    mode="contained"
                    onPress={handleFlip}
                    disabled={flipping || simulating || queuedBet !== null}
                    style={[
                      styles.flipBtn,
                      { backgroundColor: colors.primary },
                      (flipping || simulating || queuedBet !== null) && styles.disabledButton,
                    ]}
                    labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>
                    BET
                  </Button>
                </MotiView>

                <Button
                  mode="outlined"
                  onPress={handleTakeout}
                  disabled={currentBalance === 0 || simulating || flipping || takeoutLoading}
                  loading={takeoutLoading}
                  style={[
                    styles.takeoutBtn,
                    (currentBalance === 0 || simulating || flipping || takeoutLoading) &&
                      styles.disabledButton,
                  ]}
                  labelStyle={styles.takeoutLabel}>
                  {takeoutLoading ? 'CLAIMING...' : 'TAKEOUT'}
                </Button>
              </View>
            </View>
          </View>

          {/* Stacked Snackbars */}
          <View style={styles.snackbarContainer}>
            {snackbarMessages.map((msg) => (
              <MotiView
                key={msg.id}
                from={{ scale: 0.8, opacity: 0, translateY: -20 }}
                animate={{ scale: 1, opacity: 1, translateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, translateY: -20 }}
                transition={{ type: 'spring', damping: 10 }}
                style={styles.toastContainer}>
                <LinearGradient
                  colors={getGroupColor(msg.group)}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={styles.toastGradient}>
                  <Text style={styles.toastText}>{msg.message}</Text>
                </LinearGradient>
              </MotiView>
            ))}
          </View>

          {showConfetti && (
            <ConfettiCannon count={300} origin={{ x: screenWidth / 2, y: 0 }} fadeOut />
          )}
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
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
    transform: [{ perspective: 1000 }],
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    width: '50%',
    textAlign: 'center',
    marginBottom: 0,
    height: 48,
  },
  multiplierContainer: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiplierText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
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

  snackbarContainer: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    gap: 8, // Space between stacked messages
  },
  toastContainer: {
    width: '90%',
    maxWidth: 400,
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
  disabledInput: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#666',
  },
});
