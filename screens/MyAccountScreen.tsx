import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const MyAccountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const userInfo = {
    username: 'USER9081',
    email: 'user9081@example.com',
    phone: '+91 9876543210',
    balance: '₹100.00',
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>👤 My Account</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{userInfo.username}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userInfo.email}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{userInfo.phone}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Wallet Balance</Text>
            <Text style={styles.value}>{userInfo.balance}</Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Login')}
        style={styles.logoutBtn}
        labelStyle={{ color: '#000', fontWeight: 'bold' }}>
        Logout
      </Button>
    </SafeAreaView>
  );
};

export default MyAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E0A52',
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff10',
    marginBottom: 16,
    borderRadius: 12,
  },
  label: {
    color: '#BBBBBB',
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#FF6F91',
    marginBottom: 20,
    borderRadius: 16,
    marginHorizontal: 16,
  },
});
