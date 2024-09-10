import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UserApp from './userApp.jsx';
import './index.css';
 // Ensure correct import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
      <BrowserRouter>
        <UserApp />
      </BrowserRouter>
    
  </React.StrictMode>
);
