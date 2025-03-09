import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./CollageOverlay.css";

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

// Initial collage setup
const initialCollageItems = [
  { src: img1, top: "10%", left: "10%" },
  { src: img2, top: "12%", left: "60%" },
  { src: img3, top: "15%", left: "20%" },
  { src: img4, top: "20%", left: "55%" },
  { src: img5, top: "30%", left: "15%" },
  { src: img6, top: "40%", left: "70%" },
  { src: img7, top: "50%", left: "10%" },
  { src: img8, top: "55%", left: "60%" },
  { src: img9, top: "70%", left: "25%" },
  { src: img10, top: "75%", left: "50%" },
];

const CollageOverlay = () => {
  const [collageItems, setCollageItems] = useState([]);

  useEffect(() => {
    // Generate initial randomized zIndex and scale for images
    const updatedItems = initialCollageItems.map((item) => ({
      ...item,
      zIndex: Math.floor(getRandom(1, 10)), // Random zIndex between 1-10
      scale: getRandom(0.8, 1.5), // Scale varies from 0.8 (farther) to 1.5 (closer)
    }));

    setCollageItems(updatedItems);

    // Update images periodically to create animation effect
    const interval = setInterval(() => {
      setCollageItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          zIndex: Math.floor(getRandom(1, 10)), // Random new zIndex
          scale: getRandom(0.8, 1.5), // Adjust scale accordingly
        }))
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="collage-overlay">
      {collageItems.map((item, i) => (
        <motion.img
          key={i}
          src={item.src}
          className="collage-item"
          style={{
            top: item.top,
            left: item.left,
            zIndex: item.zIndex,
          }}
          animate={{
            scale: item.scale, // Animate scale based on z-index
            rotate: getRandom(-10, 10), // Random tilt between -10 to 10 degrees
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

export default CollageOverlay;
