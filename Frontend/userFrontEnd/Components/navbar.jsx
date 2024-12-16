import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './logoutButton';
import '../Componentcss/navbar.css'; // Import the CSS file for styling
import { FaCog } from 'react-icons/fa'; // Import settings icon from Font Awesome
import ThemeToggle from './themToggleButton';
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Hamburger menu icon */}
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>
      
      {menuOpen && <LogoutButton />}

      {/* Navbar links */}
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        <li className="nav-item" onClick={closeMenu}><Link to="/" >Home</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/store">Store</Link></li>
        {/*<li className="nav-item" onClick={closeMenu}><Link to="/create">Create</Link></li>*/}
        
        <li className="nav-item" onClick={closeMenu}><Link to="/orders">Orders</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/cart">Cart</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/in-app-messaging">Messages</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/event">Events</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/gallery">Gallery</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/about">About</Link></li>
        
      </ul>

      {/* Settings icon at the bottom of the navbar, visible only when menu is open */}
      {menuOpen &&
      <div className={`settings-icon ${menuOpen ? 'show' : ''}`} onClick={closeMenu} >
        <Link to="/settings" style={{marginRight: '30px'}}>
          <FaCog  size={24} /> {/* Adjust the icon size as needed */}
        </Link>
      </div>
      }
    </nav>
  );
};

export default Navbar;
