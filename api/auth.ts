import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';

export function setAuthToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function login(userEmail: string, password: string) {
  const resp = await apiClient.post('auth/login', { email: userEmail, password });
  const { token, userId, username, phone, email } = resp.data;

  if (!token) {
    throw new Error('Login failed: no token received');
  }

  // Set the token in API client
  setAuthToken(token);

  // Return the data for AuthContext to handle persistence
  return { token, userId, username, phone, email };
}

export async function signup(
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  referralId?: string
) {
  const resp = await apiClient.post('/auth/signup', {
    email,
    phone,
    password,
    confirmPassword,
    ...(referralId && { referralId }),
  });
  // You can choose to return resp.data or some message
  return resp.data;
}
