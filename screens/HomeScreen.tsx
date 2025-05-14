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
import { Button, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

import UserDropdown from 'components/UserDropdown';
import { AuthContext } from 'context/AuthContext';
import { SoundContext } from 'context/SoundContext';
import apiClient from 'api/client'; // ← your axios instance

const MIN_BET = 15;
const { width: screenWidth } = Dimensions.get('window');

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

  // --- Animation state ---
  const [selectedFace, setSelectedFace] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [flipResult, setFlipResult] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [flipping, setFlipping] = useState(false);
  const [rotation, setRotation] = useState(0);

  // --- Wallet buckets ---
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [pendingDelta, setPendingDelta] = useState(0);

  // --- UI ---
  const [selectedCountry, setSelectedCountry] = useState(countryFlags[0]);
  const [amount, setAmount] = useState(`${countryFlags[0].value}`);

  // --- Sounds ---
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);
  const [loseSound, setLoseSound] = useState<Audio.Sound | null>(null);

  // --- Confetti ---
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Load initial balance from server ---
  const fetchBalance = useCallback(async () => {
    try {
      const resp = await apiClient.post(
        '/balance/get-balance',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log('get balance ', resp.data);
      // assume resp.data.balance is the user’s actual wallet
      setAvailableBalance(resp.data.walletBalance);
    } catch (e) {
      console.error('fetchBalance error', e);
      Alert.alert('Error', 'Could not fetch balance');
    }
  }, [userId, userToken]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // --- Load flip/win/lose sounds once ---
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

  // --- Duck bg & play effect ---
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

  // --- Android back: prompt if pending ---
  useEffect(() => {
    const onBack = () => {
      if (pendingDelta !== 0) {
        Alert.alert('Unsettled Bet', 'You have a pending result. Takeout now?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Takeout & Exit',
            onPress: async () => {
              await apiClient.post(
                '/balance/takeout',
                { userId },
                { headers: { Authorization: `Bearer ${userToken}` } }
              );
              await fetchBalance();
              setPendingDelta(0);
              BackHandler.exitApp();
            },
          },
        ]);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [pendingDelta, userId, userToken, fetchBalance]);

  // --- Flip handler (server‐backed) ---
  const handleFlip = async () => {
    const bet = parseInt(amount, 10) || 0;
    if (bet < MIN_BET) {
      return Alert.alert(`Minimum bet is ${selectedCountry.symbol}${MIN_BET}`);
    }
    // if (bet > availableBalance) {
    //   return Alert.alert('Insufficient Balance');
    // }

    // 1) Lock locally for UI
    setAvailableBalance((a) => a - bet);
    setLockedBalance((l) => l + bet);

    // 2) Play flip SFX
    await flipSound?.replayAsync();

    // 3) Haptics + spin
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const face = selectedFace.toLowerCase();
    setFlipping(true);
    setRotation((r) => r + 720);

    // 4) Call server
    setTimeout(async () => {
      try {
        const { data } = await apiClient.post(
          '/play/flip',
          { userId, face, amount: bet },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        console.log('flip result', data);
        // assume server returns { result:'HEAD'|'TAIL', balance: number, win: boolean }
        setFlipResult(data.result.toUpperCase() as 'HEAD' | 'TAIL');
        setAvailableBalance(data.balance);
        setLockedBalance(0);
        setPendingDelta((pd) => pd + (data.win ? bet : -bet));

        // SFX & confetti
        await playEffect(data.win ? winSound : loseSound);
        if (data.win) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (e) {
        console.error('flip error', e);
        Alert.alert('Error', 'Could not play flip');
        // rollback UI
        setAvailableBalance((a) => a + bet);
        setLockedBalance(0);
      } finally {
        setFlipping(false);
      }
    }, 800);
  };

  // --- Takeout handler (server‐backed) ---
  const handleTakeout = async () => {
    if (pendingDelta === 0) return;
    try {
      await apiClient.post(
        '/balance/takeout',
        { userId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      await fetchBalance();
      setPendingDelta(0);
    } catch (e) {
      console.error('takeout error', e);
      Alert.alert('Error', 'Could not take out');
    }
  };

  // --- Country switch & sanitize ---
  const handleCountryChange = (c: (typeof countryFlags)[0]) => {
    setSelectedCountry(c);
    setAmount(`${c.value}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ImageBackground
          source={require('../assets/bg1.jpg')}
          style={{ flex: 1 }}
          resizeMode="cover">
          <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.balanceBox}>
                <Text style={{ color: '#fff' }}>
                  BALANCE: {selectedCountry.symbol}
                  {availableBalance.toFixed(2)}
                </Text>
                <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>
                  Locked: {selectedCountry.symbol}
                  {lockedBalance.toFixed(2)}
                </Text>
              </View>
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
                    <Image source={require('../assets/head.png')} style={styles.coinImage} />
                  </MotiView>
                  <MotiView
                    from={{ rotateX: '180deg', translateY: 0 }}
                    animate={{
                      rotateX: flipResult === 'TAIL' ? `${rotation}deg` : `${rotation + 180}deg`,
                      translateY: flipping ? -40 : 0,
                    }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={[styles.coinWrapper, styles.backface]}>
                    <Image source={require('../assets/tail.png')} style={styles.coinImage} />
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

              {/* Pending */}
              {pendingDelta !== 0 && (
                <Text style={[styles.pending, { color: pendingDelta > 0 ? '#0f0' : '#f55' }]}>
                  {pendingDelta > 0 ? '+' : ''}
                  {selectedCountry.symbol}
                  {Math.abs(pendingDelta).toFixed(2)} pending
                </Text>
              )}

              {/* Country */}
              <Text style={[styles.label, { color: colors.text }]}>SELECT COUNTRY</Text>
              <View style={styles.countryRow}>
                {countryFlags.map((c) => (
                  <TouchableOpacity key={c.code} onPress={() => handleCountryChange(c)}>
                    <Image
                      source={c.flag}
                      style={[
                        styles.flag,
                        selectedCountry.code === c.code && { borderColor: colors.primary },
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

              {/* HEAD/TAIL */}
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
                  disabled={pendingDelta === 0}
                  style={styles.actionBtn}
                  labelStyle={{ color: colors.primary }}>
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
                mode="outlined"
                style={styles.bottomBtn}
                contentStyle={styles.bottomContent}
                labelStyle={styles.bottomLabel}
                onPress={() => navigation.navigate('DepositScreen')}>
                DEPOSIT
              </Button>
              <Button
                mode="outlined"
                style={styles.bottomBtn}
                contentStyle={styles.bottomContent}
                labelStyle={styles.bottomLabel}
                onPress={() => navigation.navigate('WithdrawlScreen')}>
                WITHDRAW
              </Button>
            </View>
          </View>
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
  balanceBox: { backgroundColor: '#ffffff22', padding: 8, borderRadius: 8 },
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
  faceRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  faceBtn: { borderRadius: 16, borderWidth: 2, flex: 1, marginHorizontal: 8 },
  actionRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionBtn: { borderRadius: 16, paddingHorizontal: 20 },
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
    borderColor: '#FF6F91',
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 4,
  },
  bottomLabel: { color: '#FF6F91', fontWeight: '600', fontSize: 13 },
});
