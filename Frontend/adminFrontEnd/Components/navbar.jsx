import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Componentcss/navbar.css';

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  const pageTitles = {
    '/': 'Home',
    '/product-manager': 'Product Manager',
    '/gallery': 'Gallery Manager',
    '/event-manager': 'Event Manager',
    '/orders': 'Orders',
    '/messaging': 'Messages',
    '/email': 'Email',
    '/social-manager': 'Social',
    '/discount' : 'Discount',
    '/invoices' : 'Invoices'
  };

  const currentPageTitle = pageTitles[location.pathname] || 'Admin Panel';

  // Toggle the menu state
  const toggleMenu = () => setMenuOpen((prevState) => !prevState);

  // Close the menu
  const closeMenu = () => setMenuOpen(false);

  // Handle scroll to hide/show navbar
  useEffect(() => {
    const container = document.querySelector('.app-container');
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location]);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navbar top section */}
      <div className="navbar-top">
        <div className="navbar-title">{currentPageTitle}</div>
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
      <ul className={`nav-grid ${menuOpen ? 'show' : ''}`}>
        {Object.entries(pageTitles).map(([path, title]) => (
          <li className="nav-item" key={path}>
            <Link
              to={path}
              className="nav-link"
              onClick={(e) => {
                e.stopPropagation(); // Prevent interference
                closeMenu();
              }}
            >
              {title}
            </Link>
          </li>
        ))}
        <li className="nav-item">
          <a
            href={import.meta.env.VITE_USER}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            User Preview
          </a>
        </li>
      </ul>
    </motion.nav>
  );
};

export default AdminNavbar;
