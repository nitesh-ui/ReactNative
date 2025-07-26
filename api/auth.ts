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
  console.log('signup', email, phone, password, confirmPassword, referralId);
  try {
    const resp = await apiClient.post('/auth/signup', {
      email,
      phone,
      password,
      confirmPassword,
      // referralId, // send it anyway — server can ignore empty
    });
    console.log('signup resp', resp.status, resp.data);
    return resp.data;
  } catch (err: any) {
    console.error('Signup API error:', err?.response?.data || err.message);
    throw err; // rethrow so the screen shows snackbar
  }
}
