import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';  // For sanitization
import { registerApi } from '../config/axios'; // Import the configured axios instance
import '../Componentcss/sign_up_form.css';
import { Link, useNavigate } from 'react-router-dom';
import eyeOpenIcon from '../assets/password-visibility-icon.png';
import eyeCloseIcon from '../assets/password-visibility-icon-reverse.png';
import PrivacyPolicy from './Privacy&Terms/privacyPolicy';
import TermsOfService from './Privacy&Terms/termsOfService';


const Modal = ({ isVisible, content, onClose, requireScroll }) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(!requireScroll);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        console.log({ scrollTop, scrollHeight, clientHeight });
        if (scrollTop + clientHeight >= scrollHeight) {
            setHasScrolledToBottom(true);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={modalOverlayStyles}>
        <div style={modalStyles}>
            {/* Content with Scroll */}
            <div
                onScroll={handleScroll}
                style={contentStyles(requireScroll)}
            >
                {content}
            </div>

            {/* Scroll Prompt and Close Button - Only show if requireScroll is true */}
            {requireScroll && (
                <div>
                    {!hasScrolledToBottom && (
                        <p style={scrollPromptStyles}>
                            Please scroll to the bottom to enable the Close button.
                        </p>
                    )}
                    
                    {hasScrolledToBottom && (
                        <button
                            onClick={onClose}
                            style={closeButtonStyles}

                        >
                            Close
                        </button>
                    )}
                </div>
            )}

            {/* If no scroll requirement, show close button normally */}
            {!requireScroll && (
                <button
                    onClick={onClose}
                    style={closeButtonStyles}
                >
                    Close
                </button>
            )}
        </div>
    </div>
    );
};


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

    const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);
    const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [animationState, setAnimationState] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [userNameError, setUserNameError] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);  // State for toggling password visibility
    const [requirements, setRequirements] = useState({
        length: false,
        upperLowerCase: false,
        specialChar: false,
        digit: false
    });

    const areTermsAccepted = () => {
        return hasAcceptedPrivacyPolicy && hasAcceptedTermsOfService;
      };
      
      // ... rest of your component code
      
      <button
        type="submit"
        disabled={!areTermsAccepted()}
        style={{
          // ... button styles
        }}
      >
        {areTermsAccepted() ? 'Sign Up' : 'Please accept Terms and Conditions'}
      </button>

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);  // Toggle password visibility
        setAnimationState(!animationState); // Toggle between forward and reverse animations
    };

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
    const handleOpenModal = (content) => {
        setModalContent(content);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
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
                setRegisteredEmail(formData.email);
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
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            countryCode: '+1',
            isOptedInForPromotions: false, 
            isOptedInForEmailUpdates: false 
        });
    };

    return (
        <div style={{marginTop:'50%'}}>
            {emailSent ? (
    <div className="success-message" style={{color: 'black'}}>
    Registration successful! A verification email has been sent to your inbox: 
    <div className='user-email'>{registeredEmail}</div>
    Please check your inbox to verify your account.
    <p style={{backgroundColor:'black',color: 'white', padding:'10px' , borderRadius:'10px'}}>If this email is incorrect please sign up again</p>
</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {errorMessage && <div className="error-message" style={{padding:'20%'}}>{errorMessage}</div>}
                    <button style={{margin: '5px'}} ><Link to="/login">Already have an account? Click here to log in</Link></button>
                    <label className='username'>
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
                    
                    <label className='email'>
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
                            className='country-code'
                        >
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (Australia)</option>
                        </select>

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

                    {/* Password input with toggle visibility */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                            type={passwordVisible ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Password"
                            required 
                            style={{ paddingRight: '40px', height:'30px'}} 
                        />
                        <button 
                            type="button" 
                            onClick={togglePasswordVisibility} 
                            style={{
                                position: 'absolute',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',

                            }}
                        >
                            <img
                                className='visibility-animation'
                                src={animationState ? eyeCloseIcon : eyeOpenIcon} // Toggle between icons
                                alt="Toggle Password Visibility"
                                style={{ width: '24px', height: '24px' }}
                            />
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
                    <input 
                        type={passwordVisible ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm Password"
                        required 
                        style={{ height:'30px',paddingRight: '40px', marginTop: '10px' }}
                    />

                    <div className='check-boxes' style={{ marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)', margin:'20px', padding:'2vw' }}>
                        <input 
                            type="checkbox" 
                            name="isOptedInForPromotions" 
                            checked={formData.isOptedInForPromotions} 
                            onChange={handleChange} 
                            id="optInPromotions"
                        />
                        <label htmlFor="optInPromotions" className="opt-in-description"><p>Opt-in for Promotions</p></label>
                    </div>

                    <div className='check-boxes' style={{ marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)', margin:'20px', padding:'2vw' }}>
                        <input 
                            type="checkbox" 
                            name="isOptedInForEmailUpdates" 
                            checked={formData.isOptedInForEmailUpdates} 
                            onChange={handleChange} 
                            id="optInEmailUpdates"
                        />
                        <label htmlFor="optInEmailUpdates" className="opt-in-description">
                           
                            <p>Opt-in for Email Updates (This includes tracking updates)</p>
                            
                        </label>
                        
                    </div>
                    
                   
                    
                    <Modal isVisible={isModalVisible} content={modalContent} onClose={handleCloseModal} />

                    <div style={{ marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)', margin:'20px', padding:'2vw' }}>
                    <div className="check-boxes">
                        <input
                            type="checkbox"
                            name="hasAcceptedPrivacyPolicy"
                            checked={hasAcceptedPrivacyPolicy}
                            onChange={(e) => setHasAcceptedPrivacyPolicy(e.target.checked)}
                            id="acceptPrivacyPolicy"
                            className="toggle-input"
                        />
                        <label htmlFor="acceptPrivacyPolicy" className="toggle-label">
                            <p style={{color:'black'}}>I have read and agree to the </p>
                            <div onClick={() => handleOpenModal(<PrivacyPolicy />)} style={linkStyles}>
                                Privacy Policy
                            </div>
                            
                        </label>
                    </div>
                    </div>
                    <div style={{ marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)', margin:'20px', padding:'2vw' }}>
                    <div className="check-boxes">
                        <input
                            type="checkbox"
                            name="hasAcceptedTermsOfService"
                            checked={hasAcceptedTermsOfService}
                            onChange={(e) => setHasAcceptedTermsOfService(e.target.checked)}
                            id="acceptTermsOfService"
                            className="toggle-input"
                        />
                        <label htmlFor="acceptTermsOfService" className="toggle-label">
                            <p style={{color:'black'}}>I have read and agree to the </p>
                            <div onClick={() => handleOpenModal(<TermsOfService />)} style={linkStyles}>
                                Terms of Service
                            </div>
                            .
                        </label>
                    </div>
                    </div>

                    <button
    type="submit"
    disabled={!hasAcceptedPrivacyPolicy || !hasAcceptedTermsOfService}
    className="signup-button"
>
    {hasAcceptedPrivacyPolicy && hasAcceptedTermsOfService
        ? 'Sign Up'
        : 'Accept Terms and Conditions'}
</button>
                </form>
            )}
        </div>
    );
};

export default SignUpForm;

const modalOverlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalStyles = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    width: '120%',
    position: 'relative',
};
const buttonStyles = {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    width: '100%',
};

const modalCloseButtonStyles = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
};

const modalContentStyles = {
    fontSize: '1.2rem',
    lineHeight: '1.6',
};

const linkStyles = {
    color: 'white',
    backgroundColor: '#007BFF',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding:'10px'
};
const closeButtonStyles = {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    padding: '0.5rem',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    disabled: {
        backgroundColor: 'grey',
        cursor: 'not-allowed',
    },
};


const contentStyles = (requireScroll) => ({
    maxHeight: requireScroll ? '300px' : 'auto',
    overflowY: requireScroll ? 'scroll' : 'visible',
    padding: '1rem',
    marginBottom: '2rem',
    border: '1px solid #ddd',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    lineHeight: '1.5',
});

const scrollPromptStyles = {
    fontSize: '0.9rem',
    color: '#888',
    textAlign: 'center',
};
const headerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    zIndex: 10,
};


