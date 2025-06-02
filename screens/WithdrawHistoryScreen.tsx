// screens/WithdrawHistoryScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

import UserDropdown from '../components/UserDropdown';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

type BankDetails = {
  name: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
};

type WithdrawRecord = {
  _id: string;
  userId: string;
  type: 'withdrawal';
  amount: number;
  status: 'submitted' | 'processed' | string;
  bankDetails: BankDetails;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  processedAt?: string;
};

export default function WithdrawHistoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, userToken } = useContext(AuthContext);

  const [history, setHistory] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const resp = await apiClient.get<WithdrawRecord[]>(
          `https://ftbtest1.onrender.com/api/withdraw/history/O8HVRJ`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        // Sort descending by createdAt
        const sorted = resp.data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHistory(sorted);
      } catch (e) {
        console.error(e);
        setError('Failed to load withdrawal history.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [userId, userToken]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: WithdrawRecord }) => {
    const createdDate = formatDate(item.createdAt);
    const processedDate = item.processedAt ? formatDate(item.processedAt) : null;
    const badgeColor = item.status === 'processed' ? '#4CAF50' : '#FFC107';

    // Mask account number except last 4 digits
    const acctMask =
      item.bankDetails.accountNumber.length > 4
        ? '****' + item.bankDetails.accountNumber.slice(-4)
        : item.bankDetails.accountNumber;

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
        <Text style={[styles.detailText, { color: colors.text }]}>
          Bank: {item.bankDetails.bankName} ({acctMask})
        </Text>
        <Text style={[styles.detailText, { color: colors.text }]}>
          Account Holder: {item.bankDetails.name}
        </Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <UserDropdown username={userId} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Withdrawal History</Text>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          ) : history.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No withdrawal records found.
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
  loader: {
    marginTop: 24,
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
  detailText: {
    fontSize: 14,
    marginTop: 6,
  },
  notesText: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
