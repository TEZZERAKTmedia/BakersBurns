import React, { createContext, useContext, useState, useEffect } from 'react';

const ScannerContext = createContext();

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
};

export const ScannerProvider = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  const toggleScanner = () => {
    setIsScanning(!isScanning);
  };

  const handleMouseOver = (event) => {
    if (
      isScanning &&
      event.target.closest('.scannable') &&
      !event.target.closest('.unscannable')
    ) {
      setSelectedElement(event.target);
    }
  };

  useEffect(() => {
    if (isScanning) {
      document.addEventListener('mouseover', handleMouseOver);
    } else {
      document.removeEventListener('mouseover', handleMouseOver);
      setSelectedElement(null);
    }
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isScanning]);

  return (
    <ScannerContext.Provider
      value={{ isScanning, toggleScanner, selectedElement, setSelectedElement }}
    >
      {children}
    </ScannerContext.Provider>
  );
};
