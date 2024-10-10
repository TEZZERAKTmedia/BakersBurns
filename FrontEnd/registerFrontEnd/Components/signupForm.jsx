import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';  // For sanitization
import { registerApi } from '../config/axios'; // Import the configured axios instance
import '../Componentcss/sign_up_form.css';
import { Link, useNavigate } from 'react-router-dom';

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        countryCode: '+1',  // Default country code (US)
        isOptedInForPromotions: false, 
        isOptedInForEmailUpdates: false 
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [userNameError, setUserNameError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);  // State for toggling password visibility
    const [requirements, setRequirements] = useState({
        length: false,
        upperLowerCase: false,
        specialChar: false,
        digit: false
    });

    const navigate = useNavigate();

    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/[^\d]/g, ''); // Remove non-numeric characters
        if (phoneNumber.length < 4) return phoneNumber;
        if (phoneNumber.length < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const handlePhoneChange = (e) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setFormData({
            ...formData,
            phoneNumber: formattedPhoneNumber
        });
    };

    useEffect(() => {
        const length = formData.password.length >= 8;
        const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password);
        const specialChar = /(?=.*[@$!%*?&-])/.test(formData.password);
        const digit = /(?=.*\d)/.test(formData.password);

        setRequirements({
            length,
            upperLowerCase,
            specialChar,
            digit
        });
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
    
        const passwordValid = requirements.length && requirements.upperLowerCase && requirements.specialChar && requirements.digit;
        if (!passwordValid) {
            setErrorMessage("Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character (including dash '-').");
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage("Please enter a valid email address");
            return;
        }
    
        try {
            const sanitizedUserName = DOMPurify.sanitize(formData.userName);
            const sanitizedEmail = DOMPurify.sanitize(formData.email);
            const sanitizedPhoneNumber = DOMPurify.sanitize(formData.phoneNumber);

            const response = await registerApi.post('/sign-up', {
                userName: sanitizedUserName,
                email: sanitizedEmail,
                password: formData.password,
                phoneNumber: `${formData.countryCode} ${sanitizedPhoneNumber}`, // Combine country code and phone number
                isOptedInForPromotions: formData.isOptedInForPromotions,
                isOptedInForEmailUpdates: formData.isOptedInForEmailUpdates,
                actionType: 'sign-up'
            });
    
            if (response.status === 200) {
                setEmailSent(true);
                resetForm();
            } else {
                setErrorMessage(response.data.message || 'Error during registration.');
            }
        } catch (error) {
            console.error("There was an error signing up!", error);
            if (error.response) {
                setErrorMessage(error.response.data.message || "Error signing up");
            } else {
                setErrorMessage("Error signing up");
            }
        }
    };
	    const checkUsername = async () => {
        try {
            const response = await registerApi.post('/sign-up/check-username', { userName: formData.userName });
            setUserNameError('');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setUserNameError('Username is already taken');
            } else {
                setUserNameError('Error checking username');
            }
        }
    };



    const resetForm = () => {
        setFormData({
            userName:'',
            email:'',
            password:'',
            confirmPassword:'',
            phoneNumber:'',
            countryCode: '+1',
            isOptedInForPromotions: false, 
            isOptedInForEmailUpdates: false 
        });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);  // Toggle visibility
    };

    return (
        <div>
            {emailSent ? (
                <div className="success-message">
                    Registration successful! A verification email has been sent to {formData.email}. Please check your inbox to verify your account.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <label>
                        <input 
                        type="text" 
                        name="userName" 
                        value={formData.userName} 
                        onChange={handleChange}
			onBlur={checkUsername}
                        placeholder="Username" 
                        required />
                    </label>
                    {userNameError && <div className="error-message">{userNameError}</div>}
                    
                    <label>
                        <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        placeholder="Email" 
                        required />
                    </label>

                    {/* Group the country code dropdown and phone number input */}
                    <div className="phone-input-wrapper">
                        <select 
                            name="countryCode" 
                            value={formData.countryCode} 
                            onChange={handleChange}
                        >
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (Australia)</option>
                            {/* Add more country codes as needed */}
                        </select>

                        {/* Phone number input */}
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="Phone Number"
                            maxLength={14}  // Limiting to the format: (XXX) XXX-XXXX
                            required
                        />
                    </div>

                    {/* Password input with toggle visibility inside the input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                        type={passwordVisible ? 'text' : 'password'}  // Toggle between text and password
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Password"
                        required 
                        style={{ paddingRight: '40px' }}  // Add space for the eye icon
                        />
                        {/* Eye icon for toggling password visibility */}
                        <button 
                            type="button" 
                            onClick={togglePasswordVisibility} 
                            style={{
                                position: 'absolute',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {passwordVisible ? '🙈' : '👁️'} {/* Simple emoji for eye icon */}
                        </button>
                    </div>
                    
                    <ul>
                        <li className={requirements.length ? 'valid' : 'invalid'}>
                            Password must be at least 8 characters long
                        </li>
                        <li className={requirements.upperLowerCase ? 'valid' : 'invalid'}>
                            Requires at least one uppercase letter & one lowercase letter
                        </li>
                        <li className={requirements.specialChar ? 'valid' : 'invalid'}>
                            Requires at least one special character (including '-')
                        </li>
                        <li className={requirements.digit ? 'valid' : 'invalid'}>
                            Requires at least one digit
                        </li>
                    </ul>

                    {/* Confirm password input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                        type={passwordVisible ? 'text' : 'password'}  // Toggle here as well
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        placeholder="Confirm Password"
                        required 
                        style={{ paddingRight: '40px' }}  // Add space for the eye icon
                        />
                        <button 
                            type="button" 
                            onClick={togglePasswordVisibility} 
                            style={{
                                position: 'absolute',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {passwordVisible ? '🙈' : '👁️'} {/* Toggle visibility for confirm password */}
                        </button>
                    </div>

                    {/* Opt-in checkboxes */}
                    <div className='check-boxes'>
                        <input 
                            type="checkbox" 
                            name="isOptedInForPromotions" 
                            checked={formData.isOptedInForPromotions} 
                            onChange={handleChange} 
                            id="optInPromotions"
                        />
                        <label htmlFor="optInPromotions"><span style={{ color: 'black'}}>Opt-in for Promotions</span></label>
                    </div>

                    <div className='check-boxes'>
                        <input 
                            type="checkbox" 
                            name="isOptedInForEmailUpdates" 
                            checked={formData.isOptedInForEmailUpdates} 
                            onChange={handleChange} 
                            id="optInEmailUpdates"
                        />
                        <label htmlFor="optInEmailUpdates"><span style={{ color: 'black'}}>Opt-in for Email Updates (This includes tracking updates)</span></label>
                    </div>

                    <button style={{margin: '5px'}} ><Link to="/login">Already have an account? Click here to log in</Link></button>
                    <button type="submit">Sign Up</button>
                </form>
            )}
        </div>
    );
};

export default SignUpForm;

