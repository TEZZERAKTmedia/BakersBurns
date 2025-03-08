import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../config/axios';

const CancelPage = () => {
  const sessionId = localStorage.getItem('sessionId'); // Get session ID from local storage
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false); // To handle the button loading state
  const [error, setError] = useState(null); // To display error messages

  const handleCancelCheckout = async () => {
    if (!sessionId) {
      console.warn('CancelPage: No session ID found in local storage.');
      setError('No active session found. Please try again.');
      return;
    }

    setIsProcessing(true); // Start processing
    setError(null); // Clear any previous error

    try {
      const response = await userApi.post('/register-cart/cancel-checkout', { sessionId });
      console.log('CancelPage: Cancel checkout session successfully handled.', response.data);

      // Redirect to the home page after successful API call
      navigate('/');
    } catch (error) {
      console.error('CancelPage: Error during API call to cancel checkout session:', error);
      if (error.response) {
        console.error('CancelPage: API error response:', error.response.data);
        setError(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('Failed to process your request. Please try again.');
      }
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2 style={styles.heading}>Oh no, your checkout session expired!</h2>
        <p style={styles.message}>
          Don't worry, your items are still in your cart. You can continue shopping or start the checkout process again.
        </p>
        {error && <p style={styles.error}>{error}</p>}
        <button
          style={styles.button}
          onClick={handleCancelCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

// Styling for the modal
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
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
};

export default CancelPage;
