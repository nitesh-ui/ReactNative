// screens/HomeScreen.tsx
import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
  Platform,
  BackHandler,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, useTheme, Snackbar } from 'react-native-paper';
import { MotiView } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import UserDropdown from 'components/UserDropdown';
import { AuthContext } from 'context/AuthContext';
import { SoundContext } from 'context/SoundContext';
import apiClient from 'api/client';

const MIN_BET = 15;
const { width: screenWidth } = Dimensions.get('window');

// map country code → head/tail images
const coinImages: Record<string, { head: any; tail: any }> = {
  IN: {
    head: require('../assets/in-head.png'),
    tail: require('../assets/in-tail.png'),
  },
  US: {
    head: require('../assets/us-head.png'),
    tail: require('../assets/us-tail.png'),
  },
  CH: {
    head: require('../assets/ch-head.png'),
    tail: require('../assets/ch-tail.png'),
  },
  JP: {
    head: require('../assets/jp-head.png'),
    tail: require('../assets/jp-tail.png'),
  },
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

  // Animation
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

  // Sounds
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);
  const [loseSound, setLoseSound] = useState<Audio.Sound | null>(null);

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Load initial wallet + current balances
  const fetchBalance = useCallback(async () => {
    try {
      const resp = await apiClient.post(
        '/balance/get-balance',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWalletBalance(resp.data.walletBalance);
      setCurrentBalance(resp.data.currentBalance);
    } catch (e) {
      setSnackbar({ visible: true, message: 'Could not fetch balance.' });
    }
  }, [userId, userToken]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Load sounds
  useEffect(() => {
    let fs: Audio.Sound, ws: Audio.Sound, ls: Audio.Sound;
    (async () => {
      fs = (await Audio.Sound.createAsync(require('../assets/sounds/coin-flip.mp3'))).sound;
      setFlipSound(fs);
      ws = (await Audio.Sound.createAsync(require('../assets/sounds/win-sound.mp3'))).sound;
      setWinSound(ws);
      ls = (await Audio.Sound.createAsync(require('../assets/sounds/lose-sound.mp3'))).sound;
      setLoseSound(ls);
    })();
    return () => {
      fs?.unloadAsync();
      ws?.unloadAsync();
      ls?.unloadAsync();
    };
  }, []);

  // Duck bg + play effect
  const playEffect = useCallback(
    async (effect: Audio.Sound | null) => {
      if (!bgSound || !effect) return;
      await bgSound.setVolumeAsync(0.2);
      effect.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          bgSound.setVolumeAsync(1.0);
          effect.setOnPlaybackStatusUpdate(null);
        }
      });
      await effect.replayAsync();
    },
    [bgSound]
  );

  // Android back with pending currentBalance
  useEffect(() => {
    const onBack = () => {
      if (currentBalance !== 0) {
        setSnackbar({ visible: true, message: 'Please takeout before exiting.' });
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [currentBalance]);

  // Flip
  const handleFlip = async () => {
    const bet = parseInt(amount, 10) || 0;
    if (bet < MIN_BET) {
      return setSnackbar({
        visible: true,
        message: `Minimum bet is ${selectedCountry.symbol}${MIN_BET}`,
      });
    }

    // Play flip SFX + spin
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
        // API returns { result, coinFlip, currentBalance, walletBalance, totalBalance }
        setFlipResult(data.coinFlip.toUpperCase());
        setCurrentBalance(data.currentBalance);
        setWalletBalance(data.walletBalance);

        // win/lose SFX + confetti
        const won = data.result === 'win';
        await playEffect(won ? winSound : loseSound);
        if (won) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (e) {
        setSnackbar({ visible: true, message: 'Could not play flip.' });
      } finally {
        setFlipping(false);
      }
    }, 800);
  };

  // Takeout
  const handleTakeout = async () => {
    if (currentBalance === 0) return;
    try {
      const { data } = await apiClient.post(
        '/balance/takeout',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWalletBalance(data.walletBalance);
      setCurrentBalance(data.currentBalance);
    } catch (e) {
      setSnackbar({ visible: true, message: 'Could not take out.' });
    }
  };

  // Change country
  const handleCountryChange = (c: (typeof countryFlags)[0]) => {
    setSelectedCountry(c);
    setAmount(`${c.value}`);
  };

  // choose coin image based on selectedCountry.code
  const { head, tail } = coinImages[selectedCountry.code] || {
    head: require('../assets/head.png'),
    tail: require('../assets/tail.png'),
  };

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
              <UserDropdown username={username ?? userId ?? ''} />
            </View>

            {/* Main */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>🪙 FLIP To Win</Text>

              {/* Coin */}
              <View style={{ marginVertical: 16 }}>
                <View style={styles.coinStage}>
                  <MotiView
                    from={{ rotateX: '0deg', translateY: 0 }}
                    animate={{
                      rotateX: flipResult === 'HEAD' ? `${rotation}deg` : `${rotation + 180}deg`,
                      translateY: flipping ? -80 : 0,
                    }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={styles.coinWrapper}>
                    <Image source={head} style={styles.coinImage} />
                  </MotiView>
                  <MotiView
                    from={{ rotateX: '180deg', translateY: 0 }}
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
                  animate={{
                    scaleX: flipping ? 1 : 1.4,
                    opacity: flipping ? 0.3 : 0.6,
                  }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={styles.shadow}
                />
              </View>

              {/* Current (pending) Balance */}
              {currentBalance !== 0 && (
                <Text style={[styles.pending, { color: currentBalance > 0 ? '#0f0' : '#f55' }]}>
                  {currentBalance > 0 ? '+' : ''}
                  {selectedCountry.symbol}
                  {Math.abs(currentBalance).toFixed(2)} pending
                </Text>
              )}

              {/* Country Picker */}
              <Text style={[styles.label, { color: colors.text }]}>SELECT COUNTRY</Text>
              <View style={styles.countryRow}>
                {countryFlags.map((c) => (
                  <TouchableOpacity key={c.code} onPress={() => handleCountryChange(c)}>
                    <Image
                      source={c.flag}
                      style={[
                        styles.flag,
                        c.code === selectedCountry.code && { borderColor: colors.primary },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Input */}
              <Text style={[styles.label, { color: colors.text }]}>ENTER AMOUNT</Text>
              <TextInput
                value={amount}
                onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.amountInput}
              />

              {/* HEAD / TAIL */}
              <View style={styles.faceRow}>
                <Button
                  mode={selectedFace === 'HEAD' ? 'contained' : 'outlined'}
                  onPress={() => setSelectedFace('HEAD')}
                  style={[styles.faceBtn, selectedFace === 'HEAD' && { backgroundColor: 'red' }]}
                  labelStyle={{ color: selectedFace === 'HEAD' ? '#fff' : colors.text }}>
                  HEAD
                </Button>
                <Button
                  mode={selectedFace === 'TAIL' ? 'contained' : 'outlined'}
                  onPress={() => setSelectedFace('TAIL')}
                  style={[styles.faceBtn, selectedFace === 'TAIL' && { backgroundColor: 'green' }]}
                  labelStyle={{ color: selectedFace === 'TAIL' ? '#fff' : colors.text }}>
                  TAIL
                </Button>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <Button
                  mode="outlined"
                  onPress={handleTakeout}
                  disabled={currentBalance === 0}
                  style={styles.actionBtn}
                  labelStyle={{ color: '#fff' }}>
                  Takeout
                </Button>
                <Button
                  mode="contained"
                  onPress={handleFlip}
                  disabled={flipping}
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  labelStyle={{ color: '#000', fontWeight: 'bold' }}>
                  FLIP
                </Button>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.bottomRow}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DepositScreen')}
                style={styles.bottomBtn}
                labelStyle={styles.bottomLabel}>
                DEPOSIT
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('WithdrawlScreen')}
                style={styles.bottomBtn}
                labelStyle={styles.bottomLabel}>
                WITHDRAW
              </Button>
            </View>
          </View>

          <Snackbar
            visible={snackbar.visible}
            onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
            duration={3000}>
            {snackbar.message}
          </Snackbar>
        </ImageBackground>
      </KeyboardAvoidingView>

      {showConfetti && <ConfettiCannon count={300} origin={{ x: screenWidth / 2, y: 0 }} fadeOut />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingHorizontal: 8,
  },
  content: { alignItems: 'center', width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  coinStage: {
    width: 280,
    height: 280,
    borderRadius: 140,
    perspective: 1000,
    position: 'relative',
  },
  coinWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    zIndex: 1,
  },
  backface: { zIndex: 0 },
  coinImage: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  shadow: {
    position: 'absolute',
    top: '100%',
    width: 160,
    height: 12,
    backgroundColor: '#00000040',
    borderRadius: 10,
    alignSelf: 'center',
  },
  pending: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  label: { marginBottom: 6 },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 4,
    marginBottom: 12,
  },
  flag: { width: 60, height: 40, borderWidth: 2, borderColor: 'transparent' },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    width: 200,
    textAlign: 'center',
    marginBottom: 12,
  },
  faceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  faceBtn: {
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  actionBtn: {
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    marginBottom: Platform.OS === 'ios' ? 16 : 8,
    gap: 8,
  },
  bottomBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
  },
  bottomLabel: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
});
