import axios from 'axios';

// Create an instance of axios
const authApi = axios.create({
    baseURL: import.meta.env.VITE_APP_AUTH_SERVER_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const shopApi = axios.create({
    baseURL: import.meta.env.VITE_APP_SHOP_SERVER_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const adminApi = axios.create({
    baseURL: import.meta.env.VITE_APP_ADMIN_SERVER_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
export {authApi, shopApi, adminApi};
