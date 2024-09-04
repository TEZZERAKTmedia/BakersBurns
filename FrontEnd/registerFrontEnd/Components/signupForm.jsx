import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/signupAxiosConfig'; // Import the configured axios instance
import '../Componentcss/sign_up_form.css';
import { Link } from 'react-router-dom';

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [requirements, setRequirements] = useState({
        length: false,
        upperLowerCase: false,
        specialChar: false,
        digit: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        const length = formData.password.length >= 8;
        const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password);
        const specialChar = /(?=.*[@$!%*?&])/.test(formData.password);
        const digit = /(?=.*\d)/.test(formData.password);

        setRequirements({
            length,
            upperLowerCase,
            specialChar,
            digit
        });
    }, [formData.password]);

    useEffect(() => {
        setPasswordsMatch(formData.password !== '' && formData.password === formData.confirmPassword);
    }, [formData.password, formData.confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            
            return; 
        }

        if (!passwordRequirements.test(formData.password)) {
            setErrorMessage("Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage("Please enter a valid email address");
            return;
        }

        try {
            const response = await axiosInstance.post('/auth/signup', {
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber
                
            });
            
            
            alert(response.data.message);
            setErrorMessage(''); // Clear error message on success
        } catch (error) {
            console.error("There was an error signing up!", error);
            if (error.response) {
                setErrorMessage(error.response.data.message || "Error signing up");
            } else {
                setErrorMessage("Error signing up");
                
            }
        }
    };

    const resetForm = () => {
        SignUpForm({
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: ''
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
            <label>
                <input 
                type="text" 
                name="userName" 
                value={formData.userName} 
                onChange={handleChange}
                placeholder="Username" 
                required />
            </label>

            <label>
                <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="Email" 
                required />
            </label>
            <label>
                <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Password"
                required />
            </label>
            <ul>
                <li className={requirements.length ? 'valid' : 'invalid'}>
                    Password must be at least 8 characters long
                </li>
                <li className={requirements.upperLowerCase ? 'valid' : 'invalid'}>
                    Requires at least one uppercase letter & one lowercase letter
                </li>
                <li className={requirements.specialChar ? 'valid' : 'invalid'}>
                    Requires at least one special character
                </li>
                <li className={requirements.digit ? 'valid' : 'invalid'}>
                    Requires at least one digit
                </li>
            </ul>
            <label>
                <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="Confirm Password"
                required />
            </label>
            <ul>
                <li className={passwordsMatch ? 'valid' : 'invalid'}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </li>
            </ul>
            <label>
                <input 
                type="text" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                placeholder="Phone Number"
                required />
            </label>
            <button ><Link to="/login">Already have an account? Click here to log in</Link></button>
            <button type="submit" onClick={resetForm}>Sign Up</button>
        </form>
    );
};

export default SignUpForm;
