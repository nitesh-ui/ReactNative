// services/api/auth.ts
import axios from 'axios';

const BASE_URL = 'https://ftbtest1.onrender.com/api';

export const signup = async (
  email: string,
  phone: string,
  password: string,
  confirmPassword: string
) => {
  const res = await axios.post(`${BASE_URL}/auth/signup`, {
    email,
    phone,
    password,
    confirmPassword,
  });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res.data;
};

export const test = () => {
  console.log('Testt');
};
