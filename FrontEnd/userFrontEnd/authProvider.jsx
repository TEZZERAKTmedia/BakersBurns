import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Named import for jwtDecode

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  const setAuthToken = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    try {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
      setUserRole(decodedToken.role);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const removeAuthToken = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, userRole, setAuthToken, removeAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
