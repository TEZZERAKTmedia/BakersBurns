import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UserApp from './userApp.jsx';
import './index.css';
import AuthWrapper from './authWrapper.jsx';
import { ThemeProvider } from './Components/themeProvider.jsx';
import LoadingPage from './Components/loading'; // Assuming you have a reusable loading component

const RootUserApp = () => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Check if it's the user's first visit
    const isFirstUserVisit = localStorage.getItem('firstUserVisit');

    if (!isFirstUserVisit) {
      setShowLoading(true);
      // Show loading screen for 10 seconds on the first visit
      setTimeout(() => {
        setShowLoading(true);
        localStorage.setItem('firstUserVisit', 'true');
      }, 10000); // 10 seconds
    }
  }, []);

  return showLoading ? <LoadingPage /> : <UserApp />;
};

// Render the user app with first-time loading logic
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthWrapper>
        <ThemeProvider>
          <RootUserApp />
        </ThemeProvider>
      </AuthWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
