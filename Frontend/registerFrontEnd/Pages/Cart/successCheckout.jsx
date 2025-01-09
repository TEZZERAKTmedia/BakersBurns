import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SuccessPage = () => {
  

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2 style={styles.heading}>Thank you for your purchase!</h2>
        <p style={styles.message}>
          Your order has been successfully placed. We hope to see you again soon!
        </p>
        
        <Link to="/store">back to shop</Link>
          
        
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
