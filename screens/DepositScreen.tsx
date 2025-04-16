import React, { useState } from 'react';
import { View, Text, Image, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button, useTheme } from 'react-native-paper';
import UserDropdown from 'components/UserDropdown';

export default function DepositScreen() {
  const { colors } = useTheme();
  const [image, setImage] = useState(null);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 8,
              paddingBottom: 16,
            }}>
            <UserDropdown username="USER9081" />
          </View>

          {/* QR Code */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={require('../assets/qr-placeholder.png')} // Replace with your QR image
              style={{
                width: 220,
                height: 220,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#ccc',
              }}
            />
            <Text style={{ marginTop: 12, fontWeight: '600', fontSize: 16, color: colors.text }}>
              UPI ID: user9801@upi
            </Text>
          </View>

          {/* Screenshot Upload */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>
              Attach Screenshot of Payment (JPG, PNG)
            </Text>

            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 8 }}
              />
            ) : (
              <View
                style={{
                  height: 200,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#aaa',
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                <Text style={{ color: '#999' }}>No file selected</Text>
              </View>
            )}

            <Button mode="outlined" onPress={pickImage}>
              {image ? 'Change Screenshot' : 'Upload Screenshot'}
            </Button>
          </View>

          {/* Submit (Optional) */}
          <Button mode="contained" onPress={() => alert('Submitted!')} disabled={!image}>
            Submit Deposit Proof
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
