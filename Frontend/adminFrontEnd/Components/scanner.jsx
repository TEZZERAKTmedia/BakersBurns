import React, { useState, useEffect } from 'react';
import { useScanner } from '../context/scannerContext';
import Sidebar from './sideBar';
import '../App.css'; // Import the CSS file

const Scanner = () => {
  const { isScanning, selectedElement, setSelectedElement } = useScanner();
  const [styles, setStyles] = useState({
    width: '',
    height: '',
    backgroundColor: '',
    fontSize: '',
    backgroundImage: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '',
    borderColor: '',
    borderWidth: '',
    boxShadow: '',
    boxShadowSize: '',
    boxShadowColor: '',
    boxShadowOpacity: 1,
  });

  useEffect(() => {
    if (selectedElement) {
      const computedStyle = window.getComputedStyle(selectedElement);
      setStyles({
        width: computedStyle.width,
        height: computedStyle.height,
        backgroundColor: computedStyle.backgroundColor,
        fontSize: computedStyle.fontSize,
        backgroundImage: computedStyle.backgroundImage,
        backgroundSize: computedStyle.backgroundSize,
        backgroundPosition: computedStyle.backgroundPosition,
        borderRadius: computedStyle.borderRadius,
        borderColor: computedStyle.borderColor,
        borderWidth: computedStyle.borderWidth,
        boxShadow: computedStyle.boxShadow,
        boxShadowSize: computedStyle.boxShadow.split(' ')[3] || '',
        boxShadowColor: computedStyle.boxShadow.split(' ')[4] || '',
        boxShadowOpacity: parseFloat(computedStyle.boxShadow.split(' ')[5]) || 1,
      });
    }
  }, [selectedElement]);

  const handleStyleChange = (property, value) => {
    setStyles((prevStyles) => ({ ...prevStyles, [property]: value }));
    if (selectedElement) {
      selectedElement.style[property] = value;
    }
  };

  return (
    <div className="scanner-container">
      {isScanning && selectedElement && (
        <div
          style={{
            position: 'absolute',
            top: selectedElement.getBoundingClientRect().top + window.scrollY,
            left: selectedElement.getBoundingClientRect().left + window.scrollX,
            width: selectedElement.getBoundingClientRect().width,
            height: selectedElement.getBoundingClientRect().height,
            border: '2px solid red',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      <Sidebar
        isOpen={isScanning}
        styles={styles}
        onStyleChange={handleStyleChange}
        onClose={() => setSelectedElement(null)}
      />
    </div>
  );
};

export default Scanner;
