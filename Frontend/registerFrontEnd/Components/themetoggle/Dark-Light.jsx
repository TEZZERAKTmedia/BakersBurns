import React, { useState, useEffect } from 'react';
import './theme.css'; // Import the styling

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark-mode');
      root.setAttribute("data-theme", "dark");  
    } else {
      root.classList.remove('dark-mode');
      root.setAttribute("data-theme", "light");
    }

    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <div className="theme-toggle">
      <span className="theme-label">Light</span>
      <div 
        className={`toggle-switch ${darkMode ? "active" : ""}`} 
        onClick={() => setDarkMode(prev => !prev)}
      >
        <div className="toggle-slider"></div>
      </div>
      <span className="theme-label">Dark</span>
    </div>
  );
};

export default ThemeToggle;
