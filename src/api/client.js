// =====================================================================
//  API client for the mobile app.
//  Points at the LIVE backend deployed on Render, so the app works on
//  your phone over the internet with no local server needed.
//
//  >>> If your backend URL ever changes, update API_BASE_URL below. <<<
// =====================================================================
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://fyp-archive.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // The free Render instance can be slow to wake from sleep (cold start),
  // so allow a generous timeout for the first request.
  timeout: 60000,
});

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('fyp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
