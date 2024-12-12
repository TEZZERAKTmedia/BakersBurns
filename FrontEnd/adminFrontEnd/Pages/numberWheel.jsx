import React, { useState } from "react";

const QuantitySelector = () => {
  const [quantity, setQuantity] = useState(0);

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99)); // Max 99
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 0)); // Min 0
  };

  return (
    <div style={styles.container}>
      <button onClick={decreaseQuantity} style={styles.button}>
        -
      </button>
      <div style={styles.selector}>
        <div
          style={{
            ...styles.wheel,
            transform: `translateY(-${quantity * 60}px)`,
          }}
        >
          {Array.from({ length: 100 }).map((_, index) => (
            <div key={index} style={styles.number}>
              {index}
            </div>
          ))}
        </div>
      </div>
      <button onClick={increaseQuantity} style={styles.button}>
        +
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '10px',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  button: {
    padding: "10px",
    fontSize: "1.5rem",
    cursor: "pointer",
    border: "1px solid #ccc",
    backgroundColor: "#f0f0f0",
    borderRadius: "5px",
  },
  selector: {
    width: "60px",
    height: "60px",
    overflow: "hidden",
    border: "2px solid #ccc",
    borderRadius: "10px",
    position: "relative",
    backgroundColor: "#fff",
  },
  wheel: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: 0,
    left: 0,
    transition: "transform 0.3s ease-out",
  },
  number: {
    height: "60px",
    width: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    borderBottom: "1px solid #ddd",
  },
};

export default QuantitySelector;
