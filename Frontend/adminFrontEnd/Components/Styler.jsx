import React, { useState } from 'react';
import '../Componentcss/styler.css'; // Make sure to import the CSS file

// Higher-Order Component
const Styler = (WrappedComponent) => {
  return (props) => {
    const [width, setWidth] = useState(200); // Initial width in pixels
    const [height, setHeight] = useState(200); // Initial height in pixels
    const [bgColor, setBgColor] = useState('#ff0000'); // Initial background color
    const [borderRadius, setBorderRadius] = useState(0); // Initial border radius in pixels

    const handleWidthChange = (e) => {
      setWidth(e.target.value);
    };

    const handleHeightChange = (e) => {
      setHeight(e.target.value);
    };

    const handleBgColorChange = (e) => {
      setBgColor(e.target.value);
    };

    const handleBorderRadiusChange = (e) => {
      setBorderRadius(e.target.value);
    };

    return (
      <div>
        <WrappedComponent
          {...props}
          style={{
            ...props.style,
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: bgColor,
            borderRadius: `${borderRadius}px`,
            transition: 'all 0.3s ease',
          }}
        />

        <div className="css-adjuster-container">
          <div className="css-adjuster-slider">
            <label className="css-adjuster-label">
              Width: {width}px
              <input
                type="range"
                min="50"
                max="500"
                value={width}
                onChange={handleWidthChange}
              />
            </label>
          </div>

          <div className="css-adjuster-slider">
            <label className="css-adjuster-label">
              Height: {height}px
              <input
                type="range"
                min="50"
                max="500"
                value={height}
                onChange={handleHeightChange}
              />
            </label>
          </div>

          <div className="css-adjuster-slider">
            <label className="css-adjuster-label">
              Background Color:
              <input type="color" value={bgColor} onChange={handleBgColorChange} />
            </label>
          </div>

          <div className="css-adjuster-slider">
            <label className="css-adjuster-label">
              Border Radius: {borderRadius}px
              <input
                type="range"
                min="0"
                max="100"
                value={borderRadius}
                onChange={handleBorderRadiusChange}
              />
            </label>
          </div>
        </div>
      </div>
    );
  };
};

export default Styler;
