import React, { useState, useRef, useEffect } from 'react';
import { useScanner } from '../context/scannerContext';
import RangeInput from './sidebarComponents/rangeInput';
import ColorInput from './sidebarComponents/ColorInput';
import SelectInput from './sidebarComponents/SelectInput';
import CheckboxInput from './sidebarComponents/CheckboxInput';
import '../Componentcss/sidebar.css'; // Import the CSS file for sidebar styling



const Sidebar = ({ styles, onStyleChange }) => {
  
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isXrayMode, setIsXrayMode] = useState(false);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const {isScanning, toggleScanner, toggleButtonRef } = useScanner();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing.current && sidebarRef.current) {
        const newWidth = e.clientX;
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setBackgroundImage(imageUrl);
        onStyleChange('backgroundImage', `url(${imageUrl})`);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleXrayMode = () => {
    setIsXrayMode(!isXrayMode);
  };

  if (!isScanning) return null;

  return (
    
    <div
      className={`sidebar ${isXrayMode ? 'xray-mode' : ''}`}
      ref={sidebarRef}
      style={{ width: '300px' }}
    >
      <div className="resize-handle" onMouseDown={() => (isResizing.current = true)} />
      <button className="sidebar-close" ref={toggleButtonRef} onClick={toggleScanner}>
        &times;
        close
      </button>
      <button className="xray-toggle" onClick={toggleXrayMode}>
        X-ray Mode
      </button>
      <h2>Edit Styles</h2>
      <RangeInput
        label="Width"
        value={parseInt(styles.width, 10) || 0}
        min="0"
        max="1000"
        step="1"
        onChange={(value) => onStyleChange('width', `${value}px`)}
      />
      <RangeInput
        label="Height"
        value={parseInt(styles.height, 10) || 0}
        min="0"
        max="1000"
        step="1"
        onChange={(value) => onStyleChange('height', `${value}px`)}
      />
      <RangeInput
        label="Font Size"
        value={parseInt(styles.fontSize, 10) || 0}
        min="0"
        max="100"
        step="1"
        onChange={(value) => onStyleChange('fontSize', `${value}px`)}
      />
      <div className="input-group">
        <label>Background Image</label>
        <input type="file" accept="image/jpeg" onChange={handleImageUpload} />
        {backgroundImage && (
          <>
            <SelectInput
              label="Background Size"
              value={styles.backgroundSize}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'auto', label: 'Auto' },
              ]}
              onChange={(value) => onStyleChange('backgroundSize', value)}
            />
            <SelectInput
              label="Background Position"
              value={styles.backgroundPosition}
              options={[
                { value: 'center', label: 'Center' },
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={(value) => onStyleChange('backgroundPosition', value)}
            />
          </>
        )}
      </div>
      <CheckboxInput
        label="Flexbox"
        checked={styles.display === 'flex'}
        onChange={(checked) => onStyleChange('display', checked ? 'flex' : 'block')}
      />
      <SelectInput
        label="Position"
        value={styles.position}
        options={[
          { value: 'static', label: 'Static' },
          { value: 'relative', label: 'Relative' },
          { value: 'absolute', label: 'Absolute' },
          { value: 'fixed', label: 'Fixed' },
          { value: 'sticky', label: 'Sticky' },
        ]}
        onChange={(value) => onStyleChange('position', value)}
      />
      <SelectInput
        label="Margin"
        value={styles.marginType || 'all'}
        options={[
          { value: 'all', label: 'All' },
          { value: 'top', label: 'Top' },
          { value: 'right', label: 'Right' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' },
        ]}
        onChange={(value) => onStyleChange('marginType', value)}
      />
      <RangeInput
        label={`Margin ${styles.marginType || 'All'}`}
        value={parseInt(styles.margin, 10) || 0}
        min="0"
        max="100"
        step="1"
        onChange={(value) => onStyleChange(styles.marginType || 'margin', `${value}px`)}
      />
      <RangeInput
        label="Border Radius"
        value={parseInt(styles.borderRadius, 10) || 0}
        min="0"
        max="100"
        step="1"
        onChange={(value) => onStyleChange('borderRadius', `${value}px`)}
      />
      <ColorInput
        label="Border Color"
        value={styles.borderColor}
        onChange={(value) => onStyleChange('borderColor', value)}
      />
      <RangeInput
        label="Border Size"
        value={parseInt(styles.borderWidth, 10) || 0}
        min="0"
        max="20"
        step="1"
        onChange={(value) => onStyleChange('borderWidth', `${value}px`)}
      />
      <RangeInput
        label="Box Shadow Size"
        value={parseInt(styles.boxShadowSize, 10) || 0}
        min="0"
        max="20"
        step="1"
        onChange={(value) => {
          const newValue = `${value}px ${styles.boxShadowColor} ${styles.boxShadowOpacity}`;
          onStyleChange('boxShadow', newValue);
          onStyleChange('boxShadowSize', `${value}px`);
        }}
      />
      <ColorInput
        label="Shadow Color"
        value={styles.boxShadowColor}
        onChange={(value) => {
          const newValue = `${styles.boxShadowSize} ${value} ${styles.boxShadowOpacity}`;
          onStyleChange('boxShadow', newValue);
          onStyleChange('boxShadowColor', value);
        }}
      />
      <RangeInput
        label="Shadow Opacity"
        value={styles.boxShadowOpacity || 1}
        min="0"
        max="1"
        step="0.1"
        onChange={(value) => {
          const newValue = `${styles.boxShadowSize} ${styles.boxShadowColor} ${value}`;
          onStyleChange('boxShadow', newValue);
          onStyleChange('boxShadowOpacity', value);
        }}
      />
    </div>
    
  );
};

export default Sidebar;
