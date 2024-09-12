import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import Store from './Pages/Store';
import About from './Pages/About';
import Create from './Pages/Create';
import UserDashboard from './Pages/Profile';
import Cart from './Pages/Cart';
import Settings from './Pages/Settings';
import './App.css';
import VerificationWrapper from './Components/verification/codeVerification';
import ScrollVideoBackground from './Components/Background'; // Import the ScrollVideoBackground component

function UserApp() {
  return (
    <div className="app-container">
      <ScrollVideoBackground />
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/create" element={<Create />} />
        <Route path="/about" element={<About />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/cart" element={<Cart />} />
        {/* Wrap Settings route in VerificationWrapper */}
        <Route 
          path="/settings" 
          element={
            <VerificationWrapper>
              <Settings />
            </VerificationWrapper>
          }
        />
      </Routes>
    </div>
  );
}

export default UserApp;
