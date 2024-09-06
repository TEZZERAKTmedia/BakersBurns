import React from 'react';
import { Link } from 'react-router-dom';
import '../Componentcss/navbar.css';  // Import the CSS file for styling
import { useScanner } from '../context/scannerContext';

const Navbar = () => {
    const { isScanning, toggleScanner, toggleButtonRef } = useScanner();

    return (
        <nav className="navbar">
            <ul className="nav-list">
                <li className="nav-item"><Link to="/">Home</Link></li>
                <li className="nav-item"><Link to="/gallery">Gallery</Link></li> {/* Updated path */}
                <li className="nav-item"><Link to="/product-manager">Product Manager</Link></li> {/* Updated path */}
                <li className="nav-item"><Link to="/layout">User Preview</Link></li> {/* Updated path */}
                <button ref={toggleButtonRef} onClick={toggleScanner} className="scanner-toggle-button">
                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                </button>
            </ul>
        </nav>
    );
};

export default Navbar;
