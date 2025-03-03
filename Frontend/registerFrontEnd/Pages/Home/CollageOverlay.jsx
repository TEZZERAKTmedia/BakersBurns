import React from 'react';
import CollageImage from './ParallaxImage'; // the updated component
import './CollageOverlay.css';
// Import images from your assets folder
import img1 from '../../assets/img1.webp';
import img2 from '../../assets/img2.webp';
import img3 from '../../assets/img3.webp';
import img4 from '../../assets/img4.webp';
import img5 from '../../assets/img5.webp';
import img6 from '../../assets/img7.webp';

const collageItems = [
  { src: img1, top: '10%', left: '10%', zIndex: 9, parallaxFactor: 1 },
  { src: img2, top: '15%', left: '60%', zIndex: 7, parallaxFactor: 2 },
  { src: img3, top: '40%', left: '10%', zIndex: 5, parallaxFactor: 1},
  { src: img4, top: '45%', left: '60%', zIndex: 3, parallaxFactor: 2 },
  { src: img5, top: '70%', left: '10%', zIndex: 10, parallaxFactor: 1 },
  { src: img6, top: '75%', left: '60%', zIndex: 4, parallaxFactor: 2 },
];

const CollageOverlay = () => {
  return (
    <div className="collage-overlay">
      {collageItems.map((item, i) => (
        <CollageImage
          key={i}
          src={item.src}
          top={item.top}
          left={item.left}
          zIndex={item.zIndex}
          parallaxFactor={item.parallaxFactor}
        />
      ))}
    </div>
  );
};

export default CollageOverlay;
