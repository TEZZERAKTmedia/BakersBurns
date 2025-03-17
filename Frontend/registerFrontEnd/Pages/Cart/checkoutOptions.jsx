import React from "react";
import { useNavigate } from "react-router-dom";
import "./checkout_options.css"; // Import external CSS

const CheckoutOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-terms-container">
      <h2 className="cko-title">Checkout Options</h2>
      <p className="cko-description">How would you like to proceed?</p>
      <div className="cko-button-group">
        <button className="cko-button cko-guest" onClick={() => navigate("/accept-privacy-terms")}>
          Guest Checkout
        </button>
        <button className="cko-button cko-signup" onClick={() => navigate("/sign-up")}>
          Sign-Up
        </button>
        <button className="cko-button cko-login" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
};

export default CheckoutOptions;
