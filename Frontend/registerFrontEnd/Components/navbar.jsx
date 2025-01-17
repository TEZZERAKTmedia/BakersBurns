import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from '../Components/socialLinks'
import '../Componentcss/navbar.css'; // Import the CSS file for styling
import { FaCog } from 'react-icons/fa'; // Import settings icon from Font Awesome

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
    
      <div>
      <button style={{backgroundColor:'white', color:'black', padding:'5px', margin:'10px', borderRadius:'20px'}} onClick={closeMenu}><Link style={{textDecoration:'none', color:'black'}} to="/sign-up">Sign up</Link></button>
      <button style={{backgroundColor:'white', color:'black', padding:'5px', margin:'10px', borderRadius:'20px'}} onClick={closeMenu}><Link style={{textDecoration:'none', color:'black'}} to="/login">Login</Link></button>
      </div>
      {/* Navbar links */}
      <ul className={`nav-list ${menuOpen ? 'show' : ''}`}>
        
        <li className="nav-item" onClick={closeMenu}><Link to="/">Home</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/store">Store</Link></li>
        <li className="nav-item" onClick={closeMenu}><Link to="/cart">Cart</Link></li>
        {/*<li className="nav-item" onClick={closeMenu}><Link to="/create">Create</Link></li>*/}
        <li className="nav-item" onClick={closeMenu}><Link to="/about">About</Link></li> 
        <SocialLinks />
        <li className="nav-item-privacy" onClick={closeMenu}><Link to="/privacy-policy" style={{textDecoration:'none', color:'white', padding:'10px'}}>Privacy Policy</Link></li>
        <li className="nav-item-terms" onClick={closeMenu}><Link to="/terms-of-service" style={{textDecoration:'none', color:'white', padding:'10px'}}>Terms of Service</Link></li>




        
      </ul>

      {/* Settings icon at the bottom of the navbar, visible only when menu is open */}

    </nav>
  );
};

export default Navbar;
