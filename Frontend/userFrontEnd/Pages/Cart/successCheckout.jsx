import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleAnimationEnd = () => {
    // Navigate to the store page after animation ends
    navigate('/store');
  };

  const handleButtonClick = () => {
    setIsAnimating(true); // Trigger the animation
  };

  const keyframes = `
    @keyframes flipAndSlide {
      0% {
        transform: rotateY(0) translateX(0);
        opacity: 1;
      }
      50% {
        transform: rotateY(90deg) translateX(0); /* Midpoint of flip */
        opacity: 0.5; /* Slight fade at midpoint */
      }
      100% {
        transform: rotateY(180deg) translateX(100%);
        opacity: 0;
      }
    }
  `;

  return (
    <div style={styles.backdrop}>
      <style>{keyframes}</style> {/* Inject the keyframes inline */}
      <div
        style={{
          ...styles.modal,
          animation: isAnimating ? 'flipAndSlide 1s forwards' : 'none',
        }}
        onAnimationEnd={handleAnimationEnd} // Trigger navigation after animation ends
      >
        <h2 style={styles.heading}>Thank you for your purchase!</h2>
        <p style={styles.message}>
          Your order has been successfully placed. We hope to see you again soon!
        </p>

        <button
          onClick={handleButtonClick}
          style={{
            textDecoration: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            background: 'linear-gradient(to right, blue, lightgreen)',
            display: 'inline-block',
            textAlign: 'center',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Shop
        </button>
      </div>
    </div>
  );
};

// Styling for the modal and animations
const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transformOrigin: 'center', // For the flip animation
    backfaceVisibility: 'hidden', // Hides the backside of the modal
  },
  heading: {
    fontSize: '1.8rem',
    marginBottom: '10px',
    color: '#333',
  },
  message: {
    fontSize: '1rem',
    marginBottom: '20px',
    color: '#555',
  },
};

export default SuccessPage;
