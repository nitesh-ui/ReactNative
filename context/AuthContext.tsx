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

  // on mount, load any saved auth state and check first launch
  useEffect(() => {
    (async () => {
      try {
        // Check if it's first launch
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          await AsyncStorage.setItem('hasLaunched', 'true');
          setFirstLaunch(true);
        } else {
          setFirstLaunch(false);
        }

        // Try to restore auth state
        const token = await AsyncStorage.getItem('token');
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
        }
      } catch (e) {
        console.warn('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (userEmail: string, password: string, remember: boolean) => {
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
    }
  };

  const logout = async () => {
    // Clear all auth data from storage
    await AsyncStorage.multiRemove(['token', 'userId', 'username', 'email', 'phone']);

    // Clear auth header
    setAuthToken('');

    // Clear state
    setUserToken(null);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{ userToken, userId, username, email, phone, loading, firstLaunch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
