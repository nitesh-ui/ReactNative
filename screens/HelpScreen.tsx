import React, { useState, useContext } from 'react';
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
import AnimatedSnackbar from '../components/AnimatedSnackbar';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function HelpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { userToken, userId } = useContext(AuthContext);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setSnackbar({
        visible: true,
        message: 'Please fill in both subject and message fields',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'https://ftbtest1.onrender.com/api/help/submit',
        {
          userId,
          subject: subject.trim(),
          message: message.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setSnackbar({
        visible: true,
        message: 'Help request submitted successfully',
        type: 'success',
      });

      // Clear the form
      setSubject('');
      setMessage('');
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to submit help request. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide snackbar after 3 seconds
  React.useEffect(() => {
    if (snackbar.visible) {
      const timer = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.visible]);

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
                placeholder="Subject"
                value={subject}
                onChangeText={setSubject}
                style={styles.subjectInput}
                theme={{
                  colors: {
                    primary: colors.primary,
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              />

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

              <GradientButton onPress={handleSubmit} style={styles.submitButton} loading={loading}>
                Submit Message
              </GradientButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <AnimatedSnackbar
          visible={snackbar.visible}
          message={snackbar.message}
          type={snackbar.type}
          onDismiss={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
        />
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
  subjectInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    height: 48,
  },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
    textAlignVertical: 'top',
    minHeight: 200,
  },
  submitButton: {
    marginTop: 16,
  },
});
