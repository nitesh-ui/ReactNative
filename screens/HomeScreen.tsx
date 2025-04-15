import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';

const countryFlags = [
  { code: 'IN', symbol: '₹', value: 30, flag: require('../assets/in.png') },
  { code: 'AU', symbol: '$', value: 30, flag: require('../assets/au.png') },
  { code: 'CA', symbol: '$', value: 30, flag: require('../assets/ca.png') },
  { code: 'PK', symbol: 'Rs', value: 5000, flag: require('../assets/pk.png') },
  { code: 'SE', symbol: 'kr', value: 300, flag: require('../assets/se.png') },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const [selectedFace, setSelectedFace] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [flipResult, setFlipResult] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [flipping, setFlipping] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryFlags[0]);
  const [amount, setAmount] = useState(selectedCountry.value.toString());
  const [rotation, setRotation] = useState(0);
  const [balance, setBalance] = useState(100);

  const handleFlip = () => {
    const amt = parseFloat(amount);
    if (amt < 15) return alert('Minimum bet is $15');
    if (amt > balance) return alert('Insufficient Balance');

    const newFace = Math.random() > 0.5 ? 'HEAD' : 'TAIL';
    setFlipping(true);
    setRotation((prev) => prev + 720);
    setTimeout(() => {
      setFlipResult(newFace);
      setFlipping(false);
      const won = selectedFace === newFace;
      setBalance((prev) => prev + (won ? amt : -amt));
    }, 1000);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setAmount(country.value.toString());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: Platform.OS === 'ios' ? 16 : 8,
            paddingTop: 8,
          }}>
          {/* Top Bar */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 8,
            }}>
            <View style={{ backgroundColor: '#ffffff22', padding: 8, borderRadius: 8 }}>
              <Text style={{ color: 'white' }}>👤 USER9801</Text>
            </View>
            <View style={{ backgroundColor: '#ffffff22', padding: 8, borderRadius: 8 }}>
              <Text style={{ color: 'white' }}>
                BALANCE: {selectedCountry.symbol}
                {balance.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Middle Content */}
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 12,
              }}>
              🪙 FLIP A COIN
            </Text>

            {/* Coin */}
            <View style={{ position: 'relative', marginVertical: 16 }}>
              <View style={{ width: 280, height: 280, borderRadius: 140, perspective: 1000 }}>
                <MotiView
                  from={{ rotateX: '0deg', translateY: 0 }}
                  animate={{
                    rotateX: flipResult === 'HEAD' ? `${rotation}deg` : `${rotation + 180}deg`,
                    translateY: flipping ? -40 : 0,
                  }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backfaceVisibility: 'hidden',
                    zIndex: 1,
                  }}>
                  <Image
                    source={require('../assets/head.png')}
                    style={{ width: '100%', height: '100%', borderRadius: 140 }}
                    resizeMode="contain"
                  />
                </MotiView>

                <MotiView
                  from={{ rotateX: '180deg', translateY: 0 }}
                  animate={{
                    rotateX: flipResult === 'TAIL' ? `${rotation}deg` : `${rotation + 180}deg`,
                    translateY: flipping ? -40 : 0,
                  }}
                  transition={{ type: 'timing', duration: 1000 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backfaceVisibility: 'hidden',
                    zIndex: 0,
                  }}>
                  <Image
                    source={require('../assets/tail.png')}
                    style={{ width: '100%', height: '100%', borderRadius: 140 }}
                    resizeMode="contain"
                  />
                </MotiView>
              </View>

              {/* Shadow */}
              <MotiView
                from={{ scaleX: 1.4, opacity: 0.6 }}
                animate={{
                  scaleX: flipping ? 1 : 1.4,
                  opacity: flipping ? 0.3 : 0.6,
                }}
                transition={{ type: 'timing', duration: 1000 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  width: 160,
                  height: 12,
                  backgroundColor: '#00000040',
                  borderRadius: 10,
                  zIndex: -1,
                  alignSelf: 'center',
                }}
              />
            </View>

            {/* Country Picker */}
            <Text style={{ color: colors.text, marginBottom: 6 }}>SELECT COUNTRY</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                flexWrap: 'wrap',
                rowGap: 8,
                columnGap: 4,
                marginBottom: 12,
              }}>
              {countryFlags.map((c) => (
                <TouchableOpacity key={c.code} onPress={() => handleCountryChange(c)}>
                  <Image
                    source={c.flag}
                    style={{
                      width: 60,
                      height: 40,
                      borderWidth: selectedCountry.code === c.code ? 2 : 0,
                      borderColor: colors.primary,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount */}
            <Text style={{ color: colors.text, marginBottom: 6 }}>ENTER AMOUNT</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 12,
                fontSize: 18,
                width: 200,
                textAlign: 'center',
                marginBottom: 12,
              }}
            />

            {/* HEAD / TAIL Buttons */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <Button
                mode={selectedFace === 'HEAD' ? 'contained' : 'outlined'}
                onPress={() => setSelectedFace('HEAD')}
                style={{
                  backgroundColor: selectedFace === 'HEAD' ? 'red' : 'transparent',
                  borderRadius: 16,
                  borderWidth: 2,
                }}
                labelStyle={{ color: selectedFace === 'HEAD' ? '#fff' : colors.text }}>
                HEAD
              </Button>

              <Button
                mode={selectedFace === 'TAIL' ? 'contained' : 'outlined'}
                onPress={() => setSelectedFace('TAIL')}
                style={{
                  backgroundColor: selectedFace === 'TAIL' ? 'green' : 'transparent',
                  borderRadius: 16,
                  borderWidth: 2,
                }}
                labelStyle={{ color: selectedFace === 'TAIL' ? '#fff' : colors.text }}>
                TAIL
              </Button>
            </View>

            {/* Flip / Takeout */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={{
                  borderRadius: 16,
                  borderColor: colors.primary,
                  borderWidth: 2,
                  paddingHorizontal: 12,
                }}
                labelStyle={{ color: colors.primary }}>
                Takeout
              </Button>

              <Button
                mode="contained"
                onPress={handleFlip}
                style={{ backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 20 }}
                labelStyle={{ fontWeight: 'bold', color: '#000' }}>
                FLIP
              </Button>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              width: '100%',
              gap: 12,
              marginTop: 12,
            }}>
            {['DEPOSIT', 'WITHDRAWAL', 'MY ACCOUNT'].map((label) => (
              <Button
                key={label}
                mode="outlined"
                style={{
                  flex: 1,
                  minWidth: 100,
                  borderRadius: 14,
                  borderColor: '#FF6F91',
                  backgroundColor: '#ffffff10',
                }}
                labelStyle={{ color: '#FF6F91', fontWeight: '600' }}>
                {label}
              </Button>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
