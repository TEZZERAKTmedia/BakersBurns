import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Componentcss/navbar.css'; // Import the CSS file for styling
import Logo from '../assets/LogoTP.png'; // Adjust the path to your logo image

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      {/*<img src={Logo} alt="Logo" className="navbar-logo" />*/}
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        <li className="nav-item"><Link to="/">Home</Link></li>
        <li className="nav-item"><Link to="/store">Store</Link></li>
        <li className="nav-item"><Link to="/events">Events</Link></li>
        <li className="nav-item"><Link to="/create">Create</Link></li>
        <li className="nav-item"><Link to="/about">About</Link></li>
        <li className="nav-item"><Link to="/userDashBoard">User DashBoard</Link></li>
        <li className="nav-item"><Link to="/cart">C</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
