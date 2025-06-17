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

  // on mount, load any saved auth state
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const id = await AsyncStorage.getItem('userId');
        const name = await AsyncStorage.getItem('username');
        const email = await AsyncStorage.getItem('email');
        const phone = await AsyncStorage.getItem('phone');
        if (token) {
          setAuthToken(token);
          setUserToken(token);
        }
        if (id) setUserId(id);
        if (name) setUsername(name);
        if (email) setEmail(email);
        if (phone) setPhone(phone);
      } catch (e) {
        console.warn('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // call this from your LoginScreen
  const login = async (userEmail: string, password: string, remember: boolean) => {
    const { token, userId, username, phone, email } = await apiLogin(userEmail, password);
    console.log('login', { userId, username, phone, email });

    setUserToken(token);
    setUserId(userId);
    if (username) setUsername(username);
    if (email) setEmail(email);
    if (phone) setPhone(phone);
    if (remember) {
      // persist only if “remember me” checked
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);
      if (username) await AsyncStorage.setItem('username', username);
      if (email) await AsyncStorage.setItem('email', email);
      if (phone) await AsyncStorage.setItem('phone', phone);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'userId', 'username']);
    apiClient.defaults.headers.common.Authorization = '';
    setUserToken(null);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{ userToken, userId, username, email, phone, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
