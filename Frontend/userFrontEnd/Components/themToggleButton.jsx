import React, { useEffect } from 'react';
import { useTheme } from './themeProvider';
import './theme.css'; // Import the styling

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Sync with localStorage & apply class to root element
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark-mode');
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove('dark-mode');
      root.setAttribute("data-theme", "light");
    }

    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <span className="theme-label">Light</span>
      <div className={`toggle-switch ${isDarkMode ? "active" : ""}`}>
        <div className="toggle-slider"></div>
      </div>
      <span className="theme-label">Dark</span>
    </div>
  );
};

export default ThemeToggle;
