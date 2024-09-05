import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import GalleryManagement from './Pages/GalleryManager';
import Layout from './Pages/Layout';
import Scannable from './context/Scannable';
import ProductManagement from './Pages/ProductManagement';
import './App.css';
import { ScannerProvider } from './context/scannerContext';
import Scanner from './Components/scanner';

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/check-auth', {
          withCredentials: true,
        });
        console.log('Auth response:', response); // Log the response
        setUserRole(response.data.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error); // Log the error
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <ScannerProvider>
      <Navbar />
      <Scannable>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protected admin routes */}
          {isAuthenticated && userRole === 'admin' ? (
            <>
              <Route path="/admin" element={<Home />} />
              <Route path="/admin/gallery" element={<GalleryManagement />} />
              <Route path="/admin/layout" element={<Layout />} />
              <Route path="/admin/product-manager" element={<ProductManagement />} />
            </>
          ) : (
            // Redirect non-admin or unauthenticated users to home
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </Scannable>
      <Scanner />
    </ScannerProvider>
  );
};

export default AppWrapper;
