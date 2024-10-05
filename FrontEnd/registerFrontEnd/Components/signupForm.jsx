import React, { useState, useEffect } from 'react';
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
        isOptedInForPromotions: false, // Add opt-in state
        isOptedInForEmailUpdates: false // Add opt-in state
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [emailSent, setEmailSent] = useState(false);  // State to track email confirmation
    const [userNameError, setUserNameError] = useState('');
    const [requirements, setRequirements] = useState({
        length: false,
        upperLowerCase: false,
        specialChar: false,
        digit: false
    });

    const navigate = useNavigate(); // To navigate between pages

    const checkUserName = async () => {
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Update form data for checkboxes and other inputs
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Simplified password validation without Apple-style rules
    useEffect(() => {
        const length = formData.password.length >= 8;
        const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password);
        const specialChar = /(?=.*[@$!%*?&-])/.test(formData.password); // Add `-` to special char check
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
    
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
    
        // Ensure password meets requirements
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
            // Step 1: Send registration data, which includes sending the verification email
            const response = await registerApi.post('/sign-up', {
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                isOptedInForPromotions: formData.isOptedInForPromotions, // Pass the opt-in value
                isOptedInForEmailUpdates: formData.isOptedInForEmailUpdates, // Pass the opt-in value
                actionType: 'sign-up' // Pass actionType for email verification
            });
    
            if (response.status === 200) {
                setEmailSent(true); // Indicate that the email was sent successfully
                resetForm(); // Reset the form after successful registration
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

    const resetForm = () => {
        setFormData({
            userName:'',
            email:'',
            password:'',
            confirmPassword:'',
            phoneNumber:'',
            isOptedInForPromotions: false, // Reset opt-in state
            isOptedInForEmailUpdates: false // Reset opt-in state
        });
    };

    return (
        <div>
            {emailSent ? (
                <div className="success-message">
                    Registration successful! A verification email has been sent to {formData.email}. Please check your inbox to verify your account.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
                    <label>
                        <input 
                        type="text" 
                        name="userName" 
                        value={formData.userName} 
                        onChange={handleChange}
                        onBlur={checkUserName}
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
                            Requires at least one special character (including '-')
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
                    <label>
                        <input 
                        type="text" 
                        name="phoneNumber" 
                        value={formData.phoneNumber} 
                        onChange={handleChange} 
                        placeholder="Phone Number"
                        required />
                    </label>

                    {/* Checkboxes for Opt-ins */}
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
