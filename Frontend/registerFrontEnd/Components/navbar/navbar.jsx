import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SocialLinks from './socialLinks';
import ThemeToggle from '../themetoggle/Dark-Light';
import './navbar.css'; // Import the CSS file for styling

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    '/': 'Home',
    '/sign-up': 'Sign Up',
    '/login': 'Login',
    '/store': 'Store',
    '/cart': 'Cart',
    '/about': 'About',
    '/gallery' : 'Gallery',
    '/privacy-policy': 'Privacy Policy',
    '/terms-of-service': 'Terms of Service',
  };

  const currentPageTitle = pageTitles[location.pathname] || '';

  // Toggles the entire menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Closes the entire menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Top Section */}
      <div className="navbar-top">

        {/* Page title FIRST */}
        <AnimatePresence>
          <motion.div
            className="navbar-title"
            key={location.pathname}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            onClick={toggleMenu}
          >
            {currentPageTitle}
          </motion.div>
        </AnimatePresence>

        {/* Conditionally render Login/Sign-up only if menuOpen is true */}
        {menuOpen && (
          <div className="navbar-auth-buttons">
            <button className="inverted-button-container" onClick={closeMenu}>
              <Link to="/sign-up" className="inverted-button">Sign up</Link>
            </button>
            <button className="inverted-button-container" onClick={closeMenu}>
              <Link to="/login" className="inverted-button">Login</Link>
            </button>
          </div>
        )}

        {/* Hamburger menu LAST */}
        <div
          className={`hamburger-menu ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        <li className="nav-item" onClick={closeMenu}>
          <Link to="/">Home</Link>
        </li>
        <li className="nav-item" onClick={closeMenu}>
          <Link to="/store">Store</Link>
        </li>
        <li className="nav-item" onClick={closeMenu}>
          <Link to="/cart">Cart</Link>
        </li>
        <li className="nav-item" onClick={closeMenu}>
          <Link to="/about">About</Link>
        </li>
        <li className="nav-item" onClick={closeMenu}>
          <Link to="/gallery"> Gallery</Link>
        </li>
        <li className="inverted-button-p-t" onClick={closeMenu}>
          <Link to="/privacy-policy" className="inverted-button">Privacy Policy</Link>
        </li>
        <li className="inverted-button-p-t" onClick={closeMenu}>
          <Link to="/terms-of-service" className="inverted-button">Terms of Service</Link>
        </li>
        {/* Theme Toggle */}
        <ThemeToggle />
      </ul>

      {/* Social Media Links */}
      {menuOpen && (
        <div>
          <SocialLinks />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
