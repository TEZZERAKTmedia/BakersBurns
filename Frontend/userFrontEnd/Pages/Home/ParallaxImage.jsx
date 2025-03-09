import React from 'react';
import './ParallaxImage.css';

const ParallaxImage = ({ src, top, left, zIndex, parallaxFactor, tiltFactor, scale }) => {
  return (
    <div
      className="parallax-image"
      style={{
        top,
        left,
        zIndex,
        transform: `scale(${scale}) rotate(${tiltFactor}deg)`, // Apply scale and tilt
      }}
    >
      <img src={src} alt="" />
    </div>
  );
};

export default ParallaxImage;
