import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import Store from './Pages/Store/Store';
import About from './Pages/About';
import Create from './Pages/Create';
import Orders from './Pages/Orders';
import Cart from './Pages/Cart';
import Settings from './Pages/Settings';
import Success from './Components/purchase/successfulPurchase';
import InAppMessaging from './Pages/inAppMessaging';
import Event from './Pages/Events';
import Gallery from './Pages/Gallery';

import { NotificationProvider } from './Components/notification/notification';
import './App.css';
import VerificationWrapper from './Components/verification/verificationWrapper';
import ScrollVideoBackground from './Components/Background'; // Import the ScrollVideoBackground component
import PrivacyPolicy from './Components/Privacy&Terms/privacyPolicy';
import TermsOfService from './Components/Privacy&Terms/termsOfService';


function UserApp() {
  return (
    <NotificationProvider> {/* Wrap the entire app in NotificationProvider */}
      <div className="app-container">
        <ScrollVideoBackground />
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/create" element={<Create />} />
          <Route path="/about" element={<About />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/success" element={<Success />} />
          <Route path="/in-app-messaging" element={<InAppMessaging />} />
          <Route path="/event" element={<Event />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy/>} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
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
    </NotificationProvider>
  );
}

export default UserApp;
