import React from 'react';
import CollageImage from './ParallaxImage'; // the updated component

// Define your collage items with more drastic differences.
// The ones with higher zIndex (closer) have lower parallaxFactor (move slower).
// The ones with lower zIndex (further back) have higher parallaxFactor (move faster).
const collageItems = [
  { src: require('../assets/img1.webp'), top: '10%', left: '5%', zIndex: 9, parallaxFactor: 0.3 },
  { src: require('../assets/img2.webp'), top: '15%', left: '60%', zIndex: 7, parallaxFactor: 0.6 },
  { src: require('../assets/img3.webp'), top: '40%', left: '20%', zIndex: 5, parallaxFactor: 1.0 },
  { src: require('../assets/img4.webp'), top: '55%', left: '70%', zIndex: 3, parallaxFactor: 1.5 },
  { src: require('../assets/img5.webp'), top: '70%', left: '15%', zIndex: 10, parallaxFactor: 0.2 },
  { src: require('../assets/img6.webp'), top: '85%', left: '50%', zIndex: 4, parallaxFactor: 1.8 },
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
