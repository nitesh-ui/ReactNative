import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Button, useTheme, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import AnimatedSnackbar from 'components/AnimatedSnackbar';
import UserDropdown from 'components/UserDropdown';

const screenWidth = Dimensions.get('window').width;

export default function WithdrawalScreen() {
  const { colors } = useTheme();

  const [fields, setFields] = useState({
    name: '',
    bank: '',
    ifsc: '',
    account: '',
    confirmAccount: '',
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState({});
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('green');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setShake((prev) => ({ ...prev, [field]: false }));
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const validate = () => {
    const newErrors = {};
    const newShake = {};

    if (!fields.name.trim()) newErrors.name = 'Name is required';
    if (!fields.bank.trim()) newErrors.bank = 'Bank name is required';
    if (!fields.ifsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) newErrors.ifsc = 'Invalid IFSC code';
    if (!fields.account) newErrors.account = 'Account number required';
    if (fields.confirmAccount !== fields.account)
      newErrors.confirmAccount = 'Account numbers do not match';

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

        setFields({
          name: '',
          bank: '',
          ifsc: '',
          account: '',
          confirmAccount: '',
        });
      } catch (error) {
        setSnackbarMsg('Failed to submit withdrawal. Please try again.');
        setSnackbarColor('#f44336');
        setSnackbarType('error');
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    }

    setTimeout(() => {
      setSnackbarVisible(false);
    }, 3000);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Top Bar with Username */}
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
                marginTop: 12,
                marginBottom: 24,
                textAlign: 'center',
              }}>
              💸 Withdrawal
            </Text>

            {[
              { key: 'name', placeholder: 'Name' },
              { key: 'bank', placeholder: 'Bank Name' },
              { key: 'ifsc', placeholder: 'IFSC Code' },
              { key: 'account', placeholder: 'Account Number', keyboardType: 'numeric' },
              {
                key: 'confirmAccount',
                placeholder: 'Confirm Account Number',
                keyboardType: 'numeric',
              },
            ].map(({ key, placeholder, keyboardType }) => (
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
          </View>
        </ScrollView>

        {/* Animated Snackbar */}
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
