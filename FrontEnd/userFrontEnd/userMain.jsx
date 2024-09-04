import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UserApp from './userApp.jsx';
import './index.css';
import AuthProvider from './authProvider.jsx'; // Ensure correct import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <UserApp />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
