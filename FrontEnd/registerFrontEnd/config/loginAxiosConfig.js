import axios from 'axios';

// Create an instance of axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:2000', // Base URL for your API
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;