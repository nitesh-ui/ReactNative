// services/api/auth.ts
// import axios from 'axios';

// const BASE_URL = 'https://ftbtest1.onrender.com/api';

// export const signup = async (
//   email: string,
//   phone: string,
//   password: string,
//   confirmPassword: string
// ) => {
//   const res = await axios.post(`${BASE_URL}/auth/signup`, {
//     email,
//     phone,
//     password,
//     confirmPassword,
//   });
//   return res.data;
// };

// export const login = async (email: string, password: string) => {
//   const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
//   return res.data;
// };

// export const test = () => {
//   console.log('Testt');
// };

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';

export function setAuthToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function login(email: string, password: string) {
  const resp = await apiClient.post('auth/login', { email, password });
  const { token, userId, username } = resp.data;

  if (!token) {
    throw new Error('Login failed: no token received');
  }

  // persist for future sessions
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('userId', userId);
  if (username) {
    await AsyncStorage.setItem('username', username);
  }

  setAuthToken(token);
  return { token, userId, username };
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
