import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxImage = ({ src, top, left, zIndex, parallaxFactor, scrollRange = 2000, baseOffset = 100 }) => {
  const { scrollY } = useScroll();
  // The output range is multiplied by parallaxFactor.
  const yOffset = useTransform(scrollY, [0, scrollRange], [0, -baseOffset * parallaxFactor]);

  return (
    <motion.div
      className="collage-item"
      style={{
        top,
        left,
        zIndex,
        y: yOffset,
      }}
    >
      <img src={src} alt="Collage" />
    </motion.div>
  );
};

export default ParallaxImage;
