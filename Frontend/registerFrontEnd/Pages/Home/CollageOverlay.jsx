import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Import images
import img1 from "../../assets/img1.webp";
import img2 from "../../assets/img2.webp";
import img3 from "../../assets/img3.webp";
import img4 from "../../assets/img4.webp";
import img5 from "../../assets/img5.webp";
import img6 from "../../assets/img6.webp";
import img7 from "../../assets/img7.webp";
import img8 from "../../assets/img8.webp";
import img9 from "../../assets/img9.webp";
import img10 from "../../assets/img10.webp";
import img11 from "../../assets/img11.webp";

// Generates a random value within a range
const getRandom = (min, max) => Math.random() * (max - min) + min;

// Initial image positions
const initialCollageItems = [
  { src: img1, top: "5%", left: "5%", zIndex: 5 },
  { src: img2, top: "10%", left: "75%", zIndex: 6 },
  { src: img3, top: "20%", left: "35%", zIndex: 4 },
  { src: img4, top: "15%", left: "55%", zIndex: 7 },
  { src: img5, top: "25%", left: "10%", zIndex: 3 },
  { src: img6, top: "30%", left: "80%", zIndex: 8 },
  { src: img7, top: "45%", left: "5%", zIndex: 2 },
  { src: img8, top: "50%", left: "65%", zIndex: 9 },
  { src: img9, top: "55%", left: "25%", zIndex: 1 },
  { src: img10, top: "70%", left: "50%", zIndex: 10 },
  { src: img11, top: "65%", left: "0%", zIndex: 10 },

];


const CollageOverlay = () => {
  const [collageItems, setCollageItems] = useState([]);

  useEffect(() => {
    // Function to generate **inverted** z-index values
    const generateRandomStyles = (prevItems) =>
      prevItems.map((item) => ({
        ...item,
        opacity: 1, // Initially fully visible
        zIndex: 11 - item.zIndex, // **Invert the z-index (higher ones get lower, lower ones get higher)**
        scale: getRandom(0.8, 1.5), // Random scale (0.8 = smaller, 1.5 = larger)
        rotate: getRandom(-15, 15), // Small random tilt (-15 to 15 degrees)
      }));

    setCollageItems(generateRandomStyles(initialCollageItems));

    const animateCycle = () => {
      // Step 1: Fade Out COMPLETELY before changing anything
      setCollageItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          opacity: 0, // Fully fade out
        }))
      );

      setTimeout(() => {
        // Step 2: Apply new transformations ONLY AFTER full fade-out
        setCollageItems((prevItems) => generateRandomStyles(prevItems));
      }, 2000); // Wait for fade-out duration before changing styles

      setTimeout(() => {
        // Step 3: Fade Back In ONLY AFTER transformations complete
        setCollageItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            opacity: 1, // Fully visible again
          }))
        );
      }, 3000); // Reappear after transformations
    };

    // Repeat animation every 6 seconds
    const interval = setInterval(animateCycle, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {collageItems.map((item, i) => (
        <motion.img
          key={i}
          src={item.src}
          style={{
            position: "absolute",
            top: item.top,
            left: item.left,
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderRadius: "8px",
            zIndex: item.zIndex, // **Now properly cycles z-index inversely**
          }}
          animate={{
            opacity: item.opacity,
            scale: item.scale,
            rotate: item.rotate,
          }}
          transition={{
            opacity: { duration: 2 }, // Fade in/out takes 2s
            scale: { duration: 2, ease: "easeInOut" }, // Scale smoothly
            rotate: { duration: 2, ease: "easeInOut" }, // Rotate smoothly
          }}
        />
      ))}
    </div>
  );
};

export default CollageOverlay;
