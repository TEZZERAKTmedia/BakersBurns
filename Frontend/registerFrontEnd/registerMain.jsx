import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './registerApp.jsx';
import LoadingPage from './Components/loading'; // Assuming you have a loading component
import './App.css';
import './index.css';

const RootApp = () => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Check if it's the user's first visit
    const isFirstVisit = localStorage.getItem('firstVisit');

    if (!isFirstVisit) {
      setShowLoading(true);
      // Show loading screen for 10 seconds on the first visit
      setTimeout(() => {
        setShowLoading(false);
        localStorage.setItem('firstVisit', 'true');
      }, 10000); // 10 seconds
    }
  }, []);

  return showLoading ? <LoadingPage /> : <App />;
};

// Render the app with loading screen support
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
