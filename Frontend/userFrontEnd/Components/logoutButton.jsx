import React, { useEffect, useState } from 'react';
import { userApi } from '../config/axios'; // Import your Axios instance

const LogoutButton = () => {
  const [role, setRole] = useState(null); // State to store user role

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await userApi.get('/auth/get-user-role'); // Adjust endpoint as needed
        setRole(response.data.role); // Set the role from the response
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null); // Set to null if fetching fails
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = () => {
    // Clear authentication tokens (localStorage, cookies, etc.)
    localStorage.removeItem('token'); // Example if token is stored in localStorage

    // Optionally, clear cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear token cookie

    // Redirect based on role
    if (role === 'admin') {
      const adminAppUrl = import.meta.env.VITE_ADMIN; // Admin redirection URL
      if (adminAppUrl) {
        window.location.href = adminAppUrl;
        return;
      } else {
        console.error('Admin app URL is not defined.');
      }
    }

    // Default logout redirection
    const logoutRedirectionUrl = import.meta.env.VITE_LOG_OUT_REDIRECTION;
    if (logoutRedirectionUrl) {
      window.location.href = logoutRedirectionUrl;
    } else {
      console.error('Logout redirection URL is not defined.');
    }
  };

  return (
    <button 
      onClick={handleLogout} 
       
      style={{
        backgroundColor: 'white',
        color: 'black',
        marginTop: '-5px',
        display: 'block',  // Make button block-level to use margin auto for centering
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 'fit-content', // Optional: Adjust width to content
      }}
    >
      {role === 'admin' ? 'Go to Admin App' : 'Log Out'}
    </button>
  );
};

export default LogoutButton;
