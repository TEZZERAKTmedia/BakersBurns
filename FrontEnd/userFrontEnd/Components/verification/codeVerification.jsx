import React, { useState } from "react";
import { userApi } from "../../config/axios";
import '../../Componentcss/verificationwrapper.css';

// This component handles both requesting and verifying a code
const VerificationWrapper = ({ actionType, children }) => {
  const [codeRequested, setCodeRequested] = useState(false);
  const [code, setCode] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(""); // Email to request a code (if applicable)
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [emailSubmitted, setEmailSubmitted] = useState(false); // To track if email was submitted once
  const [isVerified, setIsVerified] = useState(false); // State to track if verification was successful

  // Function to save the email to localStorage
  const storeEmailInLocalStorage = (email) => {
    if (email) {
      console.log("Storing email in localStorage: ", email);
      localStorage.setItem("email", email);
    } else {
      console.error("No email provided to store in localStorage.");
    }
  };

  // Function to initiate verification and request code simultaneously
  const initiateVerification = async (emailToSend) => {
    try {
      const currentPage = window.location.href;  // Capture the current page URL
      const response = await userApi.post('/verification/email', {
        email: emailToSend,
        actionType: 'verification-code',
        redirectUrl: currentPage // Send the current page to the backend
      });

      if (response.data.message) {
        setEmailSubmitted(true);  // Mark email as submitted
        setMessage('Verification code sent to your email.');
        console.log('Verification email sent');
      }
    } catch (error) {
      setMessage("Error initiating verification");
      console.error('Error initiating verification:', error);
    }
  };

  // Function to request a verification code from the backend
  const requestVerificationCode = async () => {
    if (!email && !emailSubmitted) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const emailToUse = emailSubmitted ? localStorage.getItem("email") : email;
      if (!emailSubmitted) {
        storeEmailInLocalStorage(email); // Store the email in local storage
      }
      await initiateVerification(emailToUse);
      setCodeRequested(true);
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
      const emailToUse = localStorage.getItem("email"); // Retrieve the stored email
      console.log("Using email for verification: ", emailToUse);

      const response = await userApi.get("/verification/code-verification", {
        params: {
          email: emailToUse, // Send the previously entered email
          token: verificationCode, // Send the entered 6-digit token
          actionType: 'verification-code'
        }
      });

      if (response.status === 200 && response.data.verified) {
        setMessage("Code verified successfully!");
        setIsVerified(true); // Mark the user as verified
      } else {
        setMessage("Invalid or expired code.");
      }
    } catch (error) {
      setMessage("Error verifying code.");
      console.error("Error verifying code:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!isVerified ? (
        <div>
          {!codeRequested ? (
            // Request Code Form
            <div>
              <h3>Request Verification Code</h3>
              {!emailSubmitted ? (
                <>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button onClick={requestVerificationCode} disabled={isSubmitting}>
                    {isSubmitting ? "Requesting..." : "Request Code"}
                  </button>
                </>
              ) : (
                <>
                  <p>Email already entered: {localStorage.getItem("email")}</p>
                  <button onClick={requestVerificationCode} disabled={isSubmitting}>
                    {isSubmitting ? "Resending..." : "Resend Code"}
                  </button>
                </>
              )}
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
        </div>
      ) : (
        // If verified, render the wrapped route (children) and display the stored email
        <>
          {children}
          <p>Verified Email: {localStorage.getItem("email")}</p>
        </>
      )}
    </div>
  );
};

export default VerificationWrapper;
