import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Componentcss/navbar.css'; // Import the CSS file for styling

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  // Mapping routes to page titles
  const pageTitles = {
    '/': 'Home',
    '/product-manager': 'Product Manager',
    '/gallery': 'Gallery Manager',
    '/event-manager': 'Event Manager',
    '/orders': 'Orders',
    '/messaging': 'Messages',
    '/email': 'Email',
    '/social-manager': 'Social'
  };

  const currentPageTitle = pageTitles[location.pathname] || 'Admin Panel';

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Adjust scroll detection for child containers
  useEffect(() => {
    const container = document.querySelector('.app-container'); // Adjust to match your layout container
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down, hide navbar
        setIsVisible(false);
      } else {
        // Scrolling up, show navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }} // Move navbar out of view when scrolling down
      transition={{ duration: 0.3 }}
    >
      {/* Current Page Title */}
      <div className="navbar-title">{currentPageTitle}</div>

      {/* Hamburger menu */}
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>

      {/* Admin Routes */}
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        <li className="nav-item" onClick={closeMenu}><Link to="/" style={{fontSize:'90%'}}>Home</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/orders"style={{fontSize:'90%'}}>Orders</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/product-manager"style={{fontSize:'90%'}}>Product Manager</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/messaging"style={{fontSize:'90%'}}>Messages</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/email"style={{fontSize:'90%'}}>Email</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/gallery"style={{fontSize:'90%'}}>Gallery Manager</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/event-manager"style={{fontSize:'90%'}}>Event Manager</Link></li>
        <lk className="nav-item" onClick={closeMenu}><Link to="/social-manager"style={{fontSize:'90%'}}>Social</Link></lk>

        <li className="nav-item" onClick={closeMenu}>
          <a href={import.meta.env.VITE_USER} target="_blank" rel="noopener noreferrer" style={{fontSize:'90%'}}>
            User Preview
          </a>
        </li>
        
        
      </ul>
    </motion.nav>
  );
};

export default AdminNavbar;
