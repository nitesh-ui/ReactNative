import React, { useState } from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UserDropdown from '../components/UserDropdown';
import GradientButton from '../components/GradientButton';

export default function HelpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    console.log('Help message:', message);
    // Here you can add the actual submission logic later
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
          <UserDropdown />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.container}>
              <Text style={styles.title}>Need Help?</Text>
              <Text style={styles.subtitle}>
                Please describe your issue and we'll get back to you as soon as possible.
              </Text>

              <TextInput
                mode="outlined"
                multiline
                numberOfLines={8}
                placeholder="Type your message here..."
                value={message}
                onChangeText={setMessage}
                style={styles.textArea}
                theme={{
                  colors: {
                    primary: colors.primary,
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              />

              <GradientButton onPress={handleSubmit} style={styles.submitButton}>
                Submit Message
              </GradientButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 16,
  },
});
