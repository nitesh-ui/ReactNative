import axios from 'axios';

const apiClient = axios.create({
  baseURL: ' https://backend-s5bj.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
