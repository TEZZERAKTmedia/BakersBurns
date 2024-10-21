import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Componentcss/navbar.css'; // Import the CSS file for styling

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      {/* Hamburger menu */}
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>

      {/* Admin Routes */}
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        <li className="nav-item" onClick={closeMenu}><Link to="/">Admin Home</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/gallery">Admin Gallery</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/product-manager">Product Manager</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/layout">User App Layout</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/orders">Orders</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/messaging">Messages</Link></li>

      </ul>
    </nav>
  );
};

export default AdminNavbar;
