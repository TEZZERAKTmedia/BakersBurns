import React, { useState } from "react";
import { userApi } from "../../config/axios";


// This component handles both requesting and verifying a code
const VerificationWrapper = ({ actionType, children, onVerified }) => {
  const [codeRequested, setCodeRequested] = useState(false);
  const [code, setCode] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(""); // Email to request a code (if applicable)
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Function to initiate verification and request code simultaneously
  const initiateVerification = async (email) => {
    try {
      const currentPage = window.location.href;  // Capture the current page URL
      const response = await userApi.post('/verification/email', {
        email,
        actionType: 'verification-code',
        redirectUrl: currentPage // Send the current page to the backend
      });

      if (response.data.message) {
        console.log('Verification email sent');
      }
    } catch (error) {
      console.error('Error initiating verification:', error);
    }
  };

  // Function to request a verification code from the backend
  const requestVerificationCode = async () => {
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await userApi.post("/auth/request-code", { email, actionType });
      if (response.status === 200) {
        setMessage("Verification code sent to your email.");
        setCodeRequested(true);
      } else {
        setMessage("Failed to send verification code.");
      }
    } catch (error) {
      setMessage("Error sending verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle code input change for each box
  const handleChange = (element, index) => {
    const value = element.target.value.replace(/[^0-9]/g, ""); // Only allow digits
    if (value) {
      let newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Automatically focus the next input field
      if (element.target.nextSibling) {
        element.target.nextSibling.focus();
      }
    }
  };

  // Handle code verification
  const verifyCode = async (e) => {
    e.preventDefault();
    const verificationCode = code.join(""); // Concatenate the 6 input fields

    if (verificationCode.length !== 6) {
      setMessage("Please complete the code.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await registerApi.post("/auth/verify-code", {
        email,
        token: verificationCode, // Assuming token is used for verification
      });

      if (response.status === 200) {
        setMessage("Code verified successfully!");
        onVerified(); // Call the function passed as props after successful verification
      } else {
        setMessage("Invalid code.");
      }
    } catch (error) {
      setMessage("Error verifying code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!codeRequested ? (
        // Request Code Form
        <div>
          <h3>Request Verification Code</h3>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button onClick={() => {
            initiateVerification(email); // Pass email to the function
            requestVerificationCode();
          }} disabled={isSubmitting}>
            {isSubmitting ? "Requesting..." : "Request Code"}
          </button>
        </div>
      ) : (
        // Code Input Form
        <form onSubmit={verifyCode}>
          <h3>Enter Verification Code</h3>
          <div className="code-verification">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                maxLength={1}
                required
                className="code-box"
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      )}
      {message && <p>{message}</p>}
      {/* After verification, the children component will be rendered */}
      {children}
    </div>
  );
};

export default VerificationWrapper;
