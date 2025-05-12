// screens/MyAccountScreen.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MyAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const userInfo = {
    fullName: 'Devon Lane',
    email: 'devon@gmail.com',
    referCode: 'No refer',
    avatar: require('../assets/profile.png'),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* avatar + name */}
        <View style={styles.profileRow}>
          <Image source={userInfo.avatar} style={styles.avatar} />
          <View style={styles.nameEmail}>
            <Text style={styles.name}>{userInfo.fullName}</Text>
            <Text style={styles.email}>{userInfo.email}</Text>
          </View>
        </View>

        {/* user information */}
        <Text style={styles.sectionTitle}>User Information</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <Text style={styles.fieldValue}>{userInfo.fullName}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{userInfo.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Refer Code (Optional)</Text>
          <Text style={styles.fieldValue}>{userInfo.referCode}</Text>
        </View>
      </ScrollView>

      {/* logout button */}
      <Button
        mode="contained"
        onPress={() => {
          /* your logout logic */
          navigation.replace('Login');
        }}
        style={[styles.logoutBtn, { backgroundColor: colors.primary }]}
        labelStyle={styles.logoutLabel}>
        Logout
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginRight: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
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
    borderColor: '#5B3DFD',
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
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#BBBBBB',
    fontSize: 13,
    marginBottom: 4,
  },
  fieldValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
  },
  logoutLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
