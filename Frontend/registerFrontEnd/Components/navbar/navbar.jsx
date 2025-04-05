import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SocialLinks from './socialLinks';
import ThemeToggle from '../themetoggle/Dark-Light';
import './navbar.css';

const Navbar = () => {
  // On large screens (width ≥ 1000px) we always want the menu open.
  const [menuOpen, setMenuOpen] = useState(window.innerWidth >= 1000);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1000);
  const location = useLocation();

  const pageTitles = {
    '/': 'Home',
    '/sign-up': 'Sign Up',
    '/login': 'Login',
    '/store': 'Store',
    '/cart': 'Cart',
    '/about': 'About',
    '/gallery': 'Gallery',
    '/privacy-policy': 'Privacy Policy',
    '/terms-of-service': 'Terms of Service',
  };

  const currentPageTitle = pageTitles[location.pathname] || '';

  // Listen for window resize and force menu open on desktop.
  useEffect(() => {
    const handleResize = () => {
      const isWide = window.innerWidth >= 1000;
      setIsLargeScreen(isWide);
      setMenuOpen(isWide); // Always open on large screens.
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle only for mobile.
  const toggleMenu = () => {
    if (!isLargeScreen) {
      setMenuOpen(prev => !prev);
    }
  };

  // Close mobile menu on nav item click.
  const closeMenu = () => {
    if (!isLargeScreen) {
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      
      <div className="navbar-top">

        {/* Page Title */}
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
        {!isLargeScreen && !menuOpen && (
        <Link to="/" className="hero-title mobile-logo-link">BakersBurns</Link>
      )}
        

        {isLargeScreen ? (
          // Desktop: All nav items and auth buttons inline
          <>
            <ul className="nav-list desktop">
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
                <Link to="/gallery">Gallery</Link>
              </li>
              <div className='nav-item-tiny-desk-box'>

              <li className="nav-item-tiny-desk" onClick={closeMenu}>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li className="nav-item-tiny-desk" onClick={closeMenu}>
                <Link to="/terms-of-service">Terms of Service</Link>
              </li>
              </div>
              
              <li className="nav-item">
                <ThemeToggle />
              </li>
              <li>
              <div className="navbar-auth-buttons">
              <li >
              <button className="inverted-button-container">
                
                <Link to="/sign-up" className="inverted-button">Sign up</Link>
              </button>
              </li>
              <button className="inverted-button-container">
                <Link to="/login" className="inverted-button">Login</Link>
              </button>
            </div>
              </li>


            </ul>
          </>
        ) : (
          
          // Mobile: Show hamburger menu and auth buttons (if menu is open)
          <>
          
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
            <div
              className={`hamburger-menu ${menuOpen ? 'open' : ''}`}
              onClick={toggleMenu}
            >
              
              <div className="bar1"></div>
              <div className="bar2"></div>
              <div className="bar3"></div>
            </div>
          </>
        )}
      </div>

      {/* Mobile nav overlay */}
      {!isLargeScreen && (
        <>
          <ul className={`nav-list mobile ${menuOpen ? 'show' : ''}`}>
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
              <Link to="/gallery">Gallery</Link>
            </li>
            <div className="nav-item-tiny" onClick={closeMenu}>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </div>
            <li className="nav-item-tiny" onClick={closeMenu}>
              <Link to="/terms-of-service">Terms of Service</Link>
            </li>
            <li className="nav-item">
              <ThemeToggle />
            </li>
          </ul>
          {menuOpen && (
            <div className="social-links-nav">
              <SocialLinks />
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;
