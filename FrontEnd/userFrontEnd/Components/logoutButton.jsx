// src/components/LogoutButton.js
import React from 'react';

const LogoutButton = () => {
  const handleLogout = () => {
    // Clear authentication tokens (localStorage, cookies, etc.)
    localStorage.removeItem('token'); // Example if token is stored in localStorage

    // Optionally, you can also clear cookies if needed
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear token cookie

    // Redirect to the external app using the environment variable
    const logoutRedirectionUrl = import.meta.env.VITE_LOG_OUT_REDIRECTION;

    if (logoutRedirectionUrl) {
      window.location.href = logoutRedirectionUrl;
    } else {
      console.error('Logout redirection URL is not defined.');
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Log Out
    </button>
  );
};

export default LogoutButton;
