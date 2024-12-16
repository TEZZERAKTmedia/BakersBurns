import axios from 'axios';

// Create an Axios instance
const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,  // Automatically loaded from .env file
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("Base URL is: ", import.meta.env.VITE_USER_API_URL);  // Log the base URL

export { userApi };