import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import AnimatedSnackbar from 'components/AnimatedSnackbar';
import UserDropdown from 'components/UserDropdown';

export default function WithdrawalScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [fields, setFields] = useState({
    name: '',
    bank: '',
    ifsc: '',
    account: '',
    confirmAccount: '',
    amount: '',
    upi: '',
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState({});
  const [loading, setLoading] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('green');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setShake((prev) => ({ ...prev, [field]: false }));
  };

  const validate = () => {
    const newErrors = {};
    const newShake = {};

    if (!fields.name.trim()) newErrors.name = 'Name is required';
    if (!fields.bank.trim()) newErrors.bank = 'Bank name is required';
    if (!fields.ifsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) newErrors.ifsc = 'Invalid IFSC code';
    if (!fields.account) newErrors.account = 'Account number required';
    if (fields.confirmAccount !== fields.account)
      newErrors.confirmAccount = 'Account numbers do not match';
    if (!fields.amount || isNaN(fields.amount)) newErrors.amount = 'Enter valid amount';

    Object.keys(newErrors).forEach((key) => (newShake[key] = true));

    setErrors(newErrors);
    setShake(newShake);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await new Promise((res) => setTimeout(res, 2000));

        setSnackbarMsg('Withdrawal request submitted successfully!');
        setSnackbarColor('#4CAF50');
        setSnackbarType('success');
        setSnackbarVisible(true);
        setSuccessAnim(true);

        setFields({
          name: '',
          bank: '',
          ifsc: '',
          account: '',
          confirmAccount: '',
          amount: '',
          upi: '',
        });

        setTimeout(() => setSuccessAnim(false), 2000);
      } catch (error) {
        setSnackbarMsg('Failed to submit withdrawal. Please try again.');
        setSnackbarColor('#f44336');
        setSnackbarType('error');
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }

      setTimeout(() => {
        setSnackbarVisible(false);
      }, 3000);
    }
  };

  const fieldConfig = [
    { key: 'name', placeholder: 'Name' },
    { key: 'bank', placeholder: 'Bank Name' },
    { key: 'ifsc', placeholder: 'IFSC Code' },
    { key: 'account', placeholder: 'Account Number', keyboardType: 'numeric' },
    { key: 'confirmAccount', placeholder: 'Confirm Account Number', keyboardType: 'numeric' },
    { key: 'amount', placeholder: 'Withdrawal Amount', keyboardType: 'numeric' },
    { key: 'upi', placeholder: 'UPI ID (Optional)' },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Top Bar */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              paddingTop: 8,
            }}>
            <UserDropdown username="USER9081" />
          </View>

          {/* Form */}
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: 16,
              width: '100%',
              maxWidth: 500,
              alignSelf: 'center',
              marginTop: 32,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 24,
                textAlign: 'center',
              }}>
              💸 Withdrawal
            </Text>

            {fieldConfig.map(({ key, placeholder, keyboardType }) => (
              <MotiView
                key={key}
                from={{ translateX: 0 }}
                animate={{ translateX: shake[key] ? [-8, 8, -6, 6, -4, 4, 0] : 0 }}
                transition={{ type: 'timing', duration: 400 }}
                style={{ marginBottom: 12 }}>
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor="#999"
                  value={fields[key]}
                  onChangeText={(value) => handleChange(key, value)}
                  keyboardType={keyboardType || 'default'}
                  style={{
                    borderWidth: 1,
                    borderColor: errors[key] ? 'red' : '#ccc',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#fff',
                  }}
                />
                {errors[key] && (
                  <Text style={{ color: 'red', marginTop: 4, fontSize: 12 }}>{errors[key]}</Text>
                )}
              </MotiView>
            ))}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 16, borderRadius: 16 }}
              labelStyle={{ fontWeight: 'bold', color: '#000' }}>
              Submit Withdrawal
            </Button>

            {successAnim && (
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'timing', duration: 500 }}
                style={{
                  position: 'absolute',
                  top: '40%',
                  alignSelf: 'center',
                  backgroundColor: '#4CAF50',
                  borderRadius: 100,
                  width: 80,
                  height: 80,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', fontSize: 40 }}>✓</Text>
              </MotiView>
            )}
          </View>
        </ScrollView>

        {/* Snackbar */}
        <AnimatedSnackbar
          visible={snackbarVisible}
          message={snackbarMsg}
          type={snackbarType}
          onDismiss={() => setSnackbarVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
