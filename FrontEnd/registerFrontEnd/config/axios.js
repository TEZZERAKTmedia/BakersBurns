import axios from 'axios';

// Create an Axios instance
const registerApi = axios.create({
  baseURL: import.meta.env.VITE_DEVELOPMENT,  // Automatically loaded from .env file
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("Base URL is: ", import.meta.env.VITE_DEVELOPMENT);  // Log the base URL

export { registerApi };