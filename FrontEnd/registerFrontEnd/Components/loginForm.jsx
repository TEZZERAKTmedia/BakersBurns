import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../config/axios';
import '../Componentcss/login.css';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerApi.post('/auth/login', { identifier, password });

      // Log the response for debugging purposes
      console.log('Response data:', response.data);

      // Extract token and redirectUrl from response
      const { token, redirectUrl } = response.data;

      if (token) {
        // Store the token in localStorage
        localStorage.setItem('authToken', token);
      }

      if (redirectUrl) {
        // Redirect based on user role
        window.location.href = redirectUrl;
      } else {
        setMessage('Login successful, but no redirection URL was provided.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Error logging in: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (
    <div className="container">
      <h2 style={{color: 'black'}}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your username or email"
          required
          style={{boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',}}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <button type="submit">Login</button>
        <Link to="/forgotpassword" style={{textDecoration:'none', color:'white', backgroundColor:'grey', padding: '3px', borderRadius:'5px', marginTop:'20px', width:'150px', marginLeft:'25%'}}>Forgot Password?</Link>
      </form>

      
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginForm;
