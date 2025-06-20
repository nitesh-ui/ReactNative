import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { login as apiLogin, setAuthToken } from '../api/auth';

interface AuthContextData {
  userToken: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  loading: boolean;
  firstLaunch: boolean;
  login(userEmail: string, password: string, remember: boolean): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  userToken: null,
  userId: null,
  username: null,
  email: null,
  phone: null,
  loading: true,
  firstLaunch: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstLaunch, setFirstLaunch] = useState(true);

  // Debug function to check AsyncStorage state
  const logStorageState = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log('Current AsyncStorage state:', items);
  };

  // on mount, load any saved auth state and check first launch
  useEffect(() => {
    (async () => {
      try {
        await logStorageState();

        // Check if it's first launch
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');

        // If never launched before, it's first launch
        if (!hasLaunched) {
          console.log('First launch detected');
          await AsyncStorage.setItem('hasLaunched', 'true');
          setFirstLaunch(true);
        } else {
          console.log('Not first launch');
          setFirstLaunch(false);
        }

        // Try to restore auth state
        const token = await AsyncStorage.getItem('token');
        console.log('Stored token:', token);

        if (token) {
          // Set the token in API client
          setAuthToken(token);
          setUserToken(token);

          // Restore other user data
          const [id, name, emailVal, phoneVal] = await Promise.all([
            AsyncStorage.getItem('userId'),
            AsyncStorage.getItem('username'),
            AsyncStorage.getItem('email'),
            AsyncStorage.getItem('phone'),
          ]);

          if (id) setUserId(id);
          if (name) setUsername(name);
          if (emailVal) setEmail(emailVal);
          if (phoneVal) setPhone(phoneVal);

          console.log('Restored user data:', { id, name, emailVal, phoneVal });
        }
      } catch (e) {
        console.warn('Failed to load auth data', e);
        // On error, clear all auth data to be safe
        await clearAllData();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helper function to clear all data
  const clearAllData = async () => {
    console.log('Clearing all data...');

    // Get all keys first
    const keys = await AsyncStorage.getAllKeys();
    console.log('Keys to clear:', keys);

    // Clear AsyncStorage
    await AsyncStorage.multiRemove(keys);

    // Clear API client
    setAuthToken('');

    // Clear state
    setUserToken(null);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setPhone(null);
    setFirstLaunch(true);

    // Verify storage is cleared
    await logStorageState();
  };

  const login = async (userEmail: string, password: string, remember: boolean) => {
    console.log('Logging in with remember:', remember);

    const { token, userId, username, phone, email } = await apiLogin(userEmail, password);

    // Set auth state in memory
    setUserToken(token);
    setUserId(userId);
    if (username) setUsername(username);
    if (email) setEmail(email);
    if (phone) setPhone(phone);

    // Set token in API client
    setAuthToken(token);

    if (remember) {
      // Persist auth state only if "remember me" is checked
      await Promise.all([
        AsyncStorage.setItem('token', token),
        AsyncStorage.setItem('userId', userId),
        ...(username ? [AsyncStorage.setItem('username', username)] : []),
        ...(email ? [AsyncStorage.setItem('email', email)] : []),
        ...(phone ? [AsyncStorage.setItem('phone', phone)] : []),
      ]);
      console.log('Auth state persisted');
      await logStorageState();
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    await clearAllData();
  };

  return (
    <AuthContext.Provider
      value={{ userToken, userId, username, email, phone, loading, firstLaunch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
