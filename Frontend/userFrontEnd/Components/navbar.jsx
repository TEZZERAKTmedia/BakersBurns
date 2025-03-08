import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "./logoutButton";
import { FaCog } from "react-icons/fa";
import SocialLinks from "./socialLinks";
import ThemeToggle from "./themToggleButton";
import "../Componentcss/navbar.css";

const Navbar = () => {
  // Set initial state based on window width
  const isInitialLarge = window.innerWidth >= 1000;
  const [menuOpen, setMenuOpen] = useState(isInitialLarge);
  const [isLargeScreen, setIsLargeScreen] = useState(isInitialLarge);
  const location = useLocation();

  // Define page titles for routes
  const pageTitles = {
    "/": "Home",
    "/store": "Store",
    "/orders": "Orders",
    "/cart": "Cart",
    "/in-app-messaging": "Messages",
    "/event": "Events",
    "/gallery": "Gallery",
    "/about": "About",
    "/settings": "Settings",
  };

  const currentPageTitle = pageTitles[location.pathname] || "";

  // Listen for window resize events to determine screen size
  useEffect(() => {
    const handleResize = () => {
      const isWide = window.innerWidth >= 1000;
      setIsLargeScreen(isWide);
      // On desktop, always keep menu open
      setMenuOpen(isWide);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle menu only on mobile
  const toggleMenu = () => {
    if (!isLargeScreen) {
      setMenuOpen((prev) => !prev);
    }
  };

  // Close menu on nav item click (only on mobile)
  const closeMenu = () => {
    if (!isLargeScreen) {
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        {/* Page Title with motion animation */}
        <AnimatePresence mode="wait">
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

        {isLargeScreen ? (
          // Desktop nav: All items inline
          <ul className="nav-list desktop">
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/">Home</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/store">Store</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/orders">Orders</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/cart">Cart</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/in-app-messaging">Messages</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/event">Events</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/gallery">Gallery</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/about">About</Link>
            </li>
            <li className="nav-item" onClick={closeMenu}>
              <Link to="/settings">Settings</Link>
            </li>
            <li className="nav-item">
              <ThemeToggle />
            </li>
            <li className="nav-item">
              <SocialLinks />
            </li>
            <li className="nav-item">
              <LogoutButton />
            </li>
          </ul>
        ) : (
          // Mobile nav: Show hamburger and overlay menu
          <>
            <div
              className={`hamburger-menu ${menuOpen ? "open" : ""}`}
              onClick={toggleMenu}
            >
              <div className="bar1"></div>
              <div className="bar2"></div>
              <div className="bar3"></div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation Overlay */}
      {!isLargeScreen && (
        <AnimatePresence>
          {menuOpen && (
            <motion.ul
              className={`nav-list mobile ${menuOpen ? "show" : ""}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/">Home</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/store">Store</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/orders">Orders</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/cart">Cart</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/in-app-messaging">Messages</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/event">Events</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/gallery">Gallery</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/about">About</Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link to="/settings">Settings</Link>
              </li>
              <li className="nav-item">
                <ThemeToggle />
              </li>
              <li className="nav-item">
                <SocialLinks />
              </li>
              <li className="nav-item">
                <LogoutButton />
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
};

export default Navbar;
