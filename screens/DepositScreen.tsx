// screens/DepositScreen.tsx
import React, { useState } from 'react';
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
import { useTheme } from 'react-native-paper';
import UserDropdown from '../components/UserDropdown';
import GradientButton from '../components/GradientButton';

export default function DepositScreen() {
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover">
        {/* header */}
        <View style={styles.header}>
          <View />
          <UserDropdown username="USER9801" />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* QR + UPI */}
            <View style={styles.qrBlock}>
              <Image source={require('../assets/qr-placeholder.png')} style={styles.qrImage} />
              <Text style={[styles.upiText, { color: colors.text }]}>UPI ID: user9801@upi</Text>
            </View>

            {/* Screenshot uploader */}
            <View style={styles.uploadBlock}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>
                Attach Screenshot of Payment (JPG, PNG)
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
              onPress={() => alert('Deposit proof submitted!')}
              disabled={!image}
              style={styles.submitButton}>
              Submit Deposit Proof
            </GradientButton>
          </ScrollView>
        </KeyboardAvoidingView>
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
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'transparent',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  qrBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
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
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  dashedBox: {
    height: 180,
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
  upiText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});
