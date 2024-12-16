import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import UserApp from './userApp.jsx';
import './index.css';
import AuthWrapper from './authWrapper.jsx';
import { ThemeProvider  } from './Components/themeProvider.jsx';
 // Ensure correct import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
      <BrowserRouter>
      <AuthWrapper>
      <ThemeProvider>
      <UserApp />
      </ThemeProvider>
      </AuthWrapper>
       
      </BrowserRouter>
    
  </React.StrictMode>
);
