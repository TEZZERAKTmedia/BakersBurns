import React, { useState } from "react";
import { userApi } from "../../config/axios";
import { useNotification } from "../notification/notification"; // Import notification context
import LoadingPage from "../loading"; // Import your loading page component
import { Link} from "react-router-dom";
import '../../Componentcss/verificationwrapper.css';

const VerificationWrapper = ({ children }) => {
  const [codeRequested, setCodeRequested] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for showing the loading page
  const { showNotification } = useNotification(); // Use notification context

  // Request Verification Code
  const requestVerificationCode = async () => {
    try {
      setIsSubmitting(true);
      setIsLoading(true); // Show the loading page
      const currentPage = window.location.href;

      const response = await userApi.post('/verification/email', {
        actionType: 'verification-code',
        redirectUrl: currentPage,
      });

      if (response.data.message) {
        showNotification(`Verification code sent to ${response.data.email}.`, "success");
        setTimeout(() => {
          setCodeRequested(true);
          setIsLoading(false); // Hide the loading page after 10 seconds
        }, 5000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error initiating verification.";
      showNotification(errorMessage, "error");
      setIsLoading(false); // Stop loading on error
      console.error('Error initiating verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify Code
  const verifyCode = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      showNotification("Please enter a 6-digit code.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await userApi.get("/verification/code-verification", {
        params: {
          token: code,
          actionType: 'verification-code',
        },
      });

      if (response.status === 200 && response.data.verified) {
        showNotification("Code verified successfully!", "success");
        setIsVerified(true);
      } else {
        showNotification("Invalid or expired code.", "error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error verifying code.";
      showNotification(errorMessage, "error");
      console.error("Error verifying code:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if(isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="container" style={{ color: 'black' }}>
      {isLoading ? (
        <LoadingPage />
        
      ) : (
        !isVerified ? (
          <div className="verification-wrapper">
                      <div className="settings-sections">
          <h2>Legal</h2>
          <ul>
              <li>
                  <Link to="/terms-of-service" className="settings-link">Terms of Service</Link>
              </li>
              <li>
                  <Link to="/privacy-policy" className="settings-link">Privacy Policy</Link>
              </li>
          </ul>
      </div>
            {!codeRequested ? (
              <div className="form">

                <h3>Request Verification Code</h3>
                <p>To access sensitive settings and to change passwords you must request a verificaiton code.</p>
                <button onClick={requestVerificationCode} disabled={isSubmitting}>
                  {isSubmitting ? "Requesting..." : "Request Code"}
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={verifyCode} className="form">
                  <h3 style={{ fontSize: '2rem' }}>Enter Verification Code</h3>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit code"
                    className="code-input"
                    autoComplete="one-time-code"
                  />
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Verifying..." : "Verify Code"}
                  </button>
                </form>
                <button
                  onClick={requestVerificationCode}
                  disabled={isSubmitting}
                  className="resend-button"
                  style={{
                    marginTop: "1rem",
                    padding: "10px 20px",
                    backgroundColor: "#1a73e8",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Resending..." : "Resend Code"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="settings-sections">
          <h2>Legal</h2>
          <ul>
              <li>
                  <Link to="/terms-of-service" className="settings-link">Terms of Service</Link>
              </li>
              <li>
                  <Link to="/privacy-policy" className="settings-link">Privacy Policy</Link>
              </li>
          </ul>
      </div>
        )
      )}
      {message && <p>{message}</p>}
      
    </div>
  );
};

export default VerificationWrapper;
