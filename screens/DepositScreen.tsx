// screens/DepositScreen.tsx
import React, { useState, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useTheme, Divider, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import UserDropdown from '../components/UserDropdown';
import FloatingInput from '../components/FloatingInput';
import { AuthContext } from '../context/AuthContext';
import GradientButton from '../components/GradientButton';
import apiClient from 'api/client';

type RootStackParamList = {
  HomeScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

export default function DepositScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { userId } = useContext(AuthContext);

  const [image, setImage] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCopyUPI = () => {
    Clipboard.setStringAsync('9953887662@ptyes');
    setSnackbar({ visible: true, message: 'UPI ID copied to clipboard!' });
  };

  // Memoize the validation function
  const validateNumeric = useMemo(() => {
    const regex = /[^0-9]/g;
    return (text: string) => text.replace(regex, '');
  }, []);

  const handleAmountChange = useCallback(
    (text: string) => {
      // Only update if the text actually changed and is valid
      if (text !== amount) {
        const numeric = validateNumeric(text);
        setAmount(numeric);
      }
    },
    [amount, validateNumeric]
  );

  const handleSubmit = async () => {
    if (!image) {
      setSnackbar({ visible: true, message: 'Please select an image.' });
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      setSnackbar({ visible: true, message: 'Please enter a valid deposit amount.' });
      return;
    }

    if (!userId || typeof userId !== 'string') {
      setSnackbar({ visible: true, message: 'User ID is missing. Please log in again.' });
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append('userId', userId);
    form.append('amount', amount);
    form.append('paymentProof', {
      uri: image,
      type: 'image/jpeg',
      name: 'payment-proof.jpg',
    } as any);

    try {
      const resp = await apiClient.post('/deposit/request', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API response:', resp.data);
      setSnackbar({ visible: true, message: 'Deposit proof submitted!' });
      setImage(null);
      setAmount('');
    } catch (e: any) {
      setSnackbar({ visible: true, message: 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground
        source={require('../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          {/* Header with Back + Dropdown */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <UserDropdown username={userId || 'USER'} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {/* QR + UPI */}
            <View style={styles.qrBlock}>
              <Image source={require('../assets/qr-placeholder.png')} style={styles.qrImage} />
              <View style={styles.upiRow}>
                <Text style={[styles.upiText, { color: colors.onBackground }]}>
                  9953887662@ptyes
                </Text>
                <TouchableOpacity onPress={handleCopyUPI} style={styles.copyIcon}>
                  <MaterialIcons name="content-copy" size={18} color={colors.onBackground} />
                </TouchableOpacity>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* 🔹 Deposit Amount Field */}
            <View style={styles.uploadBlock}>
              <FloatingInput
                label="Deposit Amount"
                value={amount}
                onChangeText={handleAmountChange}
                // keyboardType="numeric"
                shake={false}
                hasError={false}
              />
            </View>

            {/* Screenshot uploader */}
            <View style={styles.uploadBlock}>
              <Text style={[styles.uploadLabel, { color: colors.onBackground }]}>
                Attach Screenshot of Payment
              </Text>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.dashedBox}>
                  <Text style={styles.dashedText}>No file selected</Text>
                </View>
              )}
              <GradientButton onPress={pickImage} style={styles.uploadButton}>
                {image ? 'Change Screenshot' : 'Upload Screenshot'}
              </GradientButton>
            </View>

            {/* Submit */}
            <GradientButton
              onPress={handleSubmit}
              disabled={!image || loading}
              style={styles.submitButton}>
              {loading ? 'Submitting…' : 'Submit Deposit'}
            </GradientButton>
          </ScrollView>

          <Snackbar
            visible={snackbar.visible}
            onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
            duration={3000}>
            {snackbar.message}
          </Snackbar>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  qrBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrImage: {
    width: '60%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    height: 200,
    borderColor: '#ccc',
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  upiText: {
    fontSize: 16,
    fontWeight: '600',
  },
  copyIcon: {
    padding: 4,
  },
  uploadBlock: {
    width: '100%',
    marginBottom: 24,
  },
  uploadLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    marginBottom: 8,
  },
  dashedBox: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#aaa',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dashedText: { color: '#999', fontSize: 14 },
  uploadButton: {
    width: '100%',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
  submitButton: {
    width: '100%',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
});
