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
  const [loading, setLoading] = useState(true); // Start with true to show the loading state initially
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/check-auth', {
          withCredentials: true,
        });

        setUserRole(response.data.role);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Display a loading state while checking authentication
  }

  return (
    <ScannerProvider>
      <Navbar />
      <Scannable>
        <Routes>
          <Route path="/" element={<Home />} />
          {isAuthenticated && userRole === 'admin' ? (
            <>
              <Route path="/admin" element={<Home />} />
              <Route path="/admin/gallery" element={<GalleryManagement />} />
              <Route path="/admin/layout" element={<Layout />} />
              <Route path="/admin/product-manager" element={<ProductManagement />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </Scannable>
      <Scanner />
    </ScannerProvider>
  );
};

export default AppWrapper;
