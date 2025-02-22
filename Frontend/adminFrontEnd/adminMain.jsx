import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './adminApp.jsx';
import LoadingPage from './Components/loading'; // Assuming you have a loading component
import './index.css';
import { NotificationProvider } from './Components/notification/notification.jsx';

const RootAdminApp = () => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Check if it's the user's first visit
    const isFirstAdminVisit = localStorage.getItem('firstAdminVisit');

    if (!isFirstAdminVisit) {
      setShowLoading(true);
      // Show loading screen for 10 seconds on the first visit
      setTimeout(() => {
        setShowLoading(false);
        localStorage.setItem('firstAdminVisit', 'true');
      }, 10000); // 10 seconds
    }
  }, []);

  return showLoading ? <LoadingPage /> : <App />;
};

// Render the admin app with a first-time loading screen
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <RootAdminApp />
    </NotificationProvider>
  </React.StrictMode>
);
