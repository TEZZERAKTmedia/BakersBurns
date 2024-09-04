// axios.js
import axios from 'axios';

// Create an Axios instance for the Auth server
const authApi = axios.create({
  baseURL: import.meta.env.VITE_APP_AUTH_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an Axios instance for the Shop server
const shopApi = axios.create({
  baseURL: import.meta.env.VITE_APP_SHOP_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an Axios instance for the User server
const userApi = axios.create({
  baseURL: import.meta.env.VITE_APP_USER_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { authApi, shopApi, userApi };
