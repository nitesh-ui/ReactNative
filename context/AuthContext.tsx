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
  getStoredCredentials(): Promise<{ email: string; password: string } | null>;
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
  getStoredCredentials: async () => null,
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

  // Helper function to clear all auth data but keep credentials if they exist
  const clearAllData = async () => {
    console.log('Clearing all data...');

    // Get all keys and stored credentials first
    const keys = await AsyncStorage.getAllKeys();
    const storedEmail = await AsyncStorage.getItem('rememberedEmail');
    const storedPassword = await AsyncStorage.getItem('rememberedPassword');

    // Remove all keys except remembered credentials
    await AsyncStorage.multiRemove(
      keys.filter((key) => key !== 'rememberedEmail' && key !== 'rememberedPassword')
    );

    // Clear API client
    setAuthToken('');

    // Clear state
    setUserToken(null);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setPhone(null);
    setFirstLaunch(false); // Don't reset to true, we want Login screen not Landing

    // Verify storage is cleared except credentials
    await logStorageState();
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
        await clearAllData();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

    // Always persist auth state for automatic login
    await Promise.all([
      AsyncStorage.setItem('token', token),
      AsyncStorage.setItem('userId', userId),
      ...(username ? [AsyncStorage.setItem('username', username)] : []),
      ...(email ? [AsyncStorage.setItem('email', email)] : []),
      ...(phone ? [AsyncStorage.setItem('phone', phone)] : []),
    ]);

    // If remember me is checked, store credentials
    if (remember) {
      await Promise.all([
        AsyncStorage.setItem('rememberedEmail', userEmail),
        AsyncStorage.setItem('rememberedPassword', password),
      ]);
      console.log('Credentials stored for remember me');
    }

    console.log('Auth state persisted');
    await logStorageState();
  };

  const getStoredCredentials = async () => {
    const email = await AsyncStorage.getItem('rememberedEmail');
    const password = await AsyncStorage.getItem('rememberedPassword');

    if (email && password) {
      return { email, password };
    }
    return null;
  };

  const logout = async () => {
    console.log('Logging out...');
    await clearAllData();
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userId,
        username,
        email,
        phone,
        loading,
        firstLaunch,
        login,
        logout,
        getStoredCredentials,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
