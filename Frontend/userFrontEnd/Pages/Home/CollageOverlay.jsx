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

// Generates a random value within a range
const getRandom = (min, max) => Math.random() * (max - min) + min;

// Initial image positions
const initialCollageItems = [
  { src: img1, top: "10%", left: "10%" },
  { src: img2, top: "12%", left: "70%" },
  { src: img3, top: "15%", left: "40%" },
  { src: img4, top: "20%", left: "55%" },
  { src: img5, top: "20%", left: "25%" },
  { src: img6, top: "70%", left: "70%" },
  { src: img7, top: "65%", left: "10%" },
  { src: img8, top: "65%", left: "60%" },
  { src: img9, top: "70%", left: "25%" },
  { src: img10, top: "75%", left: "50%" },
];

const CollageOverlay = () => {
  const [collageItems, setCollageItems] = useState([]);

  useEffect(() => {
    const generateRandomStyles = () =>
      initialCollageItems.map((item) => ({
        ...item,
        opacity: 1, // Visible initially
        zIndex: Math.floor(getRandom(1, 10)), // Random z-index
        scale: getRandom(0.8, 1.5), // Random scale (0.8 = smaller, 1.5 = larger)
        rotate: getRandom(-15, 15), // Small random tilt (-15 to 15 degrees)
      }));

    setCollageItems(generateRandomStyles());

    const animateCycle = () => {
      // Step 1: Fade Out Before Moving
      setCollageItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          opacity: 0, // Fade out
        }))
      );

      setTimeout(() => {
        // Step 2: Move, Change Scale, Z-Index While Hidden
        setCollageItems(generateRandomStyles());
      }, 1200); // Wait for fade-out before repositioning

      setTimeout(() => {
        // Step 3: Fade In After Repositioning
        setCollageItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            opacity: 1, // Fade back in
          }))
        );
      }, 2200); // Reappear after repositioning
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
            zIndex: item.zIndex,
          }}
          animate={{
            opacity: item.opacity,
            scale: item.scale,
            rotate: item.rotate,
          }}
          transition={{
            opacity: { duration: 1.2 },
            scale: { duration: 2, ease: "easeInOut" },
            rotate: { duration: 2, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
};

export default CollageOverlay;
