import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Componentcss/navbar.css';  // Import the CSS file for styling
import { useScanner } from '../context/scannerContext';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isScanning, toggleScanner, toggleButtonRef } = useScanner();
    const navigate = useNavigate();

    useEffect(() => {
        // Initial authentication check on mount
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/auth/check-auth', {
                withCredentials: true,
            });
            setUserRole(response.data.role);
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkClick = async (path) => {
        setLoading(true); // Optional: Show loading when checking authentication
        await checkAuth(); // Check auth again before navigating

        if (isAuthenticated && userRole === 'admin') {
            navigate(path); // Navigate to the desired path if authenticated
        } else {
            window.location.href = "http://localhost:3001"; // Redirect to login if not authenticated
        }
    };

    // If still loading, show a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <nav className="navbar">
            <ul className="nav-list">
                <li className="nav-item">
                    <Link to="#" onClick={() => handleLinkClick('/admin')}>Home</Link>
                </li>
                <li className="nav-item">
                    <Link to="#" onClick={() => handleLinkClick('/admin/gallery')}>Gallery</Link>
                </li>
                <li className="nav-item">
                    <Link to="#" onClick={() => handleLinkClick('/admin/product-manager')}>Product Manager</Link>
                </li>
                <li className="nav-item">
                    <Link to="#" onClick={() => handleLinkClick('/admin/layout')}>User Preview</Link>
                </li>
                <button ref={toggleButtonRef} onClick={toggleScanner} className="scanner-toggle-button">
                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                </button>
            </ul>
        </nav>
    );
};

export default Navbar;
