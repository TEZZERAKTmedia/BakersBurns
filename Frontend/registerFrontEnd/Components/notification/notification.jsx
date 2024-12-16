// NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import './notification.css';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
    const showNotification = (message, type) => {
      setNotification({ message, type, visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000); // Hide after 3 seconds
    };
  
    return (
      <NotificationContext.Provider value={{ showNotification }}> {/* Pass an object */}
        {children}
        {notification.visible && <Notification message={notification.message} type={notification.type} />}
      </NotificationContext.Provider>
    );
  };
  

const Notification = ({ message, type }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2500); // Slide out after 2.5 seconds
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className={`notification ${show ? 'slide-in' : 'slide-out'} ${type}`}>
      {message}
    </div>
  );
};

export default NotificationContext;
