import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./logoutButton";
import "../Componentcss/navbar.css";
import { FaCog } from "react-icons/fa";
import SocialLinks from "./socialLinks";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation()
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const pageTitles = {
    "/": "",
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggle the menu open/close
    setTriggerAnimation(true); // Trigger the animation on every button press
  };
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    closeMenu(); // Close menu on route change
  }, [location]);
  useEffect(() => {
    if (triggerAnimation) {
      setTimeout(() => {
        setTriggerAnimation(false);
      }, 2000); // Match the animation duration
    }
  }, [triggerAnimation]);

  return (
    <nav className="navbar">
      {/* Hamburger menu icon */}
      <div
        className={`hamburger-menu ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>

      {/* Page title */}
      <div className={`navbar-title ${triggerAnimation ? 'fade-out-in' : ''}`}>
        {currentPageTitle}
      </div>


      {/* Navbar links */}
      <ul className={`nav-list ${menuOpen ? "show" : ""}`}>
        <li className="nav-item">
          <Link to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/store">Store</Link>
        </li>
        <li className="nav-item">
          <Link to="/orders">Orders</Link>
        </li>
        <li className="nav-item">
          <Link to="/cart">Cart</Link>
        </li>
        <li className="nav-item">
          <Link to="/in-app-messaging">Messages</Link>
        </li>
        <li className="nav-item">
          <Link to="/event">Events</Link>
        </li>
        <li className="nav-item">
          <Link to="/gallery">Gallery</Link>
        </li>
        <li className="nav-item">
          <Link to="/about">About</Link>
        </li>
        <div style={{ marginTop: "20px" }}>
          <SocialLinks />
        </div>
        {menuOpen && (
          <div className="action-buttons">
            <LogoutButton />
            <Link to="/settings" className="settings-icon">
              <FaCog size={24} />
            </Link>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
