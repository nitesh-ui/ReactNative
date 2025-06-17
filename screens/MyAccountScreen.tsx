// screens/MyAccountScreen.tsx
import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientButton from '../components/GradientButton';
import { AuthContext } from '../context/AuthContext';
import UserDropdown from 'components/UserDropdown';

const { width } = Dimensions.get('window');

export default function MyAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { userId, username, email, phone, logout } = useContext(AuthContext);
  const userInfo = {
    fullName: 'Devon Lane',
    email: 'devon@gmail.com',
    referCode: 'No refer',
    avatar: require('../assets/profile.png'),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover">
        {/* header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeScreen')}
            style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>

          <UserDropdown username={username || userId || 'USER'} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.glassCard}>
            {/* avatar + name */}
            <View style={styles.profileRow}>
              <Image source={userInfo.avatar} style={styles.avatar} />
              <View style={styles.nameEmail}>
                <Text style={styles.name}>{username ?? '-'}</Text>
                <Text style={styles.email}>{email ?? '-'}</Text>
              </View>
            </View>

            {/* user information */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Text style={styles.fieldValue}>{username ?? '-'}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{email}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone </Text>
              <Text style={styles.fieldValue}>{phone ?? '-'}</Text>
            </View>

            {/* logout button */}
            <GradientButton
              onPress={() => {
                /* your logout logic */
                navigation.replace('Login');
              }}
              style={styles.logoutBtn}>
              Logout
            </GradientButton>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  background: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40, // Fixed width to balance with UserDropdown
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    // if you want a subtle shadow:
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameEmail: {
    marginLeft: 16,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  email: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },

  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 4,
  },
  fieldValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  logoutBtn: {
    marginTop: 8,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
  },
});
