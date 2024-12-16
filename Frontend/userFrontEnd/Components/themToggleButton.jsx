import React from 'react';
import { useTheme } from './themeProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 20px',
        margin: '20px',
        cursor: 'pointer',
        background: theme === 'light' ? '#000' : '#FFF',
        color: theme === 'light' ? '#FFF' : '#000',
        border: '1px solid',
        borderRadius: '5px',
      }}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeToggle;
