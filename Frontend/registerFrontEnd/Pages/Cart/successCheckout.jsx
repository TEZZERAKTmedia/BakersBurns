import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../../config/axios';

const SuccessPage = () => {
  const sessionId = localStorage.getItem('sessionId'); // Get session ID from local storage
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false); // To handle the button loading state
  const [error, setError] = useState(null); // To display error messages

  const handleSuccessCheckout = async () => {
    if (!sessionId) {
      console.warn('SuccessPage: No session ID found in local storage.');
      setError('No active session found. Please try again.');
      return;
    }

    setIsProcessing(true); // Start processing
    setError(null); // Clear any previous error

    try {
      const response = await registerApi.post('/register-cart/success-checkout', { sessionId });
      console.log('SuccessPage: Checkout session successfully handled.', response.data);

      // Redirect to the home page after successful API call
      navigate('/');
    } catch (error) {
      console.error('SuccessPage: Error during API call to complete checkout session:', error);
      if (error.response) {
        console.error('SuccessPage: API error response:', error.response.data);
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
        <h2 style={styles.heading}>Thank you for your purchase!</h2>
        <p style={styles.message}>
          Your order has been successfully placed. We hope to see you again soon!
        </p>
        {error && <p style={styles.error}>{error}</p>}
        <button
          style={styles.button}
          onClick={handleSuccessCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Continue Shopping'}
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
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
};

export default SuccessPage;
