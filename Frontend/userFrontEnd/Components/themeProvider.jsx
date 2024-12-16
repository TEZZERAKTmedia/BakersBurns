import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a Theme Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Apply theme changes to the document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Persist the user's theme preference
  }, [theme]);

  // Toggle between light and dark modes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for accessing the theme context
export const useTheme = () => useContext(ThemeContext);
