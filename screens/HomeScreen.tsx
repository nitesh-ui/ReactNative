import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

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
      console.log(won ? '🎉 You Won!' : '💸 You Lost!');
    }, 1000);
  };

  const handleTakeout = () => {
    console.log('💸 Takeout triggered!');
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setAmount(country.value.toString());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          padding: 16,
          paddingTop: 36,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
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

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
          🪙 FLIP A COIN
        </Text>

        {/* Coin with realistic 3D flip and shadow */}
        <View style={{ position: 'relative', marginVertical: 32, alignItems: 'center' }}>
          {/* Soft ambient circular shadow */}

          <MotiView
            from={{ rotateX: '0deg', translateY: 0, scale: 1 }}
            animate={{
              rotateX: `${rotation}deg`,
              translateY: flipping ? -40 : 0,
              scale: flipping ? 1.1 : 1,
            }}
            transition={{ type: 'timing', duration: 1000 }}
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              overflow: 'hidden',
              backgroundColor: 'transparent',
              backfaceVisibility: 'hidden',
            }}>
            <Image
              source={
                flipResult === 'HEAD'
                  ? require('../assets/head.png')
                  : require('../assets/tail.png')
              }
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 140,
              }}
              resizeMode="contain"
            />
          </MotiView>

          {/* Ground shadow below the coin */}
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
            }}
          />
        </View>

        {/* Country Selector */}
        <Text style={{ color: colors.text, marginBottom: 6 }}>SELECT COUNTRY</Text>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginBottom: 16,
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
            marginBottom: 16,
          }}
        />

        {/* HEAD / TAIL */}
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

        {/* FLIP / TAKEOUT */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          <Button
            mode="outlined"
            onPress={handleTakeout}
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
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingHorizontal: 20,
              transform: [{ scale: flipping ? 1.1 : 1 }],
            }}
            labelStyle={{ fontWeight: 'bold', color: '#000' }}>
            FLIP
          </Button>
        </View>

        {/* Bottom Nav Buttons */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            width: '100%',
            gap: 12,
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
