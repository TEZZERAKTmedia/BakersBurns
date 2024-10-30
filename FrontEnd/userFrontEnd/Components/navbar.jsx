import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton  from './logoutButton';
import '../Componentcss/navbar.css'; // Import the CSS file for styling

 // Adjust the path to your logo image
 

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  }



  
  return (
    <nav className="navbar">
      {/*<img src={Logo} alt="Logo" className="navbar-logo" />*/}
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        <li className="nav-item" onClick={closeMenu}><Link to="/">Home</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/store">Store</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/create">Create</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/about">About</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/orders">Orders</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/cart">Cart</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/in-app-messaging">Messages</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/event">Events</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/gallery">Gallery</Link></li>
      </ul>
 <LogoutButton />

    </nav>
  );
};

export default Navbar;
