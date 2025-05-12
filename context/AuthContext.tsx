import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { login as apiLogin, setAuthToken } from '../api/auth';

interface AuthContextData {
  userToken: string | null;
  userId: string | null;
  username: string | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  userToken: null,
  userId: null,
  username: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // on mount, load any saved auth state
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const id = await AsyncStorage.getItem('userId');
        const name = await AsyncStorage.getItem('username');
        if (token) {
          setAuthToken(token);
          setUserToken(token);
        }
        if (id) setUserId(id);
        if (name) setUsername(name);
      } catch (e) {
        console.warn('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // call this from your LoginScreen
  const login = async (email: string, password: string, remember: boolean) => {
    const { token, userId, username } = await apiLogin(email, password);
    setUserToken(token);
    setUserId(userId);
    if (username) setUsername(username);

    if (remember) {
      // persist only if “remember me” checked
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);
      if (username) await AsyncStorage.setItem('username', username);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'userId', 'username']);
    apiClient.defaults.headers.common.Authorization = '';
    setUserToken(null);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
