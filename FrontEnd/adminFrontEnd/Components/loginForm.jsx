import React, { useState } from 'react';
import { adminApi } from '../config/axios';

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.post('/auth/admin-login', { identifier, password }, {
        withCredentials: true, // This will ensure the cookie is stored in the browser
      });

      // If login is successful, trigger the login success callback
      onLoginSuccess(response.data.role); // Pass the user role to parent component
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Error logging in: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (
    <div className="container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your username or email"
          required
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{ padding: '10px' }}
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminLoginForm;
