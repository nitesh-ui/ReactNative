// screens/DepositHistoryScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import UserDropdown from '../components/UserDropdown';
import { AuthContext } from '../context/AuthContext';
import apiClient from 'api/client';

type DepositItem = {
  _id: string;
  amount: number;
  status: 'submitted' | 'processed';
  notes?: string;
  createdAt: string;
  processedAt?: string;
};

export default function DepositHistoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, userToken } = useContext(AuthContext);

  const [history, setHistory] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const resp = await apiClient.get(`deposit/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        console.log('Response:', resp);

        // sort by createdAt descending
        resp.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(resp.data);
      } catch (e: any) {
        setError(e.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [userId, userToken]);

  const renderItem = ({ item }: { item: DepositItem }) => {
    const createdDate = new Date(item.createdAt).toLocaleString();
    const processedDate = item.processedAt ? new Date(item.processedAt).toLocaleString() : null;

    const badgeColor = item.status === 'processed' ? '#4CAF50' : '#FFC107';

    return (
      <View style={[styles.card, { borderColor: colors.primary }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.amount, { color: colors.text }]}>₹ {item.amount.toFixed(2)}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={[styles.dateText, { color: colors.text }]}>Requested: {createdDate}</Text>
        {processedDate && (
          <Text style={[styles.dateText, { color: colors.text }]}>Processed: {processedDate}</Text>
        )}
        {item.notes ? (
          <Text style={[styles.notesText, { color: colors.text }]}>Notes: {item.notes}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}>
      <ImageBackground
        source={require('../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover">
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <UserDropdown username={userId} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Deposit History</Text>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          ) : history.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No deposit records found.
            </Text>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    marginTop: 6,
  },
  notesText: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});
