// screens/WithdrawalScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import GradientButton from '../components/GradientButton';
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import CoinLoader from '../components/CoinLoader';
import UserDropdown from '../components/UserDropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from 'api/client';

export default function WithdrawalScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, username } = useContext(AuthContext);

  // Extracted state
  const [account, setAccount] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');

  const [fields, setFields] = useState({
    name: '',
    bank: '',
    ifsc: '',
    amount: '',
    upi: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (snackbar.visible) {
      const t = setTimeout(() => setSnackbar((s) => ({ ...s, visible: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar.visible]);

  const handleChange = (key: string, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
    setShake((s) => ({ ...s, [key]: false }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const s: Record<string, boolean> = {};

    if (!fields.name.trim()) {
      e.name = 'Required';
      s.name = true;
    }
    if (!fields.bank.trim()) {
      e.bank = 'Required';
      s.bank = true;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(fields.ifsc)) {
      e.ifsc = 'Invalid';
      s.ifsc = true;
    }
    if (!account) {
      e.account = 'Required';
      s.account = true;
    }
    if (confirmAccount !== account) {
      e.confirmAccount = 'No match';
      s.confirmAccount = true;
    }
    if (!fields.amount || isNaN(Number(fields.amount))) {
      e.amount = 'Invalid';
      s.amount = true;
    }

    setErrors(e);
    setShake(s);
    setTimeout(() => setShake({}), 500);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const resp = await apiClient.post('/withdraw/request', {
        userId,
        name: fields.name,
        bankName: fields.bank,
        ifscCode: fields.ifsc,
        accountNumber: account,
        confirmAccountNumber: confirmAccount,
        withdrawalAmount: Number(fields.amount),
        upiId: fields.upi || undefined,
      });

      setSuccessAnim(true);
      setSnackbar({ visible: true, message: resp.data.msg, type: 'success' });

      // Reset form
      setFields({
        name: '',
        bank: '',
        ifsc: '',
        amount: '',
        upi: '',
      });
      setAccount('');
      setConfirmAccount('');
      setTimeout(() => setSuccessAnim(false), 2000);
    } catch (err: any) {
      console.error(err);
      setSnackbar({
        visible: true,
        message: err.message || 'Submission failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground source={require('../assets/bg1.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <UserDropdown username={username ?? userId} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 600 }}
              style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>💸 Withdrawal</Text>
            </MotiView>

            <FloatingInput
              label="Full Name"
              iconName="user"
              value={fields.name}
              onChangeText={(t) => handleChange('name', t)}
              error={errors.name}
              shake={shake.name}
            />
            <FloatingInput
              label="Bank Name"
              iconName="home"
              value={fields.bank}
              onChangeText={(t) => handleChange('bank', t)}
              error={errors.bank}
              shake={shake.bank}
            />
            <FloatingInput
              label="IFSC Code"
              iconName="hash"
              value={fields.ifsc}
              onChangeText={(t) => handleChange('ifsc', t.toUpperCase())}
              autoCapitalize="characters"
              error={errors.ifsc}
              shake={shake.ifsc}
            />
            <FloatingInput
              label="Account No."
              iconName="credit-card"
              value={account}
              onChangeText={(t) => {
                setAccount(t);
                setErrors((e) => ({ ...e, account: '' }));
                setShake((s) => ({ ...s, account: false }));
              }}
              keyboardType="number-pad"
              error={errors.account}
              shake={shake.account}
            />
            <FloatingInput
              label="Confirm Account"
              iconName="check-square"
              value={confirmAccount}
              onChangeText={(t) => {
                setConfirmAccount(t);
                setErrors((e) => ({ ...e, confirmAccount: '' }));
                setShake((s) => ({ ...s, confirmAccount: false }));
              }}
              keyboardType="number-pad"
              error={errors.confirmAccount}
              shake={shake.confirmAccount}
            />
            <FloatingInput
              label="Amount"
              iconName="dollar-sign"
              value={fields.amount}
              onChangeText={(t) => handleChange('amount', t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              error={errors.amount}
              shake={shake.amount}
            />
            <FloatingInput
              label="UPI ID (Optional)"
              iconName="shopping-cart"
              value={fields.upi}
              onChangeText={(t) => handleChange('upi', t)}
            />

            <GradientButton onPress={handleSubmit} loading={loading} disabled={loading}>
              Submit Withdrawal
            </GradientButton>
          </ScrollView>

          {successAnim && (
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 500 }}
              style={styles.checkmark}>
              <Text style={styles.checkIcon}>✓</Text>
            </MotiView>
          )}

          <AnimatedSnackbar
            visible={snackbar.visible}
            type={snackbar.type}
            message={snackbar.message}
            onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
          />

          <CoinLoader visible={loading} />
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 100,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '600',
  },
});
