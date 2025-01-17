import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Example: Fetch processing orders
      const response = await axios.get('/admin-notifications/orders/processing');
      const { count, message } = response.data;

      setNotifications((prev) => [
        ...prev,
        { type: 'processing', count, message },
      ]);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
