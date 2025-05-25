// screens/DepositScreen.tsx
import React, { useState, useContext } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, Divider, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UserDropdown from '../components/UserDropdown';
import { AuthContext } from '../context/AuthContext';
import GradientButton from '../components/GradientButton';

export default function DepositScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { userId } = useContext(AuthContext);

  const [image, setImage] = useState<string | null>(null);
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

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    const form = new FormData();
    form.append('userID', userId);
    form.append('paymentProof', {
      uri: image,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const resp = await fetch('https://ftbtest1.onrender.com/api/deposit/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: form,
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      setSnackbar({ visible: true, message: 'Deposit proof submitted!' });
      setImage(null);
    } catch (e) {
      console.error(e);
      setSnackbar({ visible: true, message: 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover">
        {/* Header with Back + Dropdown */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <UserDropdown username={userId || 'USER'} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* QR + UPI */}
            <View style={styles.qrBlock}>
              <Image source={require('../assets/qr-placeholder.png')} style={styles.qrImage} />
              <Text style={[styles.upiText, { color: colors.text }]}>UPI ID: {userId}@upi</Text>
            </View>

            <Divider style={styles.divider} />

            {/* Screenshot uploader */}
            <View style={styles.uploadBlock}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>
                Attach Screenshot of Payment
              </Text>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.dashedBox}>
                  <Text style={styles.dashedText}>No file selected</Text>
                </View>
              )}
              <GradientButton onPress={pickImage} style={styles.uploadButton} outline>
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
        </KeyboardAvoidingView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
          duration={3000}>
          {snackbar.message}
        </Snackbar>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
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
  upiText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
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
