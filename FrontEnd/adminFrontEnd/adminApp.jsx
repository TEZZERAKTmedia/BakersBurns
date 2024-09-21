import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import GalleryManagement from './Pages/GalleryManager';
import Messaging from './Pages/Messaging';
import Email from './Pages/Email';
import Layout from './Pages/Layout';
import Orders from './Pages/Orders';
import ProductManagement from './Pages/ProductManagement';
import { ScannerProvider } from './context/scannerContext';
import AdminLoginForm from './Components/loginForm';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/check-auth', {
          withCredentials: true,
        });
        if (response.data.role === 'admin') {
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={(role) => {
      setIsAuthenticated(true);
      setUserRole(role);
    }} />;
  }

  return (
    <ScannerProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<GalleryManagement />} />
          <Route path="/layout" element={<Layout />} />
          <Route path="/product-manager" element={<ProductManagement />} />
          <Route path="/messaging" element={<Messaging />} />
          <Route path="/email" element={<Email />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </ScannerProvider>
  );
};

export default AdminApp;
