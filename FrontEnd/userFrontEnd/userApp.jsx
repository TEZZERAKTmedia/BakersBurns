import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import Store from './Pages/Store';
import About from './Pages/About';
import Create from './Pages/Create';
import UserDashboard from './Pages/UserDash';
import Cart from './Pages/Cart';
import './App.css';
import { AuthContext } from './authProvider'; // Ensure correct import
import ScrollVideoBackground from './Components/Background'; // Import the ScrollVideoBackground component

const TokenHandler = () => {
  const location = useLocation();
  const { setAuthToken } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setAuthToken(tokenFromUrl);
    }
  }, [location.search, setAuthToken]);

  return null; // This component does not render anything
};

function UserApp() {
  return (
    <div className="app-container">
      <ScrollVideoBackground /> {/* Add the ScrollVideoBackground component */}
      <Navbar />
      <TokenHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/create" element={<Create />} />
        <Route path="/about" element={<About />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default UserApp;
