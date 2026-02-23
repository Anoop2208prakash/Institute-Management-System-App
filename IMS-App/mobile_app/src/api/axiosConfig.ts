import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Android emulators use 10.0.2.2 to access the host machine's localhost.
 * iOS emulators can use localhost directly.
 */
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout for slow database queries or image uploads
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR: Automatically handle multi-part data
 * This is crucial for your student registration with 'avatar' images.
 */
api.interceptors.request.use(
  (config) => {
    // If we're sending a FormData object, Axios usually handles this, 
    // but manually removing the header allows the browser/native environment 
    // to set the correct boundary.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;