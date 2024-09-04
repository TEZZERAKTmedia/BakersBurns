import React from 'react';
import { Link } from 'react-router-dom';
import '../Componentcss/navbar.css';  // Import the CSS file for styling
import { useScanner } from '../context/scannerContext';




const Navbar = () => {
    const {isScanning, toggleScanner, toggleButtonRef } = useScanner();
    return (
        
        <nav className="navbar">
            <ul className="nav-list">
                
                <li className="nav-item"><Link to="/admin">Home</Link></li>
                <li className="nav-item"><Link to="/admin/gallery">Gallery</Link></li>

                <li className="nav-item"><Link to="/admin/product-manager">Product Manager</Link></li>
                <li className="nav-item"><Link to="/admin/layout">User Preview</Link></li>
                    <button ref={toggleButtonRef} onClick={toggleScanner} className="scanner=toggle-button">
                        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                    </button>
                    
            </ul>
        </nav>
        
    );
};

export default Navbar;
