import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Componentcss/navbar.css';  // Import the CSS file for styling


const Navbar = () => {
    const [message, setMessage] = useState('');

    const handleClick = (e) => {
        e.preventDefault()
        setMessage('Please Sign up or Sign in')
        setTimeout(() => {
            setMessage('');
            window.location.href = '/store';
        }, 2000);
    };


    return (
        <nav className="navbar">
            <ul className="nav-list">
                
                <li className="nav-item" onClick={handleClick}><Link to="/store">Store</Link></li>
                <li className="nav-item"><Link to="/about">About</Link></li>
                
                <li className="nav-item"><Link to="/signup">Sign Up</Link></li>
                <li className="nav-item"><Link to="/login">Log In</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
